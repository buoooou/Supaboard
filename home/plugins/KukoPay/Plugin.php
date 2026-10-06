<?php

namespace Plugin\KukoPay;

use App\Services\Plugin\AbstractPlugin;
use App\Contracts\PaymentInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Plugin extends AbstractPlugin implements PaymentInterface
{
    private const API_BASE = 'https://api.kukopay.com/v1';

    // 拒绝超过 5 分钟的签名时间戳，防重放
    private const SIGNATURE_TOLERANCE = 300;

    public function boot(): void
    {
        $this->filter('available_payment_methods', function ($methods) {
            if ($this->getConfig('enabled', true)) {
                $methods['KukoPay'] = [
                    'name' => $this->getConfig('display_name', 'KukoPay'),
                    'icon' => $this->getConfig('icon', '💳'),
                    'plugin_code' => $this->getPluginCode(),
                    'type' => 'plugin'
                ];
            }
            return $methods;
        });
    }

    public function form(): array
    {
        return [
            'api_key' => [
                'label' => 'API Key',
                'type' => 'text',
                'description' => 'kuko_live_... 为正式环境，kuko_test_... 为沙箱',
                'required' => true
            ],
            'webhook_secret' => [
                'label' => 'Webhook 签名密钥',
                'type' => 'text',
                'description' => '商户后台「开发者 → Webhook」中的签名密钥',
                'required' => true
            ],
            'currency' => [
                'label' => '货币单位',
                'type' => 'string',
                'description' => 'USD / HKD / CNY，正式环境仅限平台为你开通的币种',
                'default' => 'HKD',
                'required' => true
            ],
            'exchange_rate' => [
                'label' => '汇率',
                'type' => 'string',
                'description' => '订单金额 × 汇率 = 实际收款金额。站点币种与收款币种一致时填 1',
                'default' => '1',
                'required' => false
            ],
            'locale' => [
                'label' => '收银台语言',
                'type' => 'string',
                'description' => 'zh / en，留空则跟随买家浏览器',
                'default' => 'zh',
                'required' => false
            ]
        ];
    }

    public function pay($order): array
    {
        $exchangeRate = (float) ($this->getConfig('exchange_rate', '1') ?: 1);

        $params = [
            'amount' => (int) round($order['total_amount'] * $exchangeRate),
            'out_trade_no' => $order['trade_no'],
            'currency' => strtoupper($this->getConfig('currency', 'HKD')),
            'subject' => admin_setting('app_name', 'XBoard') . ' - 订阅',
            'return_url' => $order['return_url'],
        ];

        // notify_url 必须是公网 HTTPS；否则省略，回落到商户后台配置的 Webhook 地址
        if (!empty($order['notify_url']) && str_starts_with($order['notify_url'], 'https://')) {
            $params['notify_url'] = $order['notify_url'];
        }

        $locale = $this->getConfig('locale');
        if (in_array($locale, ['zh', 'en'], true)) {
            $params['locale'] = $locale;
        }

        try {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->getConfig('api_key'),
                'Idempotency-Key' => 'order_' . $order['trade_no'],
            ])
                ->acceptJson()
                ->timeout(15)
                ->post(self::API_BASE . '/orders', $params);
        } catch (\Exception $e) {
            throw new \Exception('KukoPay 请求失败: ' . $e->getMessage());
        }

        $checkoutUrl = $response->json('data.checkout_url');
        if (!$response->successful() || !$checkoutUrl) {
            Log::error('KukoPay create order failed', [
                'trade_no' => $order['trade_no'],
                'status' => $response->status(),
                'request_id' => $response->json('request_id'),
                'body' => $response->body(),
            ]);
            throw new \Exception($response->json('message') ?: 'KukoPay 下单失败');
        }

        return [
            'type' => 1,
            'data' => $checkoutUrl
        ];
    }

    public function notify($params): array|bool
    {
        $payload = request()->getContent();
        $signature = (string) request()->header('X-KukoPay-Signature', '');

        if (!$this->verifySignature($payload, $signature, $this->getConfig('webhook_secret'))) {
            return false;
        }

        $event = json_decode($payload, true);
        if (!is_array($event)) {
            return false;
        }

        // 后台「发送测试回调」带 test: true，只确认接收，不履约
        if (!empty($event['test'])) {
            return true;
        }

        $object = $event['data']['object'] ?? [];
        if (($event['type'] ?? null) === 'payment.succeeded' && ($object['status'] ?? null) === 'paid') {
            return [
                'trade_no' => $object['out_trade_no'],
                'callback_no' => $object['trade_no']
            ];
        }

        return true;
    }

    private function verifySignature(string $payload, string $header, ?string $secret): bool
    {
        if (!$secret || $header === '') {
            return false;
        }

        $timestamp = null;
        $received = [];
        foreach (explode(',', $header) as $item) {
            [$key, $value] = array_pad(explode('=', trim($item), 2), 2, null);
            if ($key === 't') {
                $timestamp = $value;
            } elseif ($key === 'v1') {
                // 密钥轮换期间会同时带新旧两个 v1
                $received[] = $value;
            }
        }

        if ($timestamp === null || $received === []) {
            return false;
        }
        if (abs(time() - (int) $timestamp) > self::SIGNATURE_TOLERANCE) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
        foreach ($received as $candidate) {
            if (hash_equals($expected, (string) $candidate)) {
                return true;
            }
        }
        return false;
    }
}

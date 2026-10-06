<?php

namespace Plugin\StalwartMarketing\Controllers;

use App\Http\Controllers\PluginController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Plugin\StalwartMarketing\Services\StalwartJmapMailer;

class AdminController extends PluginController
{
    public function panel()
    {
        return view('StalwartMarketing::admin.index', [
            'enabled' => true,
            'from_email' => '',
            'from_name' => '',
            'batch_size' => (int) $this->getConfig('batch_size', 20),
            'base_url' => '由插件配置读取',
            'account_id' => '',
            'identity_id' => '',
            'draft_mailbox_id' => '',
        ]);
    }

    public function config()
    {
        if ($error = $this->beforePluginAction()) {
            return $error[1];
        }

        return $this->success($this->panelConfig());
    }

    public function index()
    {
        $data = $this->panelConfig();

        if (function_exists('view') && view()->exists('StalwartMarketing::admin.index')) {
            return view('StalwartMarketing::admin.index', $data);
        }

        return $this->success($data);
    }

    public function test(Request $request)
    {
        if ($error = $this->beforePluginAction()) {
            return $error[1];
        }

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        return $this->sendPayload([
            'recipients' => [$request->input('email')],
            'subject' => 'StalwartMarketing test email',
            'text' => 'If you received this message, StalwartMarketing can send mail through your Stalwart JMAP API.',
            'html' => '<p>If you received this message, <strong>StalwartMarketing</strong> can send mail through your Stalwart JMAP API.</p>',
            'from_email' => $this->getConfig('from_email', ''),
            'from_name' => $this->getConfig('from_name', ''),
            'reply_to' => $this->getConfig('reply_to', ''),
        ]);
    }

    public function send(Request $request)
    {
        if ($error = $this->beforePluginAction()) {
            return $error[1];
        }

        $maxCampaignRecipients = max(1, (int) $this->getConfig('max_send_recipients', 500));

        $request->validate([
            'recipients' => ['nullable'],
            'recipient_source' => ['nullable', 'string'],
            'target_status' => ['nullable', 'string'],
            'target_keyword' => ['nullable', 'string', 'max:120'],
            'target_limit' => ['nullable', 'integer', 'min:1'],
            'target_offset' => ['nullable', 'integer', 'min:0'],
            'subject' => ['required', 'string', 'max:255'],
            'html' => ['nullable', 'string'],
            'text' => ['nullable', 'string'],
            'from' => ['nullable', 'string', 'max:255'],
            'from_email' => ['nullable', 'email'],
            'from_name' => ['nullable', 'string', 'max:120'],
            'reply_to' => ['nullable', 'email'],
            'headers' => ['nullable', 'array'],
            'message_id' => ['nullable', 'string', 'max:255'],
            'dry_run' => ['nullable', 'boolean'],
        ]);

        $recipients = $request->input('recipient_source') === 'system'
            ? $this->systemRecipientUsers($request)
            : $this->parseRecipients($request->input('recipients'));

        if (empty($recipients)) {
            return $this->fail([422, 'No valid recipient emails found.']);
        }

        if (count($recipients) > $maxCampaignRecipients) {
            return $this->fail([422, "Too many recipients. Current max_send_recipients allows {$maxCampaignRecipients} recipients per request."]);
        }

        $html = $request->input('html');
        $text = $request->input('text');

        if (empty($html) && !empty($text)) {
            $html = $this->buildHtmlTemplate($request->input('subject'), $text);
        }

        if (empty($html) && empty($text)) {
            return $this->fail([422, '邮件内容不能为空。']);
        }

        $subject = $request->input('subject');
        
        $appName = config('v2board.app_name', 'SupaBoard');
        $appUrl = config('v2board.app_url', url('/'));
        $now = date('Y-m-d H:i:s');
        
        $personalizedRecipients = [];
        foreach ($recipients as $recipient) {
            if (is_array($recipient) && isset($recipient['user'])) {
                $user = $recipient['user'];
                $email = $recipient['email'];
                
                $vars = [
                    '{{app.name}}' => $appName,
                    '{{app.url}}' => $appUrl,
                    '{{now}}' => $now,
                    '{{user.id}}' => $user->id,
                    '{{user.email}}' => $user->email,
                    '{{user.uuid}}' => $user->uuid ?? '',
                    '{{user.plan_name}}' => $user->plan->name ?? '无套餐',
                    '{{user.expired_at}}' => $user->expired_at ? date('Y-m-d H:i:s', $user->expired_at) : '长期有效',
                    '{{user.transfer_enable}}' => $user->transfer_enable ?? 0,
                    '{{user.transfer_used}}' => ($user->u ?? 0) + ($user->d ?? 0),
                    '{{user.transfer_left}}' => max(0, ($user->transfer_enable ?? 0) - (($user->u ?? 0) + ($user->d ?? 0))),
                ];
                
                $personalizedRecipients[] = [
                    'email' => $email,
                    'subject' => strtr($subject, $vars),
                    'html' => strtr($html, $vars),
                    'text' => strtr($text, $vars),
                ];
            } else {
                $email = is_array($recipient) ? $recipient['email'] : $recipient;
                
                $vars = [
                    '{{app.name}}' => $appName,
                    '{{app.url}}' => $appUrl,
                    '{{now}}' => $now,
                    '{{user.email}}' => $email,
                ];
                
                $personalizedRecipients[] = [
                    'email' => $email,
                    'subject' => strtr($subject, $vars),
                    'html' => strtr($html, $vars),
                    'text' => strtr($text, $vars),
                ];
            }
        }

        return $this->sendPayload([
            'recipients' => $personalizedRecipients,
            'subject' => $subject,
            'html' => $html,
            'text' => $text,
            'from' => $request->input('from'),
            'from_email' => $request->input('from_email'),
            'from_name' => $request->input('from_name'),
            'reply_to' => $request->input('reply_to'),
            'headers' => $request->input('headers', []),
            'message_id' => $request->input('message_id'),
            'dry_run' => (bool) $request->boolean('dry_run'),
        ]);
    }

    public function recipients(Request $request)
    {
        if ($error = $this->beforePluginAction()) {
            return $error[1];
        }

        $request->validate([
            'status' => ['nullable', 'string'],
            'keyword' => ['nullable', 'string', 'max:120'],
            'limit' => ['nullable', 'integer', 'min:1'],
            'offset' => ['nullable', 'integer', 'min:0'],
        ]);

        $limit = min(max(1, (int) $request->input('limit', 100)), 1000);
        $offset = max(0, (int) $request->input('offset', 0));
        $query = $this->userQuery($request);
        $countQuery = clone $query;
        $users = $query
            ->orderBy('id', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return $this->success([
            'total' => $countQuery->count(),
            'limit' => $limit,
            'emails' => $users->pluck('email')->values(),
            'users' => $users->map(fn ($user) => $this->formatRecipientUser($user))->values(),
        ]);
    }

    protected function sendPayload(array $payload)
    {
        try {
            $mailer = new StalwartJmapMailer($this->pluginConfig());
            $recipients = $payload['recipients'] ?? [];
            $batchSize = max(1, (int) $this->getConfig('batch_size', 20));

            if (!empty($payload['dry_run'])) {
                $result = $mailer->sendBatch($payload);
                return $this->success($result);
            }

            $results = [];

            foreach (array_chunk($recipients, $batchSize) as $chunk) {
                $chunkResult = $mailer->sendBatch(array_merge($payload, [
                    'recipients' => $chunk,
                ]));
                $results = array_merge($results, $chunkResult['results'] ?? []);
            }

            $result = [
                'accepted' => count(array_filter($results, fn ($row) => ($row['status'] ?? '') === 'sent')),
                'failed' => count(array_filter($results, fn ($row) => ($row['status'] ?? '') !== 'sent')),
                'results' => $results,
            ];

            return $this->success($result);
        } catch (\Throwable $e) {
            Log::error('StalwartMarketing send failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->fail([500, $e->getMessage()]);
        }
    }

    protected function pluginConfig(): array
    {
        return [
            'base_url' => $this->getConfig('base_url', ''),
            'auth_type' => $this->getConfig('auth_type', 'basic'),
            'username' => $this->getConfig('username', ''),
            'password' => $this->getConfig('password', ''),
            'bearer_token' => $this->getConfig('bearer_token', ''),
            'account_id' => $this->getConfig('account_id', ''),
            'identity_id' => $this->getConfig('identity_id', ''),
            'draft_mailbox_id' => $this->getConfig('draft_mailbox_id', ''),
            'from_email' => $this->getConfig('from_email', ''),
            'from_name' => $this->getConfig('from_name', ''),
            'reply_to' => $this->getConfig('reply_to', ''),
            'delay_ms' => (int) $this->getConfig('delay_ms', 200),
            'timeout' => (int) $this->getConfig('timeout', 30),
        ];
    }

    protected function panelConfig(): array
    {
        return [
            'enabled' => $this->isPluginEnabled(),
            'from_email' => $this->getConfig('from_email', ''),
            'from_name' => $this->getConfig('from_name', ''),
            'batch_size' => (int) $this->getConfig('batch_size', 20),
            'max_send_recipients' => (int) $this->getConfig('max_send_recipients', 500),
            'base_url' => $this->getConfig('base_url', ''),
            'account_id' => $this->getConfig('account_id', ''),
            'identity_id' => $this->getConfig('identity_id', ''),
            'draft_mailbox_id' => $this->getConfig('draft_mailbox_id', ''),
        ];
    }

    protected function systemRecipientUsers(Request $request): array
    {
        $limit = min(
            max(1, (int) $request->input('target_limit', $this->getConfig('max_send_recipients', 500))),
            max(1, (int) $this->getConfig('max_send_recipients', 500))
        );
        $offset = max(0, (int) $request->input('target_offset', 0));

        $users = $this->userQuery(
            $request,
            'target_'
        )
            ->with('plan')
            ->orderBy('id', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();
            
        $recipients = [];
        foreach ($users as $user) {
            $recipients[] = [
                'email' => $user->email,
                'user' => $user,
            ];
        }
        
        return $recipients;
    }

    protected function userQuery(Request $request, string $prefix = '')
    {
        $now = time();
        $status = (string) $request->input($prefix . 'status', 'subscribed');
        $keyword = (string) $request->input($prefix . 'keyword', '');
        $query = User::query()
            ->with('plan:id,name')
            ->select([
                'id',
                'email',
                'plan_id',
                'expired_at',
                'banned',
                'transfer_enable',
                'u',
                'd',
                'last_login_at',
                'last_login_ip',
                'created_at',
            ]);

        match ($status) {
            'subscribed' => $query->where('banned', 0)
                ->whereNotNull('plan_id')
                ->where(function ($builder) use ($now) {
                    $builder->whereNull('expired_at')->orWhere('expired_at', '>', $now);
                }),
            'free' => $query->where('banned', 0)->whereNull('plan_id'),
            'expired' => $query->where('banned', 0)
                ->whereNotNull('plan_id')
                ->whereNotNull('expired_at')
                ->where('expired_at', '<=', $now),
            'free_or_expired' => $query->where('banned', 0)
                ->where(function ($builder) use ($now) {
                    $builder->whereNull('plan_id')
                        ->orWhere(function ($subBuilder) use ($now) {
                            $subBuilder->whereNotNull('plan_id')
                                ->whereNotNull('expired_at')
                                ->where('expired_at', '<=', $now);
                        });
                }),
            'active' => $query->where('banned', 0)
                ->whereNotNull('plan_id')
                ->where(function ($builder) use ($now) {
                    $builder->whereNull('expired_at')->orWhere('expired_at', '>', $now);
                })
                ->whereRaw('(transfer_enable - (u + d)) > 0'),
            'banned' => $query->where('banned', 1),
            default => $query,
        };

        $keyword = trim($keyword);

        if ($keyword !== '') {
            $query->where(function ($builder) use ($keyword) {
                $builder->where('email', 'like', "%{$keyword}%")
                    ->orWhereHas('plan', function ($planQuery) use ($keyword) {
                        $planQuery->where('name', 'like', "%{$keyword}%");
                    });
            });
        }

        return $query;
    }

    protected function formatRecipientUser(User $user): array
    {
        $expiredAt = $user->expired_at ? (int) $user->expired_at : null;
        $usedTraffic = (int) ($user->u ?? 0) + (int) ($user->d ?? 0);
        $totalTraffic = (int) ($user->transfer_enable ?? 0);

        return [
            'id' => $user->id,
            'email' => $user->email,
            'plan' => $user->plan->name ?? '免费用户',
            'banned' => (bool) $user->banned,
            'expired_at' => $expiredAt ? date('Y-m-d H:i:s', $expiredAt) : '长期有效',
            'last_login_at' => $user->last_login_at ? date('Y-m-d H:i:s', (int) $user->last_login_at) : null,
            'last_login_ip' => $this->formatIntegerIp($user->last_login_ip),
            'remaining_traffic' => max(0, $totalTraffic - $usedTraffic),
            'created_at' => $user->created_at ? date('Y-m-d H:i:s', (int) $user->created_at) : null,
        ];
    }



    protected function formatIntegerIp(mixed $value): ?string
    {
        if ($value === null || $value === '' || (int) $value === 0) {
            return null;
        }

        $ip = long2ip((int) $value);

        return $ip ?: (string) $value;
    }



    protected function parseRecipients(mixed $value): array
    {
        if (is_array($value)) {
            $items = $value;
        } else {
            $items = preg_split('/[\s,;]+/', (string) $value) ?: [];
        }

        $emails = [];

        foreach ($items as $item) {
            $email = is_array($item) ? ($item['email'] ?? '') : $item;
            $email = strtolower(trim((string) $email));

            if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $emails[$email] = $email;
            }
        }

        return array_values($emails);
    }

    protected function buildHtmlTemplate(string $subject, string $content): string
    {
        $body = nl2br(htmlspecialchars($content));
        $year = date('Y');
        
        return <<<HTML
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{$subject}</title>
<style>
    body { margin: 0; padding: 0; background-color: #f7f8fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .header { background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
    .content { padding: 32px 24px; color: #334155; font-size: 15px; line-height: 1.7; }
    .footer { padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 13px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{$subject}</h1>
        </div>
        <div class="content">
            {$body}
        </div>
        <div class="footer">
            &copy; {$year} {$subject}. All rights reserved.
        </div>
    </div>
</body>
</html>
HTML;
    }
}

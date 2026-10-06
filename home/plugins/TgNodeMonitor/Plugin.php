<?php

namespace Plugin\TgNodeMonitor;

use App\Services\Plugin\AbstractPlugin;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Plugin extends AbstractPlugin
{
    /**
     * Path to the persistent alert state file.
     */
    private const STATE_FILE = 'plugins/tg_node_monitor_state.json';

    public function boot(): void
    {
        // No event listeners needed — runs via schedule()
    }

    /**
     * Schedule the node monitoring checks based on configuration.
     */
    public function schedule(Schedule $schedule): void
    {
        $interval = (int) $this->getConfig('check_interval', '15');

        $callback = $schedule->call(function () {
            try {
                $this->checkActiveNodes();
            } catch (\Throwable $e) {
                Log::error('TgNodeMonitor Scheduled Execution Error: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
            }
        });

        switch ($interval) {
            case 5:
                $callback->everyFiveMinutes();
                break;
            case 10:
                $callback->everyTenMinutes();
                break;
            case 30:
                $callback->everyThirtyMinutes();
                break;
            case 60:
                $callback->hourly();
                break;
            case 15:
            default:
                $callback->everyFifteenMinutes();
                break;
        }

        $callback->name('tg-node-monitor-check')->withoutOverlapping();
    }

    /**
     * Scan active nodes and verify Chinese connectivity via Globalping API.
     */
    public function checkActiveNodes(): void
    {
        Log::info('TgNodeMonitor: Starting active nodes check...');

        $botToken = $this->getConfig('tg_bot_token', '');
        $chatId = $this->getConfig('tg_chat_id', '');

        if (empty($botToken) || empty($chatId)) {
            Log::warning('TgNodeMonitor: Bot token or chat ID is empty, skipping check.');
            return;
        }

        $thresholdPercent = (int) $this->getConfig('fail_threshold_percent', '50');

        // Query active parent servers (skip child nodes with parent_id to avoid duplicates)
        $servers = DB::table('v2_server')
            ->where('show', 1)
            ->whereNotNull('host')
            ->where('host', '!=', '')
            ->where(function ($q) {
                $q->whereNull('parent_id')->orWhere('parent_id', 0);
            })
            ->get(['id', 'name', 'host', 'port', 'server_port']);

        Log::info("TgNodeMonitor: Found {$servers->count()} active parent servers to check.");

        if ($servers->isEmpty()) {
            Log::warning('TgNodeMonitor: No active servers found in v2_server table.');
            return;
        }

        $state = $this->loadState();

        foreach ($servers as $server) {
            // Determine the port that clients connect to
            $port = $server->port ?: ($server->server_port ?: 443);
            $port = (int) $port;

            Log::info("TgNodeMonitor: Checking node '{$server->name}' (ID: {$server->id}) at {$server->host}:{$port}");

            $results = $this->checkViaGlobalping($server->host, $port);

            if ($results === null) {
                Log::warning("TgNodeMonitor: Skipping node '{$server->name}' (ID: {$server->id}) — Globalping check returned null.");
                continue;
            }

            $chinaTotal = $results['total'];
            $chinaFailed = $results['failed'];
            $chinaDetails = $results['details'];

            if ($chinaTotal === 0) {
                Log::warning("TgNodeMonitor: No CN probes returned results for '{$server->name}' (ID: {$server->id}).");
                continue;
            }

            $failPercent = ($chinaFailed / $chinaTotal) * 100;
            $isFailed = $failPercent >= $thresholdPercent;
            $stateKey = "alerting:{$server->id}";
            $wasAlerting = isset($state[$stateKey]);

            Log::info("TgNodeMonitor: Node '{$server->name}' — CN: {$chinaFailed}/{$chinaTotal} failed ({$failPercent}%), threshold: {$thresholdPercent}%, wasAlerting: " . ($wasAlerting ? 'yes' : 'no'));
            Log::info("TgNodeMonitor: CN details — " . implode(', ', $chinaDetails));

            if ($isFailed) {
                if (!$wasAlerting) {
                    Log::info("TgNodeMonitor: 🚨 ALERT triggered for '{$server->name}' (ID: {$server->id})");
                    $this->sendTelegramAlert($botToken, $chatId, $server, $port, $chinaFailed, $chinaTotal, $failPercent, $chinaDetails);
                    $state[$stateKey] = time();
                } else {
                    Log::info("TgNodeMonitor: Node '{$server->name}' still failing, alert already sent.");
                }
            } else {
                if ($wasAlerting) {
                    Log::info("TgNodeMonitor: 🟢 RECOVERY triggered for '{$server->name}' (ID: {$server->id})");
                    $this->sendTelegramRecovery($botToken, $chatId, $server, $port, $chinaFailed, $chinaTotal, $failPercent);
                    unset($state[$stateKey]);
                } else {
                    Log::info("TgNodeMonitor: Node '{$server->name}' is healthy.");
                }
            }

            // Short delay between nodes to avoid Globalping rate limits
            sleep(2);
        }

        // Persist alert state & clean up entries older than 7 days
        $this->saveState($state);

        Log::info('TgNodeMonitor: Active nodes check completed.');
    }

    /**
     * Check node connectivity from China using the Globalping API.
     *
     * Flow:
     *   1. POST /v1/measurements to create a TCP ping measurement targeting CN probes
     *   2. Poll GET /v1/measurements/{id} until status is "finished"
     *   3. Parse per-probe results
     *
     * Returns ['total' => int, 'failed' => int, 'details' => string[]] or null on failure.
     */
    protected function checkViaGlobalping(string $host, int $port): ?array
    {
        $apiToken = $this->getConfig('globalping_token', '');
        $probeLimit = (int) $this->getConfig('cn_probe_limit', '5');

        try {
            // ── Step 1: Create measurement ──
            $headers = [
                'Content-Type' => 'application/json',
            ];
            if (!empty($apiToken)) {
                $headers['Authorization'] = "Bearer {$apiToken}";
            }

            $payload = [
                'type' => 'ping',
                'target' => $host,
                'locations' => [
                    ['country' => 'CN'],
                ],
                'measurementOptions' => [
                    'protocol' => 'TCP',
                    'port' => $port,
                    'packets' => 3,
                ],
                'limit' => $probeLimit,
            ];

            $createResp = Http::withHeaders($headers)
                ->timeout(15)
                ->post('https://api.globalping.io/v1/measurements', $payload);

            if (!$createResp->successful()) {
                Log::warning("TgNodeMonitor: Globalping create failed HTTP {$createResp->status()} for {$host}:{$port}: " . substr($createResp->body(), 0, 300));
                return null;
            }

            $measurementId = $createResp->json('id');
            if (empty($measurementId)) {
                Log::warning("TgNodeMonitor: Globalping returned no measurement ID for {$host}:{$port}");
                return null;
            }

            Log::info("TgNodeMonitor: Globalping measurement created for {$host}:{$port}, ID: {$measurementId}");

            // ── Step 2: Poll for results ──
            $maxPolls = 10;
            $results = null;

            for ($i = 0; $i < $maxPolls; $i++) {
                sleep(3);

                $pollResp = Http::withHeaders($headers)
                    ->timeout(15)
                    ->get("https://api.globalping.io/v1/measurements/{$measurementId}");

                if (!$pollResp->successful()) {
                    Log::warning("TgNodeMonitor: Globalping poll {$i} HTTP {$pollResp->status()} for {$host}:{$port}");
                    continue;
                }

                $data = $pollResp->json();
                $status = $data['status'] ?? '';

                if ($status === 'finished') {
                    $results = $data['results'] ?? [];
                    break;
                }

                if ($status === 'failed') {
                    Log::warning("TgNodeMonitor: Globalping measurement failed for {$host}:{$port}");
                    return null;
                }
            }

            if ($results === null || empty($results)) {
                Log::warning("TgNodeMonitor: Globalping no results after polling for {$host}:{$port}");
                return null;
            }

            // ── Step 3: Parse results ──
            $total = 0;
            $failed = 0;
            $details = [];

            foreach ($results as $probe) {
                $total++;
                $probeStatus = $probe['result']['status'] ?? 'unknown';
                $city = $probe['probe']['city'] ?? 'Unknown';
                $region = $probe['probe']['state'] ?? '';
                $location = $region ? "{$city}, {$region}" : $city;

                if ($probeStatus === 'finished') {
                    // Check if the TCP ping actually succeeded
                    $stats = $probe['result']['stats'] ?? [];
                    $rcv = $stats['rcv'] ?? 0;
                    $drop = $stats['drop'] ?? 0;
                    $avg = $stats['avg'] ?? 0;

                    if ($rcv > 0) {
                        $details[] = "CN({$location}): {$avg}ms (rcv:{$rcv})";
                    } else {
                        $failed++;
                        $details[] = "CN({$location}): FAILED (0 received)";
                    }
                } else {
                    $failed++;
                    $details[] = "CN({$location}): FAILED ({$probeStatus})";
                }
            }

            return [
                'total' => $total,
                'failed' => $failed,
                'details' => $details,
            ];

        } catch (\Throwable $e) {
            Log::error("TgNodeMonitor: Exception during Globalping check for {$host}:{$port}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Send Telegram Alert notification.
     */
    protected function sendTelegramAlert(
        string $botToken,
        string $chatId,
        $server,
        int $port,
        int $failed,
        int $total,
        float $failPercent,
        array $chinaDetails = []
    ): void {
        $percentStr = round($failPercent, 1);
        $text  = "🚨 *Node China Connectivity Alert*\n\n";
        $text .= "🖥 *Node*: `{$server->name}` (ID: {$server->id})\n";
        $text .= "🌐 *Address*: `{$server->host}:{$port}`\n";
        $text .= "📊 *Failure*: `{$failed}/{$total}` CN probes failed ({$percentStr}%)\n";
        $text .= "🕒 *Time*: `" . date('Y-m-d H:i:s') . "`\n\n";

        // Add per-probe details
        if (!empty($chinaDetails)) {
            $text .= "*Details:*\n";
            foreach ($chinaDetails as $detail) {
                $text .= "• `{$detail}`\n";
            }
        }

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        try {
            $resp = Http::timeout(8)->post($url, [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true,
            ]);
            Log::info("TgNodeMonitor: Alert TG sent for '{$server->name}', HTTP {$resp->status()}");
        } catch (\Throwable $e) {
            Log::error("TgNodeMonitor: Failed to send TG alert for '{$server->name}': " . $e->getMessage());
        }
    }

    /**
     * Send Telegram Recovery notification.
     */
    protected function sendTelegramRecovery(
        string $botToken,
        string $chatId,
        $server,
        int $port,
        int $failed,
        int $total,
        float $failPercent
    ): void {
        $percentStr = round($failPercent, 1);
        $text  = "🟢 *Node China Connectivity Recovered*\n\n";
        $text .= "🖥 *Node*: `{$server->name}` (ID: {$server->id})\n";
        $text .= "🌐 *Address*: `{$server->host}:{$port}`\n";
        $text .= "📊 *Status*: `{$failed}/{$total}` CN probes failed ({$percentStr}%)\n";
        $text .= "🕒 *Time*: `" . date('Y-m-d H:i:s') . "`\n\n";
        $text .= "✅ Node connectivity has returned to normal.";

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        try {
            $resp = Http::timeout(8)->post($url, [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true,
            ]);
            Log::info("TgNodeMonitor: Recovery TG sent for '{$server->name}', HTTP {$resp->status()}");
        } catch (\Throwable $e) {
            Log::error("TgNodeMonitor: Failed to send TG recovery for '{$server->name}': " . $e->getMessage());
        }
    }

    // ─── Persistent File-Based State ────────────────────────────────────

    /**
     * Load the alert state from JSON file.
     * Format: { "alerting:serverId": timestamp, ... }
     */
    protected function loadState(): array
    {
        $path = storage_path('app/' . self::STATE_FILE);

        if (!file_exists($path)) {
            return [];
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Save state to JSON file, cleaning up entries older than 7 days.
     */
    protected function saveState(array $state): void
    {
        // Remove stale alert entries older than 7 days
        $cutoff = time() - (7 * 86400);
        foreach ($state as $key => $timestamp) {
            if (is_int($timestamp) && $timestamp < $cutoff) {
                unset($state[$key]);
            }
        }

        $dir = dirname(storage_path('app/' . self::STATE_FILE));
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        file_put_contents(
            storage_path('app/' . self::STATE_FILE),
            json_encode($state, JSON_PRETTY_PRINT),
            LOCK_EX
        );
    }
}

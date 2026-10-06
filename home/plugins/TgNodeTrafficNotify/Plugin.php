<?php

namespace Plugin\TgNodeTrafficNotify;

use App\Services\Plugin\AbstractPlugin;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Plugin extends AbstractPlugin
{
    /**
     * Severity levels for each threshold tier.
     */
    private const SEVERITY = [
        80  => ['emoji' => '⚠️', 'label' => 'Warning'],
        90  => ['emoji' => '🔴', 'label' => 'Critical'],
        100 => ['emoji' => '🚨', 'label' => 'EXCEEDED'],
    ];

    /**
     * Path to the persistent notification state file.
     */
    private const STATE_FILE = 'plugins/tg_node_traffic_notified.json';

    public function boot(): void
    {
        // No event listeners — all logic runs via schedule()
    }

    public function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            $this->checkNodeTraffic();
        })->everyThirtyMinutes()->name('tg-node-traffic-notify-check')->withoutOverlapping();
    }

    protected function parseThresholds(): array
    {
        $raw = $this->getConfig('thresholds', '80,90,100');
        $values = array_map('floatval', array_filter(explode(',', $raw), 'strlen'));
        sort($values);
        return $values;
    }

    protected function checkNodeTraffic(): void
    {
        $botToken = $this->getConfig('tg_bot_token', '');
        $chatId = $this->getConfig('tg_chat_id', '');

        if (empty($botToken) || empty($chatId)) {
            return;
        }

        $thresholds = $this->parseThresholds();
        if (empty($thresholds)) {
            return;
        }

        try {
            // Read directly from v2_server table.
            // Fields confirmed from Xboard Server model:
            //   - transfer_enable: traffic limit in bytes (0 or null = unlimited)
            //   - u: current upload bytes
            //   - d: current download bytes
            $servers = DB::table('v2_server')
                ->select('id', 'name', 'u', 'd', 'transfer_enable')
                ->where('transfer_enable', '>', 0)
                ->get();

            // Month key for file-based dedup (resets automatically each month)
            $monthKey = date('Y-m');

            // Cold-start detection: if state file doesn't exist yet,
            // this is the first run — silently record baseline, don't notify.
            $isFirstRun = !file_exists(storage_path('app/' . self::STATE_FILE));
            $state = $this->loadState();

            if ($isFirstRun) {
                Log::info('TgNodeTrafficNotify: First run detected, initializing baseline state (no notifications will be sent).');
            }

            foreach ($servers as $server) {
                $totalBytes = ($server->u ?? 0) + ($server->d ?? 0);
                $limitBytes = (int) $server->transfer_enable;

                if ($limitBytes <= 0) {
                    continue;
                }

                $percent = ($totalBytes / $limitBytes) * 100;
                $serverName = $server->name ?? "Server #{$server->id}";

                // Walk through each threshold from low to high
                foreach ($thresholds as $level) {
                    if ($percent < $level) {
                        break; // Haven't reached this level yet
                    }

                    // State key unique per node + month + threshold level
                    $stateKey = "{$server->id}:{$monthKey}:{$level}";

                    if (isset($state[$monthKey][$stateKey])) {
                        continue; // Already notified for this level
                    }

                    // Only send notification after baseline is established (not first run)
                    if (!$isFirstRun) {
                        $this->sendNotification(
                            $botToken, $chatId,
                            $server->id, $serverName,
                            $totalBytes, $limitBytes,
                            $percent, $level
                        );
                    }

                    // Mark as notified (persistent — survives cache:clear)
                    $state[$monthKey][$stateKey] = time();
                }
            }

            // Persist updated state & clean up old months
            $this->saveState($state);
        } catch (\Throwable $e) {
            Log::error('TgNodeTrafficNotify Plugin Error: ' . $e->getMessage());
        }
    }

    protected function sendNotification(
        string $botToken,
        string $chatId,
        int $serverId,
        string $serverName,
        int $totalUsed,
        int $limit,
        float $actualPercent,
        float $thresholdLevel
    ): void {
        $usedGb = round($totalUsed / 1073741824, 2);
        $limitGb = round($limit / 1073741824, 2);
        $percentStr = round($actualPercent, 1);
        $month = date('Y-m');

        $severity = $this->getSeverity($thresholdLevel);
        $emoji = $severity['emoji'];
        $label = $severity['label'];
        $levelInt = (int) $thresholdLevel;

        $text = "{$emoji} *Node Traffic {$label} ({$levelInt}%)*\n\n";
        $text .= "🖥 *Node*: `{$serverName}` (ID: {$serverId})\n";
        $text .= "📊 *Usage*: `{$usedGb} GB` / `{$limitGb} GB` ({$percentStr}%)\n";
        $text .= "📅 *Month*: `{$month}`\n";
        $text .= "🕒 *Time*: `" . date('Y-m-d H:i:s') . "`";

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        Http::timeout(5)->post($url, [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'Markdown',
        ]);
    }

    protected function getSeverity(float $level): array
    {
        $matched = ['emoji' => '⚠️', 'label' => 'Warning'];
        foreach (self::SEVERITY as $threshold => $config) {
            if ($level >= $threshold) {
                $matched = $config;
            }
        }
        return $matched;
    }

    // ─── Persistent File-Based State ────────────────────────────────────

    /**
     * Load the notification state from JSON file.
     * Format: { "2026-06": { "serverId:2026-06:level": timestamp, ... }, ... }
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
     * Save state to JSON file, cleaning up months older than 2 months.
     */
    protected function saveState(array $state): void
    {
        $cutoff = date('Y-m', strtotime('-2 months'));
        foreach (array_keys($state) as $month) {
            if ($month < $cutoff) {
                unset($state[$month]);
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

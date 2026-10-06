<?php

namespace Plugin\TgTrafficNotify;

use App\Services\Plugin\AbstractPlugin;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Plugin extends AbstractPlugin
{
    /**
     * Notification thresholds (percentage of traffic limit).
     * Order matters: checked from highest to lowest so only the highest
     * un-notified level triggers per run.
     */
    private const THRESHOLDS = [
        100 => [
            'emoji'   => '🚨',
            'title'   => 'Traffic Exceeded',
            'message' => 'User has exceeded their traffic limit!',
        ],
        90 => [
            'emoji'   => '⚠️',
            'title'   => 'Traffic Warning (90%)',
            'message' => 'User is approaching their traffic limit.',
        ],
    ];

    /**
     * Path to the persistent notification state file.
     */
    private const STATE_FILE = 'plugins/tg_traffic_notified.json';

    public function boot(): void
    {
        // No event listeners needed — all logic runs via schedule()
    }

    /**
     * Periodically scan for users whose traffic has reached any threshold.
     * Uses a persistent JSON file to ensure each user is only notified once
     * per threshold level per billing cycle — survives cache:clear / restarts.
     */
    public function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            $this->checkTrafficThresholds();
        })->everyFiveMinutes()->name('tg-traffic-notify-check')->withoutOverlapping();
    }

    protected function checkTrafficThresholds(): void
    {
        $botToken = $this->getConfig('tg_bot_token', '');
        $chatId = $this->getConfig('tg_chat_id', '');

        if (empty($botToken) || empty($chatId)) {
            return;
        }

        // Lowest threshold percentage — only query users at or above this level
        $lowestThreshold = min(array_keys(self::THRESHOLDS));
        $ratio = $lowestThreshold / 100; // e.g. 0.9

        try {
            // Find users where (upload + download) >= lowest threshold % of their limit
            // transfer_enable > 0 filters out unlimited plans
            $users = DB::table('v2_user')
                ->select('id', 'email', 'u', 'd', 'transfer_enable')
                ->where('transfer_enable', '>', 0)
                ->whereRaw('(u + d) >= transfer_enable * ?', [$ratio])
                ->get();

            $billingCycle = date('Y-m');

            // Cold-start detection: if state file doesn't exist yet,
            // this is the first run — silently record baseline, don't notify.
            $isFirstRun = !file_exists(storage_path('app/' . self::STATE_FILE));
            $state = $this->loadState();

            if ($isFirstRun) {
                Log::info('TgTrafficNotify: First run detected, initializing baseline state (no notifications will be sent).');
            }

            foreach ($users as $user) {
                $totalUsed = $user->u + $user->d;
                $percent = ($totalUsed / $user->transfer_enable) * 100;

                // Check thresholds from highest to lowest
                // Only send the highest un-notified threshold
                $thresholds = self::THRESHOLDS;
                krsort($thresholds);

                foreach ($thresholds as $level => $meta) {
                    if ($percent < $level) {
                        continue;
                    }

                    $stateKey = "{$user->id}:{$level}";

                    // Skip if already notified for this level this cycle
                    if (isset($state[$billingCycle][$stateKey])) {
                        continue;
                    }

                    // Only send notification after baseline is established (not first run)
                    if (!$isFirstRun) {
                        $this->sendNotification(
                            $botToken,
                            $chatId,
                            $user,
                            $totalUsed,
                            $user->transfer_enable,
                            $level,
                            $meta
                        );
                    }

                    // Mark as notified (persistent — survives cache:clear)
                    $state[$billingCycle][$stateKey] = time();

                    // Only send the highest applicable threshold per run
                    break;
                }
            }

            // Persist updated state & clean up old cycles
            $this->saveState($state);
        } catch (\Throwable $e) {
            Log::error('TgTrafficNotify Plugin Error: ' . $e->getMessage());
        }
    }

    protected function sendNotification(
        string $botToken,
        string $chatId,
        $user,
        int $totalUsed,
        int $limit,
        int $level,
        array $meta
    ): void {
        $usedGb = round($totalUsed / 1073741824, 2);
        $limitGb = round($limit / 1073741824, 2);
        $percent = round(($totalUsed / $limit) * 100, 1);

        $text  = "{$meta['emoji']} *{$meta['title']}*\n\n";
        $text .= "👤 *Email*: `{$user->email}`\n";
        $text .= "📊 *Usage*: `{$usedGb} GB` / `{$limitGb} GB` ({$percent}%)\n";
        $text .= "📌 *Threshold*: {$level}%\n";
        $text .= "💬 {$meta['message']}\n";
        $text .= "🕒 *Time*: `" . date('Y-m-d H:i:s') . "`";

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        Http::timeout(5)->post($url, [
            'chat_id'    => $chatId,
            'text'       => $text,
            'parse_mode' => 'Markdown',
        ]);
    }

    // ─── Persistent File-Based State ────────────────────────────────────

    /**
     * Load the notification state from the JSON file.
     * Format: { "2026-06": { "userId:level": timestamp, ... }, ... }
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
     * Save state to the JSON file, cleaning up cycles older than 2 months.
     */
    protected function saveState(array $state): void
    {
        // Remove data older than 2 months to keep the file small
        $cutoff = date('Y-m', strtotime('-2 months'));
        foreach (array_keys($state) as $cycle) {
            if ($cycle < $cutoff) {
                unset($state[$cycle]);
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

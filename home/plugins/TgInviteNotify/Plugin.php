<?php

namespace Plugin\TgInviteNotify;

use App\Services\Plugin\AbstractPlugin;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Plugin extends AbstractPlugin
{
    /**
     * Static flag to prevent duplicate listener registration
     * across multiple boot() calls (queue workers, scheduler, etc.)
     */
    protected static bool $listenerRegistered = false;

    public function boot(): void
    {
        if (self::$listenerRegistered) {
            return;
        }

        if (class_exists(\App\Models\User::class)) {
            $plugin = $this;

            \App\Models\User::created(function ($user) use ($plugin) {
                try {
                    $plugin->notifyAdmin($user);
                } catch (\Throwable $e) {
                    Log::error('TgInviteNotify Plugin Error: ' . $e->getMessage());
                }
            });

            self::$listenerRegistered = true;
        }
    }

    public function notifyAdmin($user): void
    {
        $botToken = $this->getConfig('tg_bot_token', '');
        $chatId = $this->getConfig('tg_chat_id', '');

        if (empty($botToken) || empty($chatId)) {
            return;
        }

        $text = "🎉 *New User Registered*\n\n";
        $text .= "👤 *Email*: `{$user->email}`\n";
        $text .= "🕒 *Time*: `" . date('Y-m-d H:i:s') . "`";

        if (!empty($user->invite_user_id)) {
            $inviter = \App\Models\User::find($user->invite_user_id);
            if ($inviter) {
                $text .= "\n🤝 *Invited By*: `{$inviter->email}`";
            }
        }

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        Http::timeout(5)->post($url, [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'Markdown',
        ]);
    }
}

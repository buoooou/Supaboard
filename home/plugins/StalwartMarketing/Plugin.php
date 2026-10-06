<?php

namespace Plugin\StalwartMarketing;

use App\Services\Plugin\AbstractPlugin;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Log;

class Plugin extends AbstractPlugin
{
    public function boot(): void
    {
        $this->filter('admin_comm_config', function (array $config) {
            $config['stalwart_marketing_enable'] = true;
            $config['stalwart_marketing_sender'] = $this->getConfig('from_email', '');
            return $config;
        });

        if (function_exists('app')) {
            app('view')->addNamespace('StalwartMarketing', __DIR__ . '/views');
        }

        $this->loadLegacyRoutes();
    }

    public function schedule(Schedule $schedule): void
    {
        if (!$this->getConfig('queue_retry_enabled', true)) {
            return;
        }

        $schedule->call(function () {
            Log::info('StalwartMarketing scheduler heartbeat');
        })->everyFiveMinutes()->name('stalwart-marketing-heartbeat')->withoutOverlapping();
    }

    protected function loadLegacyRoutes(): void
    {
        $routeFile = __DIR__ . '/routes.php';

        if (file_exists($routeFile)) {
            require_once $routeFile;
        }
    }
}

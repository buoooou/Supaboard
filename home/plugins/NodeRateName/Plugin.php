<?php

namespace Plugin\NodeRateName;

use App\Services\Plugin\AbstractPlugin;

class Plugin extends AbstractPlugin
{
    public function boot(): void
    {
        // 挂载订阅节点列表过滤器
        $this->filter('client.subscribe.servers', function ($servers) {
            return array_map(function ($server) {
                $rate = $server['rate'] ?? 1;
                // 将倍率放在节点名称最前面，例如："香港 01 | BGP" -> "[1.5x] 香港 01 | BGP"
                $server['name'] = "[{$rate}x]" . $server['name'];
                return $server;
            }, $servers);
        });
    }
}

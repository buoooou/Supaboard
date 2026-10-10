<?php

namespace App\Http\Controllers;

use App\Services\ThemeService;
use App\Services\UpdateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

/**
 * 主题自带的真实路径页面（/blog/xxx、/login、/sitemap.xml 等）。
 *
 * 注册为 web 路由的兜底：只响应当前主题在 prerender/ 目录里声明过的路径，其余一律 404。
 * 没有提供该目录的主题（如默认的 Xboard 主题）行为不变。
 */
class ThemePageController extends Controller
{
    public function __invoke(Request $request, ThemeService $themeService)
    {
        $path = trim($request->path(), '/');
        if ($path !== 'sitemap.xml' && !preg_match('#^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$#', $path)) {
            abort(404);
        }

        if (admin_setting('app_url') && admin_setting('safe_mode_enable', 0)) {
            if ($request->getHost() !== parse_url(admin_setting('app_url'), PHP_URL_HOST)) {
                abort(403);
            }
        }

        $theme = admin_setting('frontend_theme', 'Xboard');
        $themePath = $themeService->getThemePath($theme);
        $manifestFile = $themePath . '/prerender/routes.json';
        if (!$themePath || !File::exists($manifestFile)) {
            abort(404);
        }

        if ($path === 'sitemap.xml') {
            abort_unless(File::exists($themePath . '/prerender/sitemap.xml'), 404);
            return response(File::get($themePath . '/prerender/sitemap.xml'), 200, [
                'Content-Type' => 'application/xml; charset=utf-8',
            ]);
        }

        $manifest = json_decode(File::get($manifestFile), true) ?: [];
        if (isset($manifest['redirects'][$path])) {
            return redirect($manifest['redirects'][$path], 301);
        }

        $isPrerendered = File::exists($themePath . '/prerender/pages/' . $path . '.json');
        if (!$isPrerendered && !$this->matchesAny($manifest['spa'] ?? [], $path)) {
            abort(404);
        }

        // /blog/ 与 /blog 是同一个页面，统一到不带结尾斜杠的地址
        if (str_ends_with($request->getPathInfo(), '/')) {
            return redirect('/' . $path, 301);
        }

        // 渲染参数与 routes/web.php 的首页保持一致
        return view('theme::' . $theme . '.dashboard', [
            'title' => admin_setting('app_name', 'Xboard'),
            'theme' => $theme,
            'version' => app(UpdateService::class)->getCurrentVersion(),
            'description' => admin_setting('app_description', 'Xboard is best'),
            'logo' => admin_setting('logo'),
            'theme_config' => $themeService->getConfig($theme),
        ]);
    }

    /**
     * 路径是否命中清单里的某个模式，`*` 匹配一段路径（如 order/*）
     */
    private function matchesAny(array $patterns, string $path): bool
    {
        foreach ($patterns as $pattern) {
            $regex = '#^' . str_replace('\*', '[^/]+', preg_quote($pattern, '#')) . '$#';
            if (preg_match($regex, $path)) {
                return true;
            }
        }
        return false;
    }
}

@php
  // 自愈：镜像更新后 public/theme/{theme} 仍是旧副本时，自动从主题目录重新同步一次
  $__entry = public_path('theme/' . $theme . '/assets/__ENTRY_JS__');
  if (!file_exists($__entry)) {
      try {
          $__src = app(\App\Services\ThemeService::class)->getThemePath($theme);
          if ($__src) {
              \Illuminate\Support\Facades\File::copyDirectory($__src, public_path('theme/' . $theme));
          }
      } catch (\Throwable $__e) {
          \Illuminate\Support\Facades\Log::warning('Supaboard theme resync failed: ' . $__e->getMessage());
      }
  }
  // 预渲染页面（构建期生成，见 theme-src/supaboard/scripts/prerender.mjs）：按请求路径取标题、描述与正文
  $__path = trim(request()->path(), '/');
  $__page = null;
  if ($__path === '' || preg_match('#^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$#', $__path)) {
      $__themePath = app(\App\Services\ThemeService::class)->getThemePath($theme);
      $__pageFile = $__themePath . '/prerender/pages/' . ($__path === '' ? 'index' : $__path) . '.json';
      if ($__themePath && is_file($__pageFile)) {
          $__page = json_decode(file_get_contents($__pageFile), true);
      }
  }
  // 后端注册了 theme.page 兜底路由才能响应 /blog/xxx 这类真实路径，否则保持 hash 路由
  $__history = \Illuminate\Support\Facades\Route::has('theme.page');
  $__settings = [
      'title' => $title,
      'assets_path' => '/theme/' . $theme . '/assets',
      'version' => $version,
      'description' => $description,
      'logo' => $logo,
      'theme' => [
          'default_mode' => $theme_config['default_mode'] ?? 'light',
          'landing_url' => $theme_config['landing_url'] ?? '',
          'support_url' => $theme_config['support_url'] ?? '',
          'download_url' => $theme_config['download_url'] ?? '',
      ],
      'i18n' => ['zh-CN', 'zh-TW', 'en-US'],
      'routing' => $__history ? 'history' : 'hash',
  ];
@endphp
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover" />
  @if ($__page)
  <title>{{ $__page['title'] }}</title>
  <meta name="description" content="{{ $__page['description'] }}" />
  <link rel="canonical" href="{{ $__page['canonical'] }}" />
  <meta property="og:type" content="{{ $__page['type'] }}" />
  <meta property="og:site_name" content="{{ $__page['site_name'] }}" />
  <meta property="og:title" content="{{ $__page['title'] }}" />
  <meta property="og:description" content="{{ $__page['description'] }}" />
  <meta property="og:url" content="{{ $__page['canonical'] }}" />
  <meta property="og:image" content="{{ $__page['image'] }}" />
  <meta name="twitter:card" content="summary_large_image" />
  @if (!empty($__page['json_ld']))
  <script type="application/ld+json">{!! $__page['json_ld'] !!}</script>
  @endif
  @else
  <title>{{ $title }}</title>
  <meta name="description" content="{{ $description }}" />
  @if ($__path !== '')
  {{-- 登录、注册、控制台等纯前端页面没有可收录的内容 --}}
  <meta name="robots" content="noindex" />
  @endif
  @endif
  @if (!empty($logo))
  <link rel="icon" href="{{ $logo }}" />
  @endif
  <!-- __ENTRY_PRELOAD__ -->
  <!-- __ENTRY_CSS__ -->
  <script>
    window.routerBase = "/";
    window.settings = {!! json_encode($__settings, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!};
    (function () {
      try {
        var m = localStorage.getItem('SUPABOARD_COLOR_MODE') || window.settings.theme.default_mode;
        if (m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  </script>
  <script type="module" crossorigin src="/theme/{{$theme}}/assets/__ENTRY_JS__"></script>

  <!-- Google Analytics (GA4: G-C156V21PNC) - lazyOnload -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    // 页面浏览由 router.afterEach 上报（含首屏），这里不再重复发送
    gtag('config', 'G-C156V21PNC', { send_page_view: false });
    (function () {
      function loadGA() {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-C156V21PNC';
        document.head.appendChild(s);
      }
      if (document.readyState === 'complete') {
        loadGA();
      } else {
        window.addEventListener('load', loadGA, { once: true });
      }
    })();
  </script>
</head>
<body>
  <div id="app">
    {{-- 预渲染正文里的站内链接是真实路径，只在后端能响应这些路径时输出 --}}
    @if ($__page && $__history)
    {{-- email_off：不让 Cloudflare 把正文里的邮箱改写成 /cdn-cgi/l/email-protection 链接（爬虫访问是 404） --}}
    <!--email_off-->{!! $__page['html'] !!}<!--/email_off-->
    @else
    <style>
      .sb-init-loader{display:flex;align-items:center;justify-content:center;min-height:100vh;background-color:#fffdfa;transition:background-color .2s}
      .dark .sb-init-loader{background-color:#0f172a}
      .sb-init-spinner{width:36px;height:36px;border:3px solid rgba(111,60,255,.15);border-top-color:#6f3cff;border-radius:50%;animation:sb-spin .7s linear infinite}
      @keyframes sb-spin{to{transform:rotate(360deg)}}
    </style>
    <div class="sb-init-loader">
      <div class="sb-init-spinner"></div>
    </div>
    @endif
  </div>
  {!! $theme_config['custom_html'] ?? '' !!}
</body>
</html>

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
  ];
@endphp
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover" />
  <meta name="description" content="{{ $description }}" />
  <title>{{ $title }}</title>
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
    gtag('config', 'G-C156V21PNC', {
      page_path: window.location.pathname,
    });
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
    <style>
      .sb-init-loader{display:flex;align-items:center;justify-content:center;min-height:100vh;background-color:#fffdfa;transition:background-color .2s}
      .dark .sb-init-loader{background-color:#0f172a}
      .sb-init-spinner{width:36px;height:36px;border:3px solid rgba(111,60,255,.15);border-top-color:#6f3cff;border-radius:50%;animation:sb-spin .7s linear infinite}
      @keyframes sb-spin{to{transform:rotate(360deg)}}
    </style>
    <div class="sb-init-loader">
      <div class="sb-init-spinner"></div>
    </div>
  </div>
  {!! $theme_config['custom_html'] ?? '' !!}
</body>
</html>

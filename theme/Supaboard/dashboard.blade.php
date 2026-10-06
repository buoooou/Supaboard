@php
  // 自愈：镜像更新后 public/theme/{theme} 仍是旧副本时，自动从主题目录重新同步一次
  $__entry = public_path('theme/' . $theme . '/assets/main-D4qIvuzJ.js');
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
  <script type="module" crossorigin src="/theme/{{$theme}}/assets/main-D4qIvuzJ.js"></script>
  <link rel="stylesheet" href="/theme/{{$theme}}/assets/main-DcUIbBtz.css" />
</head>
<body>
  <div id="app"></div>
  {!! $theme_config['custom_html'] ?? '' !!}
</body>
</html>

/**
 * 路由模式：
 * - history：后端注册了 theme.page 兜底路由时由 dashboard.blade.php 下发，营销页拥有可被搜索引擎抓取的真实路径
 * - hash：后端只响应 `/` 的旧版本（含官方 Xboard），与旧主题保持一致
 */
export const historyMode = import.meta.env.SSR || window.settings?.routing === 'history'

/** 给原生 <a href> 用的站内地址（RouterLink 不需要） */
export function routeHref(path: string): string {
  return historyMode ? path : '#' + path
}

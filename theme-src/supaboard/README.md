# Supaboard 用户端主题

与落地页 www.supaboard.cc 同风格的 Xboard 用户端主题，替代闭源的默认主题 `theme/Xboard`（旧主题保持原样，可随时切回）。

- 技术栈：Vue 3 + Vite + TypeScript + Tailwind CSS
- 源码：`theme-src/supaboard/`
- 构建产物：`theme/Supaboard/`（`assets/`、`dashboard.blade.php`、`config.json`，需要提交到仓库）

## 与旧主题的兼容

| 项目 | 说明 |
|---|---|
| 路由 | 保持 hash 路由和原路径：`/#/login`、`/#/register?code=xxx`、`/#/dashboard`、`/#/plan/:id`、`/#/order/:trade_no`、`/#/ticket/:id` 等，落地页、邮件、TG 机器人里的旧链接继续可用 |
| 登录态 | 与旧主题共用 `localStorage["VUE_NAIVE_ACCESS_TOKEN"]`，切换主题（包括切回旧主题）时用户不用重新登录 |
| 邮件 / 快捷登录 | 支持 `/#/login?verify=xxx&redirect=dashboard` |
| 接口 | 只调用后端现有的 `/api/v1` 接口，不需要改后端 |
| 自定义 HTML | `custom_html` 配置项保留（客服 JS 等） |

## 功能清单

### 1. 落地营销与文档系统（已从 home 完整迁移合并）
- **首页 (Landing Page)**：Neo-brutalism 风格 Hero 动效、卓越网络性能（6大特性）、安全与无日志承诺、快速上手3步流程、套餐价格选择与对比（月付/不限时流量包/AI专区）、全民合伙人15%返佣介绍、TG 机器人助手、在线 IP 纯净度检测、常见问题 FAQ
- **客户端下载中心 (`/#/download`)**：iOS (小火箭、Stash、QX)、Windows (Clash Verge Rev、v2rayN、Flclash)、macOS (Clash Verge Rev、Flclash、V2rayU)、Android (NekoBox、v2rayNG) 全平台软件及直连与 Releases 链接
- **使用文档与教程 (`/#/docs`)**：集成各平台详细配置指南（Windows、macOS、iOS、Android 手把手图文步骤与排错问答）
- **全民合伙人计划 (`/#/affiliate`)**：高额 15% 循环返佣介绍、结算与灵活提现说明、3 步赚取佣金指南
- **博客文章系统 (`/#/blog` 及 `/#/blog/:slug`)**：44+ 篇网络加速与客户端配置干货文章、关键词检索、分页、封面图及相关推荐
- **服务条款与法律协议**：服务条款 (`/#/terms`)、隐私政策 (`/#/privacy`)、退款政策 (`/#/refund`)、使用守则 (`/#/aup`)、DMCA 投诉 (`/#/dmca`)、开源许可 (`/#/license`)

### 2. 用户端功能（覆盖原主题全部功能）
- 登录 / 注册（邀请码、邮箱验证码、邮箱后缀白名单、服务条款、reCAPTCHA v2/v3、Turnstile）/ 找回密码
- 仪表盘：公告轮播与「弹窗」标签公告、待支付订单 / 进行中工单提醒、订阅流量与到期、一键订阅（各平台客户端导入、二维码、协议筛选）、续费、流量重置包、快捷入口
- 使用文档：分类、搜索、详情（支持 `{{subscribeUrl}}` 等占位符和付费可见区）
- 购买订阅：套餐列表（按周期 / 按流量筛选）、周期选择、优惠券、换套餐提醒
- 订单：列表、详情、支付方式与手续费、扫码支付（自动轮询）、跳转支付、余额全额抵扣、取消
- 节点状态、流量明细（按日柱状图 + 明细表）
- 工单：新建、对话、回复、关闭
- 邀请：佣金统计、三级分销比例、邀请码生成与复制、佣金记录、划转到余额、申请提现
- 个人中心：修改密码、到期 / 流量邮件提醒、Telegram 绑定、重置订阅信息
- 深色模式、简体中文 / 繁體中文 / English、移动端适配

## 开发

```bash
cd theme-src/supaboard
pnpm install
cp .env.example .env        # 设置 VITE_PROXY_TARGET 为一个可访问的 Xboard 后端
pnpm dev                    # http://localhost:5173/#/login，/api 会代理到后端
```

`pnpm typecheck` 用于类型检查。

文案直接以简体中文作为 key，比如 `t('购买订阅')`。新增文案后，要在 `src/i18n/en-US.ts` 和 `src/i18n/zh-TW.ts` 补上翻译，缺失的会回退显示中文。

## 构建与发布

```bash
pnpm build      # 输出到 ../../theme/Supaboard，并生成 dashboard.blade.php
pnpm package    # build + 打包 release/Supaboard-<version>.zip
```

发布前先把 `package.json` 里的 `version` 改大。后台上传更新时只接受版本号更高的包，构建时会把版本号同步到 `config.json`。

### 方式 A：后台上传（适用于使用官方镜像 `ghcr.io/cedar2025/xboard`）

1. `pnpm package`
2. 管理后台 → 主题配置 → 上传主题，选择 `release/Supaboard-x.y.z.zip`
3. 在主题列表中把 Supaboard 设为当前主题，并按需填写主题配置（官网地址、下载页、默认配色等）
4. 出问题时切回 `Xboard` 即可，用户登录态不受影响

上传的主题保存在 `storage/theme/`，要确保这个目录在持久化卷里。

### 方式 B：打进自建镜像

把 `theme/Supaboard/` 提交到仓库，用自己的镜像部署。`theme/` 下的主题会被当作系统主题直接加载。

### 关于 public 目录缓存

Xboard 把主题文件拷贝到 `public/theme/<主题名>/` 对外提供。`dashboard.blade.php` 内置了自愈逻辑：如果当前构建的入口文件在 public 下不存在（例如镜像更新后 public 里还是旧副本），会自动重新同步一次，不需要手动重新切换主题。

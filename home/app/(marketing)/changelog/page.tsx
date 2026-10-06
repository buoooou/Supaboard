import { CheckCircle2, Rocket, ShieldCheck, Zap } from "lucide-react";

export default function ChangelogPage() {
  const updates = [
    {
      date: "2026-05-01",
      version: "v2.1.0",
      type: "feature",
      title: "推出「全民合伙人」返佣计划",
      content: [
        "正式上线高额循环返利系统，支持 15% 终身返佣。",
        "新增「合伙人」专属详情页。",
        "完善运维透明度，新增服务状态页、退款政策及 DMCA 说明。"
      ],
      icon: Rocket,
      color: "text-primary"
    },
    {
      date: "2026-04-25",
      version: "v2.0.5",
      type: "optimize",
      title: "香港 & 日本专线扩容",
      content: [
        "对现有 IPLC 专线进行带宽翻倍扩容，解决晚高峰延迟抖动问题。",
        "优化后端心跳检测算法，节点切换速度提升 40%。",
        "更新客户端下载中心，修复部分版本下载链接失效问题。"
      ],
      icon: Zap,
      color: "text-tertiary"
    },
    {
      date: "2026-04-10",
      version: "v2.0.0",
      type: "security",
      title: "全站架构升级与全量解锁",
      content: [
        "迁移至高性能 Edge 传输架构，提升流媒体解锁稳定性。",
        "全量支持 ChatGPT、Netflix、Disney+ 等主流服务。",
        "引入全新的 UI 设计语言，提升移动端交互体验。"
      ],
      icon: ShieldCheck,
      color: "text-secondary"
    }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-background dot-grid pb-24">
      <section className="relative pt-32 pb-16 px-6 lg:px-8 max-w-4xl mx-auto z-10 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tight mb-6">
            更新日志
          </h1>
          <p className="font-sans text-xl text-muted-foreground leading-relaxed">
            记录 Supaboard 的每一次成长。我们不断迭代，只为给您带来更完美的网络体验。
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-8 max-w-4xl mx-auto z-10">
        <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-8 before:w-1 before:bg-foreground/5 before:dashed">
          {updates.map((update, i) => (
            <div
              key={i}
              className="relative pl-16 group"
            >
              {/* Timeline dot */}
              <div className="absolute left-6 top-0 w-5 h-5 rounded-full bg-white border-4 border-foreground z-10 group-hover:scale-125 transition-transform" />
              
              <div className="sticker-card bg-white hover:border-primary transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={update.color}>
                      <update.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-2xl font-black tracking-tight">{update.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-muted px-3 py-1 rounded-full border border-foreground/10">{update.version}</span>
                    <span className="font-sans text-sm text-muted-foreground font-bold">{update.date}</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {update.content.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-quaternary shrink-0 mt-0.5" />
                      <span className="font-sans text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

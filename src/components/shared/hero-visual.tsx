import { Stagger, StaggerItem } from "@/components/motion/stagger";

const domains = ["Web 全栈", "小程序", "桌面端", "嵌入式", "数据科学"];
const coreStack = ["TypeScript", "React", "Next.js", "Spring Boot", "Drizzle"];
const discipline = ["类型安全", "Tests", "CI", "Docker"];

/**
 * Hero 视觉:Apple 风 Bento 栅格 + 柔和环境光晕。
 * 纯 CSS / DOM,无 WebGL;终端卡传递「技术力」信号。
 * prefers-reduced-motion 时光晕与光标静止(见 globals.css)。
 */
export function HeroVisual() {
  return (
    <div className="border-border/60 from-brand-subtle/50 via-background to-background relative isolate overflow-hidden rounded-3xl border bg-gradient-to-br p-3 sm:p-4">
      {/* 环境光晕背景 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-orb-a bg-brand/25 absolute -top-1/4 left-1/6 size-2/3 rounded-full blur-3xl" />
        <div className="hero-orb-b absolute top-1/4 right-1/6 size-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="hero-orb-c absolute bottom-0 left-1/3 size-1/2 rounded-full bg-violet-400/15 blur-3xl" />
      </div>

      <Stagger className="grid grid-cols-1 gap-3 sm:[min-height:24rem] sm:auto-rows-fr sm:grid-cols-3 sm:grid-rows-2">
        {/* 终端卡(焦点) */}
        <StaggerItem className="sm:col-span-2 sm:row-span-2">
          <div className="border-border/60 bg-card/70 flex h-full flex-col rounded-2xl border p-4 backdrop-blur-md sm:p-5">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-red-400/80" />
              <span className="size-3 rounded-full bg-amber-400/80" />
              <span className="size-3 rounded-full bg-emerald-400/80" />
              <span className="text-muted-foreground ml-2 font-mono text-xs">~/portfolio</span>
            </div>
            <div className="mt-5 space-y-2 font-mono text-sm leading-relaxed sm:mt-6 sm:text-[0.95rem]">
              <p>
                <span className="text-muted-foreground">$</span> whoami
              </p>
              <p className="text-foreground">全栈开发者 · 端到端类型安全</p>
              <p className="pt-1">
                <span className="text-muted-foreground">$</span> stack --primary
              </p>
              <p className="text-brand">TypeScript / Java / Python</p>
              <p className="pt-1">
                <span className="text-muted-foreground">$</span> deploy --ship
              </p>
              <p className="text-foreground">
                ✓ 10+ 项目已上线
                <span className="text-brand hero-caret ml-0.5 inline-block">▋</span>
              </p>
            </div>
            <div className="border-border/50 text-muted-foreground mt-auto flex items-center gap-3 border-t pt-3 font-mono text-[0.7rem]">
              <span className="text-emerald-500">● main</span>
              <span>type-safe</span>
              <span>0 errors</span>
              <span className="ml-auto">RSC · PPR</span>
            </div>
          </div>
        </StaggerItem>

        {/* 覆盖领域 */}
        <StaggerItem className="sm:col-span-1">
          <div className="border-border/60 bg-card/70 flex h-full flex-col rounded-2xl border p-4 backdrop-blur-md">
            <p className="text-muted-foreground text-xs font-medium tracking-wide">覆盖领域</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {domains.map((d) => (
                <span
                  key={d}
                  className="border-border/60 bg-background/60 text-foreground/80 rounded-full border px-2 py-0.5 text-xs"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* 核心技术栈 */}
        <StaggerItem className="sm:col-span-1">
          <div className="border-border/60 bg-card/70 flex h-full flex-col rounded-2xl border p-4 backdrop-blur-md">
            <p className="text-muted-foreground text-xs font-medium tracking-wide">核心技术栈</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {coreStack.map((s) => (
                <span
                  key={s}
                  className="border-brand/20 bg-brand/10 text-brand rounded-full border px-2 py-0.5 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="border-border/50 mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t pt-3">
              {discipline.map((d) => (
                <span key={d} className="text-muted-foreground font-mono text-[0.7rem]">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  );
}

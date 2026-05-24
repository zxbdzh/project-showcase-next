import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { buttonVariants } from "@/components/ui/button";

const stats = [
  { value: "3+", label: "年经验" },
  { value: "12+", label: "上线项目" },
  { value: "20+", label: "技术栈" },
];

const featured = [
  { title: "项目 Alpha", desc: "一句话亮点描述,说明它解决了什么。", stack: "Next.js · TS · Postgres" },
  { title: "项目 Beta", desc: "一句话亮点描述,说明它解决了什么。", stack: "React · Node · Redis" },
  { title: "项目 Gamma", desc: "一句话亮点描述,说明它解决了什么。", stack: "Vue · Spring Boot" },
];

const skills = [
  "TypeScript", "React", "Next.js", "Vue", "Node.js", "Java",
  "Spring Boot", "PostgreSQL", "Redis", "Docker", "Tailwind", "Three.js",
];

export default function HomePage() {
  return (
    <>
      {/* ① Hero */}
      <section className="relative flex min-h-[88vh] items-center">
        <Container>
          <FadeIn>
            <p className="mb-4 text-sm font-medium text-brand">
              全栈工程师 · Full-Stack Engineer
            </p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              构建会上线的
              <br />
              数字产品。
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              我设计并交付端到端的 Web 应用 —— 从数据库到像素。
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/projects" className={buttonVariants({ className: "rounded-full px-5" })}>
                查看作品
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: "outline", className: "rounded-full px-5" })}
              >
                联系我
              </Link>
            </div>
          </FadeIn>
          {/* 3D Hero 占位 —— 任务 03 接入玻璃折射几何体 */}
          <FadeIn delay={0.3}>
            <div className="mt-16 flex aspect-[16/7] w-full items-center justify-center rounded-3xl border border-border/60 bg-gradient-to-b from-brand-subtle to-transparent text-sm text-muted-foreground">
              3D Hero(滚动驱动)占位
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ② 能力数据条 */}
      <section className="border-y border-border/60 bg-muted/40 py-16">
        <Container>
          <Stagger className="grid grid-cols-3 gap-8">
            {stats.map((s) => (
              <StaggerItem key={s.label} className="text-center">
                <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ③ 精选项目 */}
      <section className="py-24 sm:py-32">
        <Container>
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              精选作品
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <Link
                  href="/projects"
                  className="group block h-full rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 aspect-video rounded-xl bg-muted" />
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{p.title}</h3>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-brand" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{p.stack}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* ④ 技术栈 */}
      <section className="border-t border-border/60 py-24">
        <Container>
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              技术栈
            </h2>
          </FadeIn>
          <Stagger className="mt-10 flex flex-wrap gap-3">
            {skills.map((s) => (
              <StaggerItem key={s}>
                <span className="inline-block rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
                  {s}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ⑤ 关于预览 */}
      <section className="py-24">
        <Container>
          <FadeIn>
            <h2 className="max-w-3xl text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
              我是一名全栈工程师,热衷于把复杂问题
              <span className="text-brand">收敛成简洁、可靠的产品</span>。
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-1 text-sm text-brand hover:underline"
            >
              了解更多 <ArrowUpRight className="size-4" />
            </Link>
          </FadeIn>
        </Container>
      </section>

      {/* ⑥ CTA */}
      <section className="border-t border-border/60 py-28">
        <Container className="text-center">
          <FadeIn>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              一起做点东西?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              欢迎合作、全职机会或技术交流。
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <Link href="/contact" className={buttonVariants({ className: "mt-8 rounded-full px-6" })}>
              联系我
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

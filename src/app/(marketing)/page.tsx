import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { buttonVariants } from "@/components/ui/button";
import { HeroVisual } from "@/components/shared/hero-visual";
import { getFeaturedProjects } from "@/features/projects/queries";
import { getSkills } from "@/features/skills/queries";

const stats = [
  { value: "10+", label: "完整项目" },
  { value: "5", label: "技术领域" },
  { value: "20+", label: "技术栈" },
];

export default async function HomePage() {
  const [featured, skills] = await Promise.all([getFeaturedProjects(3), getSkills()]);

  return (
    <>
      {/* ① Hero */}
      <section className="relative flex min-h-[88vh] items-center">
        <Container>
          <FadeIn>
            <div className="border-border/60 bg-card/60 mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-500/50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                可参与合作 · 全栈开发者 / 跨端 / AI 应用
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl">
              构建会上线的
              <br />
              <span className="from-brand bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">
                数字产品。
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg">
              从 Web、小程序到桌面端,我交付端到端、会上线的产品 —— 从数据库到像素。
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/projects"
                className={buttonVariants({ className: "group rounded-full px-5" })}
              >
                查看作品
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ variant: "outline", className: "rounded-full px-5" })}
              >
                联系我
              </Link>
            </div>
          </FadeIn>
          <div className="mt-12 sm:mt-16">
            <HeroVisual />
          </div>
        </Container>
      </section>

      {/* ② 能力数据条 */}
      <section className="border-border/60 bg-muted/40 border-y py-16">
        <Container>
          <Stagger className="grid grid-cols-3 gap-8">
            {stats.map((s) => (
              <StaggerItem key={s.label} className="text-center">
                <div className="text-4xl font-semibold tracking-tight sm:text-5xl">{s.value}</div>
                <div className="text-muted-foreground mt-1 text-sm">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ③ 精选项目 */}
      <section className="py-24 sm:py-32">
        <Container>
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">精选作品</h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group border-border/60 bg-card block h-full rounded-2xl border p-6 transition-shadow hover:shadow-lg"
                >
                  {p.coverImage ? (
                    <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted mb-4 aspect-video rounded-xl" />
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{p.title}</h3>
                    <ArrowUpRight className="text-muted-foreground group-hover:text-brand size-4 transition-colors" />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">{p.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.techStack?.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          {featured.length > 0 && (
            <FadeIn delay={0.3}>
              <div className="mt-10 text-center">
                <Link
                  href="/projects"
                  className={buttonVariants({ variant: "outline", className: "rounded-full px-5" })}
                >
                  查看全部作品
                </Link>
              </div>
            </FadeIn>
          )}
        </Container>
      </section>

      {/* ④ 技术栈 */}
      <section className="border-border/60 border-t py-24">
        <Container>
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">技术栈</h2>
          </FadeIn>
          <Stagger className="mt-10 flex flex-wrap gap-3">
            {skills.map((s) => (
              <StaggerItem key={s.id}>
                <span className="border-border/60 bg-card inline-block rounded-full border px-4 py-2 text-sm">
                  {s.name}
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
            <h2 className="max-w-3xl text-3xl leading-snug font-semibold tracking-tight sm:text-4xl">
              我是一名全栈开发者,热衷于把复杂问题
              <span className="text-brand">收敛成简洁、可靠的产品</span>。
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link
              href="/about"
              className="text-brand mt-6 inline-flex items-center gap-1 text-sm hover:underline"
            >
              了解更多 <ArrowUpRight className="size-4" />
            </Link>
          </FadeIn>
        </Container>
      </section>

      {/* ⑥ CTA */}
      <section className="border-border/60 border-t py-28">
        <Container className="text-center">
          <FadeIn>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">一起做点东西?</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md">
              欢迎合作、全职机会或技术交流。
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <Link
              href="/contact"
              className={buttonVariants({ className: "mt-8 rounded-full px-6" })}
            >
              联系我
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

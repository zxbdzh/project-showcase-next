import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { buttonVariants } from "@/components/ui/button";
import { HeroTerminal } from "@/components/shared/hero-terminal";
import { HeroIntro } from "@/components/shared/hero-intro";
import { TechStackPills } from "@/components/shared/tech-stack-pills";
import { getFeaturedProjects } from "@/features/projects/queries";
import { getSkills } from "@/features/skills/queries";

const stats = [
  { value: "10+", label: "完整项目" },
  { value: "3", label: "技术领域" },
  { value: "20+", label: "技术栈" },
];

export default async function HomePage() {
  const [featured, skills] = await Promise.all([getFeaturedProjects(3), getSkills()]);

  return (
    <>
      {/* ① Hero · 滚动驱动叙事开场 */}
      <HeroIntro />

      {/* ② 交互式终端 · 技术力展示 */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <FadeIn>
            <HeroTerminal />
          </FadeIn>
        </Container>
      </section>

      {/* ③ 能力数据条 */}
      <section className="border-border/60 bg-muted/40 border-y py-16">
        <Container>
          <Stagger className="grid grid-cols-3 gap-8">
            {stats.map((s) => (
              <StaggerItem key={s.label} className="text-center">
                <div className="stats-value text-4xl font-semibold tracking-tight sm:text-5xl">
                  {s.value}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ④ 精选项目 */}
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
                  className="project-card group border-border/60 bg-card block h-full rounded-2xl border p-6 transition-all duration-500"
                >
                  {p.coverImage ? (
                    <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted mb-4 aspect-video rounded-xl" />
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{p.title}</h3>
                    <ArrowUpRight className="text-muted-foreground group-hover:text-brand size-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">{p.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.techStack?.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-muted-foreground bg-muted group-hover:bg-brand/10 group-hover:text-brand rounded-full px-2 py-0.5 text-xs transition-colors duration-300"
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

      {/* ⑤ 技术栈 */}
      <section className="border-border/60 border-t py-24">
        <Container>
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">技术栈</h2>
          </FadeIn>
          <Stagger className="mt-10 flex flex-wrap gap-3">
            {skills.map((s) => (
              <StaggerItem key={s.id}>
                <TechStackPills name={s.name} icon={s.icon} />
              </StaggerItem>
            ))}
          </Stagger>
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
              className={buttonVariants({ className: "cta-glow mt-8 rounded-full px-6" })}
            >
              联系我
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

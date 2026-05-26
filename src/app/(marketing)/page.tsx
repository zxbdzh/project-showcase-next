import { Suspense } from "react";
import { connection } from "next/server";
import { Link } from "next-view-transitions";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { buttonVariants } from "@/components/ui/button";
import { HeroTerminal } from "@/components/shared/hero-terminal";
import { HeroIntro } from "@/components/shared/hero-intro";
import { TechStackPills } from "@/components/shared/tech-stack-pills";
import { CountUp } from "@/components/shared/count-up";
import { AiChat } from "@/components/shared/ai-chat";
import { CommentHeading } from "@/components/terminal";
import { getFeaturedProjects } from "@/features/projects/queries";
import { getSkills } from "@/features/skills/queries";
import { getHeroConfig } from "@/features/hero/queries";
import { getHeroCommands } from "@/features/hero/dynamic-commands";
import { getModelId } from "@/lib/ai-config";

const stats = [
  { value: 10, suffix: "+", label: "完整项目" },
  { value: 3, suffix: "", label: "技术领域" },
  { value: 20, suffix: "+", label: "技术栈" },
];

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();
  const [featured, skills, hero, heroCommands] = await Promise.all([
    getFeaturedProjects(3),
    getSkills(),
    getHeroConfig(),
    getHeroCommands(),
  ]);

  return (
    <>
      {/* ① Hero · 滚动驱动叙事开场 */}
      <HeroIntro intro={hero.intro} />

      {/* ② 交互式终端 · 技术力展示 */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <FadeIn>
            <CommentHeading className="mb-4">interactive — 这次你来试试</CommentHeading>
          </FadeIn>
          <FadeIn delay={0.08}>
            <HeroTerminal commands={heroCommands} />
          </FadeIn>
        </Container>
      </section>

      {/* ③ 能力数据条 */}
      <section className="border-border/60 bg-muted/30 border-y py-16">
        <Container>
          <Stagger className="grid grid-cols-3 gap-8">
            {stats.map((s) => (
              <StaggerItem key={s.label} className="text-center">
                <div className="text-brand font-mono text-4xl font-semibold tracking-tight sm:text-5xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-muted-foreground mt-1 font-mono text-xs">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ④ 精选项目 */}
      <section className="py-24 sm:py-32">
        <Container>
          <FadeIn>
            <CommentHeading>featured</CommentHeading>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">精选作品</h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="project-card group border-border bg-card block h-full rounded-md border p-6"
                >
                  {p.coverImage ? (
                    <div className="mb-4 aspect-video overflow-hidden rounded-sm">
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        style={{ viewTransitionName: `project-cover-${p.slug}` }}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted mb-4 aspect-video rounded-sm" />
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
                        className="text-muted-foreground bg-muted group-hover:text-brand rounded-sm px-2 py-0.5 font-mono text-xs transition-colors duration-300"
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
              <div className="mt-10">
                <Link
                  href="/projects"
                  className={buttonVariants({ variant: "outline", className: "group rounded-md" })}
                >
                  查看全部作品
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
            <CommentHeading>stack</CommentHeading>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">技术栈</h2>
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

      {/* ⑥ AI 对话分身 */}
      <section id="ai" className="border-border/60 scroll-mt-20 border-t py-24">
        <Container>
          <FadeIn>
            <CommentHeading>ask</CommentHeading>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              问问我的 AI 分身
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md">
              基于我的真实资料即时回答 —— 流式生成,由 {getModelId()} 驱动。
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mt-10">
              <AiChat />
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ⑦ CTA */}
      <section className="border-border/60 border-t py-28">
        <Container>
          <FadeIn>
            <CommentHeading>contact</CommentHeading>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              一起做点东西?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-muted-foreground mt-4 max-w-md">欢迎合作、全职机会或技术交流。</p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <Link href="/contact" className={buttonVariants({ className: "mt-8 rounded-md" })}>
              <span className="font-mono">$</span> 联系我
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

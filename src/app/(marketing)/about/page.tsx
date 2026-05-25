import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SocialIcon } from "@/components/shared/tech-icon";
import { SkillBar } from "@/components/shared/animated-skill-bar";
import { CommentHeading } from "@/components/terminal";
import { getSkills } from "@/features/skills/queries";
import { getSocialLinks } from "@/features/social-links/queries";
import { getAdminProfile } from "@/features/profile/queries";

export const metadata: Metadata = {
  title: "关于",
  description: "了解我的技术背景、技能栈和职业经历。",
};

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}

async function AboutContent() {
  await connection();
  const [profile, skills, socialLinks] = await Promise.all([
    getAdminProfile(),
    getSkills(),
    getSocialLinks(),
  ]);

  const skillCategories = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const cat = s.category ?? "其他";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const name = profile?.name ?? "zxb";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-[980px]">
        <FadeIn>
          <CommentHeading>about</CommentHeading>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">关于我</h1>
        </FadeIn>

        {/* 个人简介 */}
        <FadeIn delay={0.08}>
          <div className="mt-12 flex flex-col items-start gap-8 sm:flex-row">
            <div className="shrink-0">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={name}
                  className="border-border size-32 rounded-md border object-cover"
                />
              ) : (
                <div className="bg-muted border-border text-brand flex size-32 items-center justify-center rounded-md border font-mono text-5xl font-semibold">
                  {initial}
                </div>
              )}
            </div>
            <div className="flex-1">
              {profile?.headline && (
                <p className="text-brand font-mono text-sm">{profile.headline}</p>
              )}
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{name}</h2>
              {profile?.bio && (
                <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{profile.bio}</p>
              )}
              {profile?.location && (
                <p className="text-muted-foreground mt-2 font-mono text-sm">{profile.location}</p>
              )}
            </div>
          </div>
        </FadeIn>

        {/* 技能 */}
        <FadeIn delay={0.16}>
          <div className="mt-20">
            <CommentHeading>skills</CommentHeading>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">技能栈</h2>
            <div className="mt-8 space-y-8">
              {Object.entries(skillCategories).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="text-muted-foreground mb-4 font-mono text-xs">
                    <span className="text-brand select-none">{"// "}</span>
                    {category}
                  </h3>
                  <Stagger className="space-y-2.5">
                    {categorySkills.map((skill) => (
                      <StaggerItem key={skill.id}>
                        <SkillBar name={skill.name} level={skill.level ?? 0} icon={skill.icon} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 社交链接 */}
        {socialLinks.length > 0 && (
          <FadeIn delay={0.24}>
            <div className="mt-20">
              <CommentHeading>contact</CommentHeading>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">联系方式</h2>
              <Stagger className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <StaggerItem key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border bg-card hover:border-brand inline-flex items-center gap-2.5 rounded-sm border px-4 py-2 text-sm transition-colors"
                    >
                      <SocialIcon platform={link.platform} className="size-4 shrink-0" />
                      {link.platform}
                    </a>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </FadeIn>
        )}
      </Container>
    </section>
  );
}

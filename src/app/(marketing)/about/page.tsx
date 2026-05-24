import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Badge } from "@/components/ui/badge";
import { getSkills } from "@/features/skills/queries";
import { getSocialLinks } from "@/features/social-links/queries";
import { getAdminProfile } from "@/features/profile/queries";

export const metadata: Metadata = {
  title: "关于",
  description: "了解我的技术背景、技能栈和职业经历。",
};

export default async function AboutPage() {
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

  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-[980px]">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">关于我</h1>
        </FadeIn>

        {/* 个人简介 */}
        <FadeIn delay={0.08}>
          <div className="mt-12 flex flex-col items-start gap-8 sm:flex-row">
            {profile?.avatar && (
              <div className="shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name ?? "头像"}
                  className="size-32 rounded-2xl object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              {profile?.headline && (
                <p className="text-brand text-sm font-medium">{profile.headline}</p>
              )}
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {profile?.name ?? "全栈工程师"}
              </h2>
              {profile?.bio && (
                <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{profile.bio}</p>
              )}
              {profile?.location && (
                <p className="text-muted-foreground mt-2 text-sm">📍 {profile.location}</p>
              )}
            </div>
          </div>
        </FadeIn>

        {/* 技能 */}
        <FadeIn delay={0.16}>
          <div className="mt-20">
            <h2 className="text-2xl font-semibold tracking-tight">技能栈</h2>
            <div className="mt-8 space-y-8">
              {Object.entries(skillCategories).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="text-muted-foreground mb-4 text-sm font-medium">{category}</h3>
                  <div className="space-y-3">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-4">
                        <span className="w-24 text-sm font-medium">{skill.name}</span>
                        <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                          <div
                            className="bg-brand absolute inset-y-0 left-0 rounded-full transition-all"
                            style={{ width: `${skill.level ?? 0}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-8 text-right text-xs">
                          {skill.level}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 社交链接 */}
        {socialLinks.length > 0 && (
          <FadeIn delay={0.24}>
            <div className="mt-20">
              <h2 className="text-2xl font-semibold tracking-tight">联系方式</h2>
              <Stagger className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <StaggerItem key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border/60 bg-card hover:border-brand/40 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors"
                    >
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

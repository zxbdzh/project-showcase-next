import { getSkills } from "@/features/skills/queries";
import { getFeaturedProjects } from "@/features/projects/queries";
import { getAdminProfile } from "@/features/profile/queries";
import { getSocialLinks } from "@/features/social-links/queries";
import { DEFAULT_HERO_COMMANDS, type HeroCommand } from "./schema";

/** 去掉会破坏终端 *高亮* 标记的星号并裁空白(DB 内容是任意文本)。 */
const clean = (s: string | null | undefined) => (s ?? "").replace(/\*/g, "").trim();

/** 截断到 n 个字符,超出补省略号。 */
const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** 库表为空时退回对应默认命令文案,保证终端永不空场。 */
const defaultOutput = (name: string) =>
  DEFAULT_HERO_COMMANDS.find((c) => c.name === name)?.output ?? "";

/**
 * 从真实库表实时拼装 Hero 终端命令(whoami / skills / projects / about / contact)。
 * 复用各域已带 cacheTag 的查询,新增项目 / 技能 / 社交链接后终端自动同步;某表为空则该命令回退默认文案。
 * 输出沿用终端标记:*星号* 高亮、/projects 等站内路由与网址自动链接化。
 */
export async function getHeroCommands(): Promise<HeroCommand[]> {
  const [skills, featured, profile, socials] = await Promise.all([
    getSkills(),
    getFeaturedProjects(3),
    getAdminProfile(),
    getSocialLinks(),
  ]);

  // whoami:简介 + headline + 技术栈速览
  const headline = clean(profile?.headline);
  const name = clean(profile?.name);
  const skillNames = skills.map((s) => clean(s.name)).filter(Boolean);
  let whoami: string;
  if (headline || skillNames.length) {
    const lines = [
      headline ? `*${name ? `${name} · ` : ""}${headline}*` : "*Java 全栈开发者 · 端到端类型安全*",
    ];
    if (skillNames.length) lines.push(skillNames.slice(0, 8).join("  "));
    lines.push("提示: 输入 help 查看可用命令");
    whoami = lines.join("\n");
  } else {
    whoami = defaultOutput("whoami");
  }

  // skills:按 category 分组列出
  let skillsOut: string;
  if (skills.length) {
    const groups = new Map<string, string[]>();
    for (const s of skills) {
      const cat = clean(s.category) || "其他";
      const arr = groups.get(cat) ?? [];
      const n = clean(s.name);
      if (n) arr.push(n);
      groups.set(cat, arr);
    }
    skillsOut = Array.from(groups.entries())
      .filter(([, names]) => names.length)
      .map(([cat, names]) => `${cat}  *${names.join("  ")}*`)
      .join("\n");
  } else {
    skillsOut = defaultOutput("skills");
  }

  // projects:精选项目标题 + 技术栈,末尾给 /projects 链接
  let projectsOut: string;
  if (featured.length) {
    const lines = featured.map((p) => {
      const tech = (p.techStack ?? []).slice(0, 3).map(clean).filter(Boolean).join(" + ");
      return `  · *${clean(p.title)}*${tech ? `  ${tech}` : ""}`;
    });
    projectsOut = ["精选作品:", ...lines, "查看全部 → /projects"].join("\n");
  } else {
    projectsOut = defaultOutput("projects");
  }

  // about:个人简介摘要 + /about 链接
  const bio = clean(profile?.bio);
  const aboutOut = bio ? `${truncate(bio, 120)}\n了解更多 → /about` : defaultOutput("about");

  // contact:仅来自 social-links 表(不暴露邮箱),末尾给 /contact 链接
  let contactOut: string;
  if (socials.length) {
    const lines = socials.map((s) => `${clean(s.platform)}   ${s.url}`);
    lines.push("合作 · 全职 · 技术交流均欢迎");
    lines.push("联系我 → /contact");
    contactOut = lines.join("\n");
  } else {
    contactOut = defaultOutput("contact");
  }

  return [
    { name: "whoami", desc: "简介", output: whoami },
    { name: "skills", desc: "技术栈", output: skillsOut },
    { name: "projects", desc: "精选作品", output: projectsOut },
    { name: "about", desc: "关于我", output: aboutOut },
    { name: "contact", desc: "联系方式", output: contactOut },
  ];
}

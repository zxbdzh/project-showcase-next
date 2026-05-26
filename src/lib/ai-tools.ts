import { tool } from "ai";
import { z } from "zod";
import { getProjectList, getProjectBySlug } from "@/features/projects/queries";
import { getSkills } from "@/features/skills/queries";
import { getAdminProfile } from "@/features/profile/queries";
import { getSocialLinks } from "@/features/social-links/queries";

/** 去除 Markdown/MDX 标记并截断,避免把整篇正文塞给模型(省 token)。 */
function excerpt(md: string | null | undefined, max = 600): string {
  if (!md) return "";
  const text = md
    .replace(/```[\s\S]*?```/g, " ") // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接保留文字
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/**
 * AI 分身可调用的只读工具集。
 * 全部走 features/*\/queries.ts 的「前台公开查询」(仅 published / 公开字段),
 * 天然不暴露草稿与后台数据;让模型按需实时取数,而非把全量上下文塞进 prompt。
 */
export const aiTools = {
  searchProjects: tool({
    description:
      "查询 zxb 已发布的项目清单(标题、slug、简介、技术栈、分类)。访客问到项目时调用。" +
      "想列出全部项目时不要传 query;只有按关键词筛选时才传 query。",
    inputSchema: z.object({
      query: z.string().optional().describe("可选关键词;想列出全部项目时务必留空"),
    }),
    execute: async ({ query }) => {
      // 作品集体量小,一次取全量(最多 50),再按关键词在内存里软筛,
      // 关键词匹配标题/简介/技术栈/分类——避免弱模型把可选 query 填成
      // 标题里没有的词(如"全栈")时检索为空。软筛命中为空则回退全部。
      const { items, total } = await getProjectList({ pageSize: 50 });
      const all = items.map((p) => ({
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        techStack: p.techStack ?? [],
        category: p.category?.name ?? null,
      }));
      const kw = query?.trim().toLowerCase();
      let projects = all;
      if (kw) {
        const hit = all.filter((p) =>
          [p.title, p.summary, p.category, ...p.techStack]
            .filter(Boolean)
            .some((f) => String(f).toLowerCase().includes(kw))
        );
        if (hit.length > 0) projects = hit;
      }
      return { total, count: projects.length, projects };
    },
  }),

  getProjectDetail: tool({
    description:
      "获取单个项目的详情(简介、技术栈、标签、演示/仓库链接、正文摘要)。访客追问某个具体项目时用。" +
      "传 slug 或项目标题均可,工具会自动匹配。",
    inputSchema: z.object({
      slug: z.string().describe("项目 slug 或标题(优先用 searchProjects 返回的 slug)"),
    }),
    execute: async ({ slug }) => {
      // 弱模型常凭空猜 slug 导致查不到。先按原值精确查,失败再用全量清单
      // 模糊匹配 slug/标题(忽略大小写、双向包含),把猜错的 slug/标题兜回真实项目。
      let p = await getProjectBySlug(slug);
      if (!p) {
        const { items } = await getProjectList({ pageSize: 50 });
        const key = slug.trim().toLowerCase();
        const match =
          items.find((i) => i.slug.toLowerCase() === key || i.title.toLowerCase() === key) ??
          items.find((i) => {
            const t = i.title.toLowerCase();
            const s = i.slug.toLowerCase();
            return t.includes(key) || key.includes(t) || s.includes(key) || key.includes(s);
          });
        if (match) p = await getProjectBySlug(match.slug);
      }
      if (!p) {
        // 兜底:给出现有项目标题,便于模型据实纠正,而不是回「没有」。
        const { items } = await getProjectList({ pageSize: 50 });
        return { found: false as const, availableTitles: items.map((i) => i.title) };
      }
      return {
        found: true as const,
        title: p.title,
        summary: p.summary,
        techStack: p.techStack ?? [],
        tags: p.tags.map((t) => t.name),
        category: p.category?.name ?? null,
        demoUrl: p.demoUrl,
        repoUrl: p.repoUrl,
        excerpt: excerpt(p.content),
      };
    },
  }),

  listSkills: tool({
    description: "列出 zxb 掌握的技术栈/技能(含分类)。访客问「会什么技术 / 技术栈」时用。",
    inputSchema: z.object({}),
    execute: async () => {
      const skills = await getSkills();
      return {
        skills: skills.map((s) => ({ name: s.name, category: s.category })),
      };
    },
  }),

  getContactInfo: tool({
    description: "获取 zxb 的联系方式与社交链接。访客问「怎么联系 / 合作 / GitHub」时用。",
    inputSchema: z.object({}),
    execute: async () => {
      const [profile, links] = await Promise.all([getAdminProfile(), getSocialLinks()]);
      return {
        email: profile?.email ?? null,
        website: profile?.website ?? null,
        location: profile?.location ?? null,
        socials: links.map((l) => ({ platform: l.platform, url: l.url })),
      };
    },
  }),
};

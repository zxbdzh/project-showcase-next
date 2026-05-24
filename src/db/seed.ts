import "dotenv/config";
import { db } from "./index";
import { categories, tags, skills, socialLinks, projects, projectsToTags } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Categories
  await db
    .insert(categories)
    .values([
      { id: "cat-1", name: "Web 应用", slug: "web-app", description: "全栈 Web 应用项目" },
      { id: "cat-2", name: "开源工具", slug: "open-source", description: "开源工具与库" },
      { id: "cat-3", name: "移动应用", slug: "mobile", description: "移动端应用" },
    ])
    .onConflictDoNothing();

  // Tags
  await db
    .insert(tags)
    .values([
      { id: "tag-1", name: "React", slug: "react" },
      { id: "tag-2", name: "Next.js", slug: "nextjs" },
      { id: "tag-3", name: "TypeScript", slug: "typescript" },
      { id: "tag-4", name: "Tailwind CSS", slug: "tailwindcss" },
      { id: "tag-5", name: "Prisma", slug: "prisma" },
      { id: "tag-6", name: "PostgreSQL", slug: "postgresql" },
    ])
    .onConflictDoNothing();

  // Skills
  await db
    .insert(skills)
    .values([
      { id: "skill-1", name: "React", category: "前端", level: 95, sortOrder: 1 },
      { id: "skill-2", name: "Next.js", category: "前端", level: 90, sortOrder: 2 },
      { id: "skill-3", name: "TypeScript", category: "语言", level: 92, sortOrder: 3 },
      { id: "skill-4", name: "Node.js", category: "后端", level: 88, sortOrder: 4 },
      { id: "skill-5", name: "PostgreSQL", category: "数据库", level: 85, sortOrder: 5 },
      { id: "skill-6", name: "Docker", category: "DevOps", level: 80, sortOrder: 6 },
    ])
    .onConflictDoNothing();

  // Social Links
  await db
    .insert(socialLinks)
    .values([
      { id: "social-1", platform: "GitHub", url: "https://github.com", sortOrder: 1 },
      { id: "social-2", platform: "Twitter", url: "https://twitter.com", sortOrder: 2 },
      { id: "social-3", platform: "LinkedIn", url: "https://linkedin.com", sortOrder: 3 },
    ])
    .onConflictDoNothing();

  // Projects
  await db
    .insert(projects)
    .values([
      {
        id: "proj-1",
        slug: "project-showcase",
        title: "Project Showcase",
        summary: "全栈作品集网站，展示项目与技术能力",
        content: "# Project Showcase\n\n一个现代化的作品集网站...",
        techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
        featured: true,
        status: "published",
        categoryId: "cat-1",
        sortOrder: 1,
      },
      {
        id: "proj-2",
        slug: "open-source-lib",
        title: "开源工具库",
        summary: "一组实用的开源工具函数",
        content: "# 开源工具库\n\n常用工具函数集合...",
        techStack: ["TypeScript", "Vitest"],
        featured: false,
        status: "published",
        categoryId: "cat-2",
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();

  // Project-Tag relations
  await db
    .insert(projectsToTags)
    .values([
      { projectId: "proj-1", tagId: "tag-1" },
      { projectId: "proj-1", tagId: "tag-2" },
      { projectId: "proj-1", tagId: "tag-3" },
      { projectId: "proj-1", tagId: "tag-4" },
      { projectId: "proj-2", tagId: "tag-3" },
    ])
    .onConflictDoNothing();

  console.log("✅ Seed completed!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

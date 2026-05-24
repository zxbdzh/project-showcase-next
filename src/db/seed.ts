import "dotenv/config";
import { db } from "./index";
import {
  categories,
  tags,
  skills,
  socialLinks,
  projects,
  projectsToTags,
  users,
  profiles,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // ===== 管理员账号 + 个人简介(about 页用)=====
  // 注意:name / email / GitHub 为占位,请替换为真实信息
  await db
    .insert(users)
    .values({
      id: "user-zxb",
      name: "zxb",
      email: "zxb@example.com",
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { name: "zxb", email: "zxb@example.com", role: "admin" },
    });

  await db
    .insert(profiles)
    .values({
      id: "profile-zxb",
      userId: "user-zxb",
      headline: "全栈开发者 · 跨端 · AI 应用",
      bio: "全栈开发者。独立完成了 10+ 个项目,覆盖 Web 全栈、跨端小程序、桌面应用、嵌入式与数据科学。习惯用 TypeScript 把前后端串成端到端类型安全的闭环,也能用 Java / Python 写后端服务;偏好把复杂需求收敛成简洁、可上线、可维护的产品,并把测试、CI、Docker 与类型安全当作工程底线。",
      website: "https://github.com/zxbdzh",
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        headline: "全栈开发者 · 跨端 · AI 应用",
        bio: "全栈开发者。独立完成了 10+ 个项目,覆盖 Web 全栈、跨端小程序、桌面应用、嵌入式与数据科学。习惯用 TypeScript 把前后端串成端到端类型安全的闭环,也能用 Java / Python 写后端服务;偏好把复杂需求收敛成简洁、可上线、可维护的产品,并把测试、CI、Docker 与类型安全当作工程底线。",
        website: "https://github.com/zxbdzh",
      },
    });

  // ===== 技术栈(真实掌握,按领域分类)=====
  await db.delete(skills);
  await db.insert(skills).values([
    // 语言
    { id: "skill-ts", name: "TypeScript", category: "语言", level: 92, sortOrder: 1 },
    { id: "skill-java", name: "Java", category: "语言", level: 85, sortOrder: 2 },
    { id: "skill-py", name: "Python", category: "语言", level: 85, sortOrder: 3 },
    { id: "skill-cs", name: "C#", category: "语言", level: 70, sortOrder: 4 },
    // 前端
    { id: "skill-react", name: "React", category: "前端", level: 90, sortOrder: 10 },
    { id: "skill-vue", name: "Vue", category: "前端", level: 88, sortOrder: 11 },
    { id: "skill-next", name: "Next.js", category: "前端", level: 86, sortOrder: 12 },
    { id: "skill-uniapp", name: "uni-app", category: "前端", level: 85, sortOrder: 13 },
    { id: "skill-tailwind", name: "Tailwind CSS", category: "前端", level: 88, sortOrder: 14 },
    // 后端
    { id: "skill-node", name: "Node.js", category: "后端", level: 85, sortOrder: 20 },
    { id: "skill-spring", name: "Spring Boot", category: "后端", level: 82, sortOrder: 21 },
    { id: "skill-fastapi", name: "FastAPI", category: "后端", level: 80, sortOrder: 22 },
    // 数据库
    { id: "skill-pg", name: "PostgreSQL", category: "数据库", level: 80, sortOrder: 30 },
    { id: "skill-mysql", name: "MySQL", category: "数据库", level: 82, sortOrder: 31 },
    { id: "skill-redis", name: "Redis", category: "数据库", level: 76, sortOrder: 32 },
    { id: "skill-drizzle", name: "Drizzle ORM", category: "数据库", level: 82, sortOrder: 33 },
    // 桌面 / 跨端
    { id: "skill-electron", name: "Electron", category: "桌面/跨端", level: 82, sortOrder: 40 },
    { id: "skill-wxapp", name: "微信小程序", category: "桌面/跨端", level: 80, sortOrder: 41 },
    // 工程化
    { id: "skill-docker", name: "Docker", category: "工程化", level: 78, sortOrder: 50 },
    { id: "skill-git", name: "Git", category: "工程化", level: 90, sortOrder: 51 },
    { id: "skill-vitest", name: "Vitest", category: "工程化", level: 80, sortOrder: 52 },
    // AI / 其他
    { id: "skill-ai", name: "LLM 应用集成", category: "AI/其他", level: 76, sortOrder: 60 },
    { id: "skill-unity", name: "Unity", category: "AI/其他", level: 62, sortOrder: 61 },
  ]);

  // ===== 社交链接(GitHub 用户名为推断,请核对)=====
  await db.delete(socialLinks);
  await db.insert(socialLinks).values([
    { id: "social-github", platform: "GitHub", url: "https://github.com/zxbdzh", sortOrder: 1 },
    { id: "social-email", platform: "Email", url: "mailto:zxb@example.com", sortOrder: 2 },
  ]);

  // ===== 以下为占位作品数据,本次保持不动 =====
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

import { db } from "@/db";
import { projects, categories, tags, projectsToTags } from "@/db/schema";
import { eq, desc, asc, and, sql, ilike, count } from "drizzle-orm";
import { cacheTag } from "next/cache";

/** 获取精选项目(首页用) */
export async function getFeaturedProjects(limit = 6) {
  "use cache";
  cacheTag("projects");
  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      summary: projects.summary,
      coverImage: projects.coverImage,
      techStack: projects.techStack,
      category: { name: categories.name, slug: categories.slug },
    })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(and(eq(projects.featured, true), eq(projects.status, "published")))
    .orderBy(asc(projects.sortOrder))
    .limit(limit);
}

/** 获取项目列表(带筛选、搜索、分页) */
export async function getProjectList(params: {
  categorySlug?: string;
  tagSlug?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  "use cache";
  cacheTag("projects");
  const { categorySlug, q, page = 1, pageSize = 12 } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(projects.status, "published")];
  if (categorySlug) {
    conditions.push(eq(categories.slug, categorySlug));
  }
  if (q) {
    conditions.push(ilike(projects.title, `%${q}%`));
  }

  const where = and(...conditions);

  const query = db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      summary: projects.summary,
      coverImage: projects.coverImage,
      techStack: projects.techStack,
      category: { name: categories.name, slug: categories.slug },
    })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(where)
    .orderBy(desc(projects.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [items, totalResult] = await Promise.all([
    query,
    db
      .select({ total: count() })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .where(where),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/** 获取项目详情(含标签) */
export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheTag("projects");
  const project = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      summary: projects.summary,
      content: projects.content,
      coverImage: projects.coverImage,
      demoUrl: projects.demoUrl,
      repoUrl: projects.repoUrl,
      techStack: projects.techStack,
      featured: projects.featured,
      views: projects.views,
      createdAt: projects.createdAt,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
    })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
    .limit(1);

  if (!project[0]) return null;

  const projectTags = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(projectsToTags)
    .innerJoin(tags, eq(projectsToTags.tagId, tags.id))
    .where(eq(projectsToTags.projectId, project[0].id));

  return { ...project[0], tags: projectTags };
}

/** 项目浏览量 +1 */
export async function incrementProjectViews(id: string) {
  await db
    .update(projects)
    .set({ views: sql`${projects.views} + 1` })
    .where(eq(projects.id, id));
}

/** 获取相关项目(同分类,排除当前) */
export async function getRelatedProjects(categoryId: string | null, excludeId: string, limit = 3) {
  "use cache";
  cacheTag("projects");
  if (!categoryId) return [];

  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      summary: projects.summary,
      coverImage: projects.coverImage,
      techStack: projects.techStack,
    })
    .from(projects)
    .where(
      and(
        eq(projects.categoryId, categoryId),
        eq(projects.status, "published"),
        sql`${projects.id} != ${excludeId}`
      )
    )
    .orderBy(desc(projects.createdAt))
    .limit(limit);
}

/** 所有已发布项目 slug(generateStaticParams 预生成详情页用) */
export async function getPublishedProjectSlugs() {
  "use cache";
  cacheTag("projects");
  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.status, "published"));
  return rows.map((r) => r.slug);
}

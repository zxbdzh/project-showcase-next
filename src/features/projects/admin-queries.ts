import { db } from "@/db";
import { projects, categories, projectsToTags } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/** 后台:全部项目(含草稿),带分类名。不缓存,写后即时反映。 */
export async function listAdminProjects() {
  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      status: projects.status,
      featured: projects.featured,
      views: projects.views,
      coverImage: projects.coverImage,
      sortOrder: projects.sortOrder,
      categoryName: categories.name,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .orderBy(desc(projects.updatedAt));
}

/** 后台:全部项目 id(供动态路由 generateStaticParams 预生成 shell)。 */
export async function listAllProjectIds() {
  const rows = await db.select({ id: projects.id }).from(projects);
  return rows.map((r) => r.id);
}

/** 后台:按 id 取项目全字段 + 关联标签 id(供编辑表单回填)。 */
export async function getAdminProjectById(id: string) {
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const project = rows[0];
  if (!project) return null;

  const tagRows = await db
    .select({ tagId: projectsToTags.tagId })
    .from(projectsToTags)
    .where(eq(projectsToTags.projectId, id));

  return { ...project, tagIds: tagRows.map((r) => r.tagId) };
}

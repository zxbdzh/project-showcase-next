import { db } from "@/db";
import { projects, categories, tags, skills, socialLinks } from "@/db/schema";
import { count, sum, eq, desc } from "drizzle-orm";

/** 后台概览统计。不缓存,写后即时反映。 */
export async function getAdminStats() {
  const [[projectAgg], [publishedAgg], [categoryAgg], [tagAgg], [skillAgg], [socialAgg], recent] =
    await Promise.all([
      db.select({ total: count(), views: sum(projects.views) }).from(projects),
      db.select({ total: count() }).from(projects).where(eq(projects.status, "published")),
      db.select({ total: count() }).from(categories),
      db.select({ total: count() }).from(tags),
      db.select({ total: count() }).from(skills),
      db.select({ total: count() }).from(socialLinks),
      db
        .select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          views: projects.views,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .orderBy(desc(projects.updatedAt))
        .limit(5),
    ]);

  const total = projectAgg?.total ?? 0;
  const published = publishedAgg?.total ?? 0;

  return {
    projects: {
      total,
      published,
      draft: total - published,
      views: Number(projectAgg?.views ?? 0),
    },
    categories: categoryAgg?.total ?? 0,
    tags: tagAgg?.total ?? 0,
    skills: skillAgg?.total ?? 0,
    socialLinks: socialAgg?.total ?? 0,
    recent,
  };
}

"use server";

import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { projects, projectsToTags } from "@/db/schema";
import { actionFail, actionOk, requireAdmin, type ActionResult } from "@/lib/action-result";
import { projectFormSchema, type ProjectFormValues } from "./schema";

const idSchema = z.string().min(1);

/** 写后失效前台缓存与后台列表。 */
function revalidateProjects() {
  updateTag("projects");
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

/** 空串归一为 null(可空列);供落库使用。 */
function emptyToNull(v: string): string | null {
  return v.trim() === "" ? null : v;
}

function toRow(values: ProjectFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: emptyToNull(values.summary),
    content: emptyToNull(values.content),
    coverImage: emptyToNull(values.coverImage),
    demoUrl: emptyToNull(values.demoUrl),
    repoUrl: emptyToNull(values.repoUrl),
    techStack: values.techStack.length ? values.techStack : null,
    featured: values.featured,
    status: values.status,
    sortOrder: values.sortOrder,
    categoryId: emptyToNull(values.categoryId),
  };
}

/** slug 是否已被占用(更新时排除自身)。 */
async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const where = excludeId
    ? and(eq(projects.slug, slug), ne(projects.id, excludeId))
    : eq(projects.slug, slug);
  const rows = await db.select({ id: projects.id }).from(projects).where(where).limit(1);
  return rows.length > 0;
}

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  if (await slugTaken(parsed.data.slug)) {
    return actionFail("slug 已存在", { slug: ["该 slug 已被占用"] });
  }

  const id = crypto.randomUUID();
  const row = toRow(parsed.data);

  await db.insert(projects).values({ id, ...row });
  if (parsed.data.tagIds.length) {
    await db
      .insert(projectsToTags)
      .values(parsed.data.tagIds.map((tagId) => ({ projectId: id, tagId })));
  }

  revalidateProjects();
  return actionOk({ id });
}

export async function updateProject(
  id: unknown,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const pid = idSchema.safeParse(id);
  if (!pid.success) return actionFail("无效的项目 id");

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  if (await slugTaken(parsed.data.slug, pid.data)) {
    return actionFail("slug 已存在", { slug: ["该 slug 已被占用"] });
  }

  const row = toRow(parsed.data);
  await db
    .update(projects)
    .set({ ...row, updatedAt: new Date() })
    .where(eq(projects.id, pid.data));

  // 标签:全删再插(数量小,简单可靠)
  await db.delete(projectsToTags).where(eq(projectsToTags.projectId, pid.data));
  if (parsed.data.tagIds.length) {
    await db
      .insert(projectsToTags)
      .values(parsed.data.tagIds.map((tagId) => ({ projectId: pid.data, tagId })));
  }

  revalidateProjects();
  return actionOk({ id: pid.data });
}

export async function deleteProject(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const pid = idSchema.safeParse(id);
  if (!pid.success) return actionFail("无效的项目 id");

  await db.delete(projects).where(eq(projects.id, pid.data));
  revalidateProjects();
  return actionOk(undefined);
}

export async function toggleProjectPublished(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const pid = idSchema.safeParse(id);
  if (!pid.success) return actionFail("无效的项目 id");

  const rows = await db
    .select({ status: projects.status })
    .from(projects)
    .where(eq(projects.id, pid.data))
    .limit(1);
  if (!rows[0]) return actionFail("项目不存在");

  await db
    .update(projects)
    .set({ status: rows[0].status === "published" ? "draft" : "published", updatedAt: new Date() })
    .where(eq(projects.id, pid.data));

  revalidateProjects();
  return actionOk(undefined);
}

export async function toggleProjectFeatured(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const pid = idSchema.safeParse(id);
  if (!pid.success) return actionFail("无效的项目 id");

  const rows = await db
    .select({ featured: projects.featured })
    .from(projects)
    .where(eq(projects.id, pid.data))
    .limit(1);
  if (!rows[0]) return actionFail("项目不存在");

  await db
    .update(projects)
    .set({ featured: !rows[0].featured, updatedAt: new Date() })
    .where(eq(projects.id, pid.data));

  revalidateProjects();
  return actionOk(undefined);
}

"use server";

import { z } from "zod";
import { and, eq, ne, or } from "drizzle-orm";
import { revalidatePath, updateTag as bustTag } from "next/cache";
import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { actionFail, actionOk, requireAdmin, type ActionResult } from "@/lib/action-result";
import { categoryFormSchema, tagFormSchema } from "./schema";

const idSchema = z.string().min(1);

function emptyToNull(v: string): string | null {
  return v.trim() === "" ? null : v;
}

function revalidateCategories() {
  bustTag("categories");
  revalidatePath("/admin/categories");
  revalidatePath("/projects");
}

function revalidateTags() {
  bustTag("tags");
  revalidatePath("/admin/tags");
  revalidatePath("/projects");
}

// ---- 分类 ----

async function categoryDup(
  name: string,
  slug: string,
  excludeId?: string
): Promise<Record<string, string[]> | null> {
  const base = or(eq(categories.name, name), eq(categories.slug, slug));
  const rows = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(excludeId ? and(base, ne(categories.id, excludeId)) : base);
  const fe: Record<string, string[]> = {};
  if (rows.some((r) => r.name === name)) fe.name = ["该名称已存在"];
  if (rows.some((r) => r.slug === slug)) fe.slug = ["该 slug 已存在"];
  return Object.keys(fe).length ? fe : null;
}

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const dup = await categoryDup(parsed.data.name, parsed.data.slug);
  if (dup) return actionFail("名称或 slug 已存在", dup);

  const id = crypto.randomUUID();
  await db.insert(categories).values({
    id,
    name: parsed.data.name.trim(),
    slug: parsed.data.slug.trim(),
    description: emptyToNull(parsed.data.description),
  });

  revalidateCategories();
  return actionOk({ id });
}

export async function updateCategory(
  id: unknown,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const cid = idSchema.safeParse(id);
  if (!cid.success) return actionFail("无效的分类 id");

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const dup = await categoryDup(parsed.data.name, parsed.data.slug, cid.data);
  if (dup) return actionFail("名称或 slug 已存在", dup);

  await db
    .update(categories)
    .set({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: emptyToNull(parsed.data.description),
    })
    .where(eq(categories.id, cid.data));

  revalidateCategories();
  return actionOk({ id: cid.data });
}

export async function deleteCategory(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const cid = idSchema.safeParse(id);
  if (!cid.success) return actionFail("无效的分类 id");

  await db.delete(categories).where(eq(categories.id, cid.data));
  revalidateCategories();
  return actionOk(undefined);
}

// ---- 标签 ----

async function tagDup(
  name: string,
  slug: string,
  excludeId?: string
): Promise<Record<string, string[]> | null> {
  const base = or(eq(tags.name, name), eq(tags.slug, slug));
  const rows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(tags)
    .where(excludeId ? and(base, ne(tags.id, excludeId)) : base);
  const fe: Record<string, string[]> = {};
  if (rows.some((r) => r.name === name)) fe.name = ["该名称已存在"];
  if (rows.some((r) => r.slug === slug)) fe.slug = ["该 slug 已存在"];
  return Object.keys(fe).length ? fe : null;
}

export async function createTag(input: unknown): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const dup = await tagDup(parsed.data.name, parsed.data.slug);
  if (dup) return actionFail("名称或 slug 已存在", dup);

  const id = crypto.randomUUID();
  await db.insert(tags).values({
    id,
    name: parsed.data.name.trim(),
    slug: parsed.data.slug.trim(),
  });

  revalidateTags();
  return actionOk({ id });
}

export async function updateTag(
  id: unknown,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const tid = idSchema.safeParse(id);
  if (!tid.success) return actionFail("无效的标签 id");

  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const dup = await tagDup(parsed.data.name, parsed.data.slug, tid.data);
  if (dup) return actionFail("名称或 slug 已存在", dup);

  await db
    .update(tags)
    .set({ name: parsed.data.name.trim(), slug: parsed.data.slug.trim() })
    .where(eq(tags.id, tid.data));

  revalidateTags();
  return actionOk({ id: tid.data });
}

export async function deleteTag(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const tid = idSchema.safeParse(id);
  if (!tid.success) return actionFail("无效的标签 id");

  await db.delete(tags).where(eq(tags.id, tid.data));
  revalidateTags();
  return actionOk(undefined);
}

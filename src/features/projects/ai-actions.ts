"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag as bustTag } from "next/cache";
import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { getModel } from "@/lib/ai";
import { actionFail, actionOk, requireAdmin, type ActionResult } from "@/lib/action-result";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function randSuffix(): string {
  return crypto.randomUUID().slice(0, 4);
}

// AI no-schema 返回的可能是已解析对象,也可能是 JSON 字符串,统一成对象。
function coerceObject(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

const titleSchema = z.string().trim().min(1, "请先填写标题").max(200);
const contentSchema = z.string().trim().min(20, "正文内容太短,请先填写正文再分析");

/** 由标题用 AI 生成英文 slug(中文翻译/音译);失败回退到本地 slugify。 */
export async function generateSlug(rawTitle: unknown): Promise<ActionResult<{ slug: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = titleSchema.safeParse(rawTitle);
  if (!parsed.success) return actionFail(parsed.error.issues[0]?.message ?? "标题无效");
  const title = parsed.data;

  const prompt = `你是为技术项目生成 URL slug 的助手。
根据项目标题生成一个简洁的英文 slug(2-5 个单词,全小写,用连字符连接,只含 a-z、0-9 和连字符)。
中文标题请翻译或音译为有意义的英文,不要加任何解释。
只返回 JSON:{"slug":"example-project"}

项目标题:${title}`;

  let aiSlug = "";
  try {
    const { object } = await generateObject({ model: getModel(), output: "no-schema", prompt });
    const r = z.object({ slug: z.string() }).safeParse(coerceObject(object));
    if (r.success) aiSlug = slugify(r.data.slug);
  } catch {
    // 落到回退
  }

  const slug = aiSlug || slugify(title);
  if (!slug) return actionFail("无法生成 slug,请手动填写");
  return actionOk({ slug });
}

async function findOrCreateTag(
  name: string,
  aiSlug: string
): Promise<{ id: string; name: string }> {
  const trimmed = name.trim().slice(0, 100);
  const existing = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(eq(tags.name, trimmed))
    .limit(1);
  if (existing.length) return existing[0];

  let slug = slugify(aiSlug) || slugify(trimmed) || `tag-${randSuffix()}`;
  const taken = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, slug)).limit(1);
  if (taken.length) slug = `${slug}-${randSuffix()}`;

  const id = crypto.randomUUID();
  await db.insert(tags).values({ id, name: trimmed, slug });
  return { id, name: trimmed };
}

async function findOrCreateCategory(
  name: string,
  aiSlug: string
): Promise<{ id: string; name: string }> {
  const trimmed = name.trim().slice(0, 100);
  const existing = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.name, trimmed))
    .limit(1);
  if (existing.length) return existing[0];

  let slug = slugify(aiSlug) || slugify(trimmed) || `category-${randSuffix()}`;
  const taken = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (taken.length) slug = `${slug}-${randSuffix()}`;

  const id = crypto.randomUUID();
  await db.insert(categories).values({ id, name: trimmed, slug, description: null });
  return { id, name: trimmed };
}

/** 分析正文(Markdown),AI 生成标签与分类并 find-or-create 入库,回传 id 供表单选中。 */
export async function generateTaxonomy(rawContent: unknown): Promise<
  ActionResult<{
    tags: { id: string; name: string }[];
    category: { id: string; name: string } | null;
  }>
> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = contentSchema.safeParse(rawContent);
  if (!parsed.success) return actionFail(parsed.error.issues[0]?.message ?? "正文无效");
  const content = parsed.data.slice(0, 4000);

  const prompt = `你是技术博客内容分析助手。根据下面的项目正文(Markdown),分析并生成:
1. 一个最贴切的分类(category):中文名称 + 英文 slug
2. 3-6 个标签(tags):每个含中文名称 + 英文 slug;标签为技术栈 / 领域 / 项目类型等关键词
slug 只含小写字母、数字和连字符,不要加任何解释。
只返回 JSON:{"category":{"name":"中文名","slug":"english-slug"},"tags":[{"name":"中文名","slug":"english-slug"}]}

项目正文:
${content}`;

  let result: {
    category: { name: string; slug: string } | null;
    tags: { name: string; slug: string }[];
  };
  try {
    const { object } = await generateObject({ model: getModel(), output: "no-schema", prompt });
    const schema = z.object({
      category: z.object({ name: z.string(), slug: z.string() }).nullish(),
      tags: z.array(z.object({ name: z.string(), slug: z.string() })).default([]),
    });
    const r = schema.safeParse(coerceObject(object));
    if (!r.success) return actionFail("AI 返回格式异常,请重试");
    result = { category: r.data.category ?? null, tags: r.data.tags };
  } catch {
    return actionFail("AI 调用失败,请稍后重试");
  }

  const seen = new Set<string>();
  const outTags: { id: string; name: string }[] = [];
  for (const t of result.tags.slice(0, 8)) {
    const nm = t.name.trim();
    if (!nm || seen.has(nm)) continue;
    seen.add(nm);
    outTags.push(await findOrCreateTag(nm, t.slug));
  }

  let outCategory: { id: string; name: string } | null = null;
  if (result.category && result.category.name.trim()) {
    outCategory = await findOrCreateCategory(result.category.name, result.category.slug);
  }

  bustTag("tags");
  bustTag("categories");
  revalidatePath("/admin/tags");
  revalidatePath("/admin/categories");
  revalidatePath("/projects");

  return actionOk({ tags: outTags, category: outCategory });
}

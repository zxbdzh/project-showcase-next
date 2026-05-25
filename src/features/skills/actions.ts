"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag as bustTag } from "next/cache";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { actionFail, actionOk, requireAdmin, type ActionResult } from "@/lib/action-result";
import { skillFormSchema, type SkillFormValues } from "./schema";

const idSchema = z.string().min(1);

function emptyToNull(v: string): string | null {
  return v.trim() === "" ? null : v;
}

function revalidateSkills() {
  bustTag("skills");
  revalidatePath("/admin/skills");
  revalidatePath("/about");
}

function toRow(values: SkillFormValues) {
  return {
    name: values.name.trim(),
    category: emptyToNull(values.category),
    level: values.level,
    icon: emptyToNull(values.icon),
    sortOrder: values.sortOrder,
  };
}

export async function createSkill(input: unknown): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = skillFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const id = crypto.randomUUID();
  await db.insert(skills).values({ id, ...toRow(parsed.data) });

  revalidateSkills();
  return actionOk({ id });
}

export async function updateSkill(
  id: unknown,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const sid = idSchema.safeParse(id);
  if (!sid.success) return actionFail("无效的技能 id");

  const parsed = skillFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  await db.update(skills).set(toRow(parsed.data)).where(eq(skills.id, sid.data));

  revalidateSkills();
  return actionOk({ id: sid.data });
}

export async function deleteSkill(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const sid = idSchema.safeParse(id);
  if (!sid.success) return actionFail("无效的技能 id");

  await db.delete(skills).where(eq(skills.id, sid.data));
  revalidateSkills();
  return actionOk(undefined);
}

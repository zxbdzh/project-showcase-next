"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag as bustTag } from "next/cache";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { actionFail, actionOk, requireAdmin, type ActionResult } from "@/lib/action-result";
import { socialLinkFormSchema, type SocialLinkFormValues } from "./schema";

const idSchema = z.string().min(1);

function emptyToNull(v: string): string | null {
  return v.trim() === "" ? null : v;
}

function revalidateSocialLinks() {
  bustTag("social-links");
  revalidatePath("/admin/social-links");
  revalidatePath("/contact");
  revalidatePath("/about");
}

function toRow(values: SocialLinkFormValues) {
  return {
    platform: values.platform.trim(),
    url: values.url.trim(),
    icon: emptyToNull(values.icon),
    sortOrder: values.sortOrder,
  };
}

export async function createSocialLink(input: unknown): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = socialLinkFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const id = crypto.randomUUID();
  await db.insert(socialLinks).values({ id, ...toRow(parsed.data) });

  revalidateSocialLinks();
  return actionOk({ id });
}

export async function updateSocialLink(
  id: unknown,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const sid = idSchema.safeParse(id);
  if (!sid.success) return actionFail("无效的链接 id");

  const parsed = socialLinkFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  await db.update(socialLinks).set(toRow(parsed.data)).where(eq(socialLinks.id, sid.data));

  revalidateSocialLinks();
  return actionOk({ id: sid.data });
}

export async function deleteSocialLink(id: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const sid = idSchema.safeParse(id);
  if (!sid.success) return actionFail("无效的链接 id");

  await db.delete(socialLinks).where(eq(socialLinks.id, sid.data));
  revalidateSocialLinks();
  return actionOk(undefined);
}

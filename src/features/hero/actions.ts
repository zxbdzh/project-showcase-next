"use server";

import { z } from "zod";
import { revalidatePath, updateTag as bustTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { actionOk, actionFail, requireAdmin, type ActionResult } from "@/lib/action-result";
import { heroConfigSchema } from "./schema";

export async function updateHero(input: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = heroConfigSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  await db
    .insert(siteSettings)
    .values({ key: "hero", value: parsed.data })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: parsed.data, updatedAt: new Date() },
    });

  bustTag("hero");
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return actionOk(undefined);
}

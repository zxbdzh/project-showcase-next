"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag as bustTag } from "next/cache";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { actionOk, actionFail, requireAdmin, type ActionResult } from "@/lib/action-result";
import { profileFormSchema } from "./schema";

function emptyToNull(v: string): string | null {
  return v.trim() === "" ? null : v;
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const userId = guard.data.user.id;
  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) return actionFail("请检查输入", z.flattenError(parsed.error).fieldErrors);

  const data = {
    headline: emptyToNull(parsed.data.headline),
    bio: emptyToNull(parsed.data.bio),
    location: emptyToNull(parsed.data.location),
    website: emptyToNull(parsed.data.website),
    avatar: emptyToNull(parsed.data.avatar),
  };

  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ id: crypto.randomUUID(), userId, ...data });
  }

  bustTag("profile");
  revalidatePath("/admin/profile");
  revalidatePath("/about");
  revalidatePath("/");
  return actionOk(undefined);
}

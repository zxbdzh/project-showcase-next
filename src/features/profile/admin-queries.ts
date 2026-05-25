import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

/** 当前登录用户的资料(供编辑表单回填);不缓存,写后即时反映。 */
export async function getEditableProfile() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

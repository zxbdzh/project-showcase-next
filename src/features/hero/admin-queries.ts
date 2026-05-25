import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { coerceHeroConfig, type HeroConfig } from "./schema";

/** 供后台表单回填;不缓存,写后即时反映。 */
export async function getHeroConfigForEdit(): Promise<HeroConfig> {
  const rows = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "hero"))
    .limit(1);
  return coerceHeroConfig(rows[0]?.value);
}

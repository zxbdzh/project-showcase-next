import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { coerceHeroConfig, type HeroConfig } from "./schema";

/** 首页 Hero 配置(前台用)。缓存,写后由 updateHero 的 bustTag("hero") 失效。 */
export async function getHeroConfig(): Promise<HeroConfig> {
  "use cache";
  cacheTag("hero");
  const rows = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "hero"))
    .limit(1);
  return coerceHeroConfig(rows[0]?.value);
}

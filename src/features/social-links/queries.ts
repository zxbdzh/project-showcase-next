import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { asc } from "drizzle-orm";
import { cacheTag } from "next/cache";

/** 获取所有社交链接(按 sortOrder 排序) */
export async function getSocialLinks() {
  "use cache";
  cacheTag("social-links");
  return db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
}

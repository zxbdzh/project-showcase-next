import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { asc } from "drizzle-orm";

/** 获取所有社交链接(按 sortOrder 排序) */
export async function getSocialLinks() {
  return db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
}

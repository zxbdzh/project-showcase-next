import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { asc } from "drizzle-orm";
import { cacheTag } from "next/cache";

/** 获取所有分类(列表页筛选用) */
export async function getCategories() {
  "use cache";
  cacheTag("categories");
  return db.select().from(categories).orderBy(asc(categories.name));
}

/** 获取所有标签(列表页筛选用) */
export async function getTags() {
  "use cache";
  cacheTag("tags");
  return db.select().from(tags).orderBy(asc(tags.name));
}

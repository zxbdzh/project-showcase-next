import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { asc } from "drizzle-orm";

/** 获取所有分类(列表页筛选用) */
export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

/** 获取所有标签(列表页筛选用) */
export async function getTags() {
  return db.select().from(tags).orderBy(asc(tags.name));
}

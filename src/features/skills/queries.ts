import { db } from "@/db";
import { skills } from "@/db/schema";
import { asc, count } from "drizzle-orm";
import { cacheTag } from "next/cache";

/** 获取所有技能(按 sortOrder 排序) */
export async function getSkills() {
  "use cache";
  cacheTag("skills");
  return db.select().from(skills).orderBy(asc(skills.sortOrder));
}

/** 技能总数(首页「技术栈」统计用) */
export async function countSkills() {
  "use cache";
  cacheTag("skills");
  const [row] = await db.select({ total: count() }).from(skills);
  return row?.total ?? 0;
}

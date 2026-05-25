import { db } from "@/db";
import { skills } from "@/db/schema";
import { asc } from "drizzle-orm";
import { cacheTag } from "next/cache";

/** 获取所有技能(按 sortOrder 排序) */
export async function getSkills() {
  "use cache";
  cacheTag("skills");
  return db.select().from(skills).orderBy(asc(skills.sortOrder));
}

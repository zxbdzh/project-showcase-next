import { db } from "@/db";
import { skills } from "@/db/schema";
import { asc } from "drizzle-orm";

/** 获取所有技能(按 sortOrder 排序) */
export async function getSkills() {
  return db.select().from(skills).orderBy(asc(skills.sortOrder));
}

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

/** 获取管理员 profile(about 页用) */
export async function getAdminProfile() {
  "use cache";
  cacheTag("profile");
  const result = await db
    .select({
      bio: profiles.bio,
      headline: profiles.headline,
      location: profiles.location,
      website: profiles.website,
      avatar: profiles.avatar,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(users.role, "admin"))
    .limit(1);

  return result[0] ?? null;
}

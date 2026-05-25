import { auth } from "@/lib/auth";

/** 当前会话是否为管理员。供后台页面决定 UI 是否只读(写操作另由 Server Action 的 requireAdmin 兜底)。 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

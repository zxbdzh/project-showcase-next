import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

/** Server Action 统一返回结构:成功带 data,失败带 error 与可选字段级错误 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionFail(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/**
 * 后台鉴权守卫:返回 ActionResult 而非抛错,便于 action 内 `if (!guard.ok) return guard;`。
 * 失败分支在所有 ActionResult<T> 间结构一致,故可直接回传给任意写操作。
 */
export async function requireAdmin(): Promise<ActionResult<Session>> {
  const session = await auth();
  if (!session?.user) return actionFail("未登录,请先登录");
  if (session.user.role !== "admin") return actionFail("无权限");
  return actionOk(session);
}

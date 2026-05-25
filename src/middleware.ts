import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// middleware 跑在 Edge Runtime,只用不含 DB adapter 的配置校验 JWT,
// 避免把 pg / DrizzleAdapter 等 node 原生依赖打进 Edge。
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};

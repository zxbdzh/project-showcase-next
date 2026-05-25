import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// 不含 DB adapter,可在 Edge Runtime(middleware)安全加载;
// pg / DrizzleAdapter 仅在 auth.ts 的 Node 运行时引入,避免 Edge 打包 node 原生模块。
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "admin" | "user" }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "admin" | "user") ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

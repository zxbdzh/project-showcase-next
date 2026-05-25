import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { GithubLoginButton } from "./github-button";

export const metadata: Metadata = {
  title: "登录",
  description: "登录到作品集后台管理。",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <section className="flex min-h-[70vh] items-center">
      <Container className="mx-auto max-w-sm">
        <FadeIn>
          <h1 className="text-center text-2xl font-semibold tracking-tight">后台管理登录</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            使用 GitHub 账号登录以访问后台。
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mt-8">
            <GithubLoginButton />
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}

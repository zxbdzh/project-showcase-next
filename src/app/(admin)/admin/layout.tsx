import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "概览" },
  { href: "/admin/projects", label: "项目" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/tags", label: "标签" },
  { href: "/admin/skills", label: "技能" },
  { href: "/admin/social-links", label: "社交链接" },
  { href: "/admin/profile", label: "资料" },
  { href: "/admin/hero", label: "首页 Hero" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: ReactNode }) {
  // 后台整体为运行期动态:声明运行期连接,使整个子树在构建期 postpone、不连数据库
  //(GitHub 构建机连不到自托管库)。各后台页的取数随之推迟到运行期(NAS 内可连库)。
  await connection();
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // 演示:任意登录用户均可进入后台并操作界面,但写操作会被各 Server Action 的 requireAdmin 拒绝。
  const admin = session.user.role === "admin";

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="border-border/60 hidden w-60 shrink-0 border-r p-4 md:block">
        <Link href="/" className="mb-6 block px-2 font-mono text-sm font-semibold tracking-tight">
          <span className="text-muted-foreground">~/</span>zxb
          <span className="text-brand"> $</span> 后台
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1.5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-border/60 flex h-14 items-center justify-between border-b px-6">
          <span className="text-muted-foreground text-sm">后台管理</span>
          <div className="flex items-center gap-3">
            {!admin && (
              <span className="border-border text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-xs">
                演示账号
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              {session.user.name ?? session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="icon-sm">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">
          {!admin && (
            <div className="border-brand/30 bg-brand/5 text-muted-foreground mb-6 rounded-md border px-4 py-2.5 text-sm">
              <span className="text-brand font-mono">{"// "}</span>
              当前为演示账号,可自由操作全部后台界面;但增删改在提交时会被服务端拒绝,仅管理员能真正写入。
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

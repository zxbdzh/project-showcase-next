import type { ReactNode } from "react";
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
  { href: "/admin/settings", label: "站点设置" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="border-border/60 hidden w-60 shrink-0 border-r p-4 md:block">
        <Link href="/" className="mb-6 block px-2 text-sm font-semibold tracking-tight">
          名字<span className="text-brand">.dev</span> 后台
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
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

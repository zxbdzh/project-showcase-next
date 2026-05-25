import { Suspense } from "react";
import { connection } from "next/server";
import { Link } from "next-view-transitions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAdminStats } from "@/features/dashboard/queries";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">概览</h1>
      <p className="text-muted-foreground mt-1 text-sm">内容与流量速览。</p>
      <Suspense
        fallback={
          <div className="border-border/60 text-muted-foreground mt-6 rounded-md border border-dashed p-12 text-center text-sm">
            加载中…
          </div>
        }
      >
        <Stats />
      </Suspense>
    </div>
  );
}

async function Stats() {
  await connection();
  const s = await getAdminStats();

  const cards: { label: string; value: number; href?: string; hint?: string }[] = [
    {
      label: "projects",
      value: s.projects.total,
      href: "/admin/projects",
      hint: `${s.projects.published} 已发布 · ${s.projects.draft} 草稿`,
    },
    { label: "views", value: s.projects.views, hint: "累计浏览量" },
    { label: "categories", value: s.categories, href: "/admin/categories" },
    { label: "tags", value: s.tags, href: "/admin/tags" },
    { label: "skills", value: s.skills, href: "/admin/skills" },
    { label: "social_links", value: s.socialLinks, href: "/admin/social-links" },
  ];

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="text-muted-foreground font-mono text-xs">
                <span className="text-brand">{"// "}</span>
                {c.label}
              </div>
              <div className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums">
                {c.value.toLocaleString()}
              </div>
              {c.hint && <div className="text-muted-foreground mt-1 text-xs">{c.hint}</div>}
            </>
          );
          return c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className="border-border/60 hover:border-brand/40 hover:bg-muted/40 rounded-md border p-4 transition-colors"
            >
              {inner}
            </Link>
          ) : (
            <div key={c.label} className="border-border/60 rounded-md border p-4">
              {inner}
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 font-mono text-sm font-medium">
        <span className="text-brand">{"// "}</span>最近更新
      </h2>
      {s.recent.length === 0 ? (
        <div className="border-border/60 text-muted-foreground mt-3 rounded-md border border-dashed p-12 text-center text-sm">
          还没有项目。
        </div>
      ) : (
        <div className="border-border/60 mt-3 overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-border/60 text-muted-foreground border-b text-left text-xs">
              <tr>
                <th className="px-4 py-2.5 font-medium">项目</th>
                <th className="px-4 py-2.5 font-medium">状态</th>
                <th className="px-4 py-2.5 text-right font-medium">浏览</th>
                <th className="px-4 py-2.5 text-right font-medium">更新于</th>
              </tr>
            </thead>
            <tbody>
              {s.recent.map((p) => (
                <tr key={p.id} className="border-border/40 border-b last:border-0">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/projects/${p.id}`} className="hover:text-brand font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      variant={p.status === "published" ? "secondary" : "outline"}
                      className={cn("rounded-md text-xs", p.status === "published" && "text-brand")}
                    >
                      {p.status === "published" ? "已发布" : "草稿"}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-right font-mono">
                    {p.views}
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-right font-mono text-xs">
                    {p.updatedAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import { Suspense } from "react";
import { Link } from "next-view-transitions";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/is-admin";
import { listAdminProjects } from "@/features/projects/admin-queries";
import { ProjectRowActions } from "@/features/projects/components/project-row-actions";

export default function AdminProjectsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">项目</h1>
        <Suspense fallback={null}>
          <NewProjectButton />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="border-border/60 text-muted-foreground mt-6 rounded-md border border-dashed p-12 text-center text-sm">
            加载中…
          </div>
        }
      >
        <ProjectTable />
      </Suspense>
    </div>
  );
}

async function NewProjectButton() {
  if (!(await isAdmin())) {
    return (
      <span
        className={cn(buttonVariants({ size: "sm" }), "pointer-events-none opacity-50")}
        title="仅管理员可操作"
        aria-disabled
      >
        <Plus /> 新建项目
      </span>
    );
  }
  return (
    <Link href="/admin/projects/new" className={buttonVariants({ size: "sm" })}>
      <Plus /> 新建项目
    </Link>
  );
}

async function ProjectTable() {
  const [projects, admin] = await Promise.all([listAdminProjects(), isAdmin()]);
  const readOnly = !admin;

  if (projects.length === 0) {
    return (
      <div className="border-border/60 text-muted-foreground mt-8 rounded-md border border-dashed p-12 text-center text-sm">
        还没有项目,点击右上角新建。
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mt-1 text-sm">共 {projects.length} 个项目</p>
      <div className="border-border/60 mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-border/60 text-muted-foreground border-b text-left text-xs">
            <tr>
              <th className="px-4 py-2.5 font-medium">项目</th>
              <th className="px-4 py-2.5 font-medium">分类</th>
              <th className="px-4 py-2.5 font-medium">状态</th>
              <th className="px-4 py-2.5 text-right font-medium">浏览</th>
              <th className="px-4 py-2.5 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-border/40 border-b last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-9 w-14 shrink-0 overflow-hidden rounded-sm">
                      {p.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.coverImage} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium">
                        {p.title}
                        {p.featured && <span className="text-brand text-xs">★</span>}
                      </div>
                      <div className="text-muted-foreground truncate font-mono text-xs">
                        /{p.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground px-4 py-2.5">{p.categoryName ?? "—"}</td>
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
                <td className="px-4 py-2.5">
                  <ProjectRowActions
                    id={p.id}
                    title={p.title}
                    status={p.status}
                    featured={p.featured}
                    readOnly={readOnly}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

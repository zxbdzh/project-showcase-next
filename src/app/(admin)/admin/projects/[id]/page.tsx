import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getCategories, getTags } from "@/features/taxonomy/queries";
import { getAdminProjectById } from "@/features/projects/admin-queries";
import { isStorageConfigured } from "@/lib/storage";
import { ProjectForm } from "@/features/projects/components/project-form";
import type { ProjectFormValues } from "@/features/projects/schema";

export async function generateStaticParams() {
  // 后台编辑页按需动态渲染(EditForm 内 await connection()),无需构建期枚举所有项目、
  // 也避免构建期连库。cacheComponents 要求至少返回一项,这里给固定占位,真实数据运行期再取。
  return [{ id: "__none__" }];
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">编辑项目</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">修改后保存即生效。</p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [project, cats, tgs] = await Promise.all([
    getAdminProjectById(id),
    getCategories(),
    getTags(),
  ]);
  if (!project) notFound();

  const uploadEnabled = isStorageConfigured();

  const defaultValues: ProjectFormValues = {
    title: project.title,
    slug: project.slug,
    summary: project.summary ?? "",
    content: project.content ?? "",
    coverImage: project.coverImage ?? "",
    demoUrl: project.demoUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    techStack: project.techStack ?? [],
    featured: project.featured,
    status: project.status,
    sortOrder: project.sortOrder,
    categoryId: project.categoryId ?? "",
    tagIds: project.tagIds,
  };

  return (
    <ProjectForm
      projectId={id}
      defaultValues={defaultValues}
      categories={cats.map((c) => ({ id: c.id, name: c.name }))}
      tags={tgs.map((t) => ({ id: t.id, name: t.name }))}
      uploadEnabled={uploadEnabled}
    />
  );
}

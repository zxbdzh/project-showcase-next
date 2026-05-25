import { Suspense } from "react";
import { getCategories, getTags } from "@/features/taxonomy/queries";
import { isStorageConfigured } from "@/lib/storage";
import { ProjectForm } from "@/features/projects/components/project-form";
import type { ProjectFormValues } from "@/features/projects/schema";

const emptyDefaults: ProjectFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverImage: "",
  demoUrl: "",
  repoUrl: "",
  techStack: [],
  featured: false,
  status: "draft",
  sortOrder: 0,
  categoryId: "",
  tagIds: [],
};

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">新建项目</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">填写项目信息后保存。</p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <NewProjectForm />
      </Suspense>
    </div>
  );
}

async function NewProjectForm() {
  const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
  const uploadEnabled = isStorageConfigured();

  return (
    <ProjectForm
      defaultValues={emptyDefaults}
      categories={cats.map((c) => ({ id: c.id, name: c.name }))}
      tags={tgs.map((t) => ({ id: t.id, name: t.name }))}
      uploadEnabled={uploadEnabled}
    />
  );
}

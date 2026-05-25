"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Field } from "@/components/admin/field";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectFormSchema, type ProjectFormValues } from "../schema";
import { createProject, updateProject } from "../actions";
import { generateSlug, generateTaxonomy } from "../ai-actions";

type Option = { id: string; name: string };

const selectClass =
  "border-input dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProjectForm({
  projectId,
  defaultValues,
  categories,
  tags,
  uploadEnabled,
}: {
  projectId?: string;
  defaultValues: ProjectFormValues;
  categories: Option[];
  tags: Option[];
  uploadEnabled: boolean;
}) {
  const router = useRouter();
  const [techInput, setTechInput] = useState("");
  const [tagOptions, setTagOptions] = useState<Option[]>(tags);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>(categories);
  const [slugAiLoading, setSlugAiLoading] = useState(false);
  const [taxLoading, setTaxLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const techStack = watch("techStack");
  const tagIds = watch("tagIds");

  function addTech() {
    const v = techInput.trim();
    if (!v) return;
    if (!techStack.includes(v)) setValue("techStack", [...techStack, v], { shouldDirty: true });
    setTechInput("");
  }

  function removeTech(t: string) {
    setValue(
      "techStack",
      techStack.filter((x) => x !== t),
      { shouldDirty: true }
    );
  }

  function toggleTag(id: string) {
    const next = tagIds.includes(id) ? tagIds.filter((x) => x !== id) : [...tagIds, id];
    setValue("tagIds", next, { shouldDirty: true });
  }

  async function handleAiSlug() {
    const title = getValues("title").trim();
    if (!title) {
      toast.warning("请先填写标题");
      return;
    }
    setSlugAiLoading(true);
    const res = await generateSlug(title);
    setSlugAiLoading(false);
    if (res.ok) {
      setValue("slug", res.data.slug, { shouldValidate: true, shouldDirty: true });
      toast.success("已生成 slug");
    } else {
      toast.error(res.error);
    }
  }

  async function handleAiTaxonomy() {
    const content = getValues("content").trim();
    if (content.length < 20) {
      toast.warning("请先填写正文内容再分析");
      return;
    }
    setTaxLoading(true);
    const res = await generateTaxonomy(content);
    setTaxLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const newTags = res.data.tags;
    setTagOptions((prev) => {
      const map = new Map(prev.map((o) => [o.id, o]));
      for (const t of newTags) map.set(t.id, t);
      return [...map.values()];
    });
    const merged = Array.from(new Set([...getValues("tagIds"), ...newTags.map((t) => t.id)]));
    setValue("tagIds", merged, { shouldDirty: true });

    const cat = res.data.category;
    if (cat) {
      setCategoryOptions((prev) => (prev.some((o) => o.id === cat.id) ? prev : [...prev, cat]));
      setValue("categoryId", cat.id, { shouldDirty: true });
    }

    const parts: string[] = [];
    if (newTags.length) parts.push(`${newTags.length} 个标签`);
    if (cat) parts.push(`分类「${cat.name}」`);
    toast.success(parts.length ? `已生成 ${parts.join("、")}` : "未识别到标签或分类");
  }

  const onSubmit = handleSubmit(async (values) => {
    const res = projectId ? await updateProject(projectId, values) : await createProject(values);
    if (res.ok) {
      toast.success(projectId ? "已保存" : "已创建");
      router.push("/admin/projects");
      router.refresh();
      return;
    }
    if (res.fieldErrors) {
      for (const [key, msgs] of Object.entries(res.fieldErrors)) {
        if (msgs?.[0]) setError(key as keyof ProjectFormValues, { message: msgs[0] });
      }
    }
    toast.error(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <fieldset className="contents">
        <Field label="标题" htmlFor="title" required error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          required
          error={errors.slug?.message}
          hint="URL 路径,仅小写字母、数字与连字符"
        >
          <div className="flex gap-2">
            <Input id="slug" {...register("slug")} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValue("slug", slugify(getValues("title")), { shouldValidate: true })
              }
            >
              从标题生成
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiSlug}
              disabled={slugAiLoading}
            >
              {slugAiLoading ? "生成中…" : "AI 生成"}
            </Button>
          </div>
        </Field>

        <Field label="摘要" htmlFor="summary" error={errors.summary?.message}>
          <Textarea id="summary" rows={2} {...register("summary")} />
        </Field>

        <Field label="封面" error={errors.coverImage?.message}>
          <Controller
            control={control}
            name="coverImage"
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                uploadEnabled={uploadEnabled}
              />
            )}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="演示地址" htmlFor="demoUrl" error={errors.demoUrl?.message}>
            <Input id="demoUrl" placeholder="https://" {...register("demoUrl")} />
          </Field>
          <Field label="仓库地址" htmlFor="repoUrl" error={errors.repoUrl?.message}>
            <Input id="repoUrl" placeholder="https://" {...register("repoUrl")} />
          </Field>
        </div>

        <Field label="技术栈" error={errors.techStack?.message} hint="输入后回车添加">
          <div className="space-y-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTech();
                }
              }}
              placeholder="如 Next.js"
            />
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((t) => (
                  <span
                    key={t}
                    className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTech(t)}
                      className="hover:text-foreground"
                      aria-label={`移除 ${t}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="标签" hint="AI 会分析正文,生成标签与分类并自动选中(新标签 / 分类会即时入库)">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {tagOptions.map((tag) => {
                const active = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {tagOptions.length === 0 && (
                <span className="text-muted-foreground text-xs">
                  暂无标签,可用下方 AI 分析正文生成
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiTaxonomy}
              disabled={taxLoading}
            >
              {taxLoading ? "分析中…" : "AI 分析正文 → 标签 / 分类"}
            </Button>
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="分类" htmlFor="categoryId">
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <select
                  id="categoryId"
                  className={selectClass}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                >
                  <option value="">无分类</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </Field>
          <Field label="状态" htmlFor="status">
            <select id="status" className={selectClass} {...register("status")}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </Field>
          <Field label="排序" htmlFor="sortOrder" hint="数字越小越靠前">
            <Input
              id="sortOrder"
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-brand size-4" {...register("featured")} />
          设为精选(首页展示)
        </label>

        <Field label="正文(Markdown)" htmlFor="content" error={errors.content?.message}>
          <Textarea id="content" rows={10} className="font-mono text-xs" {...register("content")} />
        </Field>
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中…" : projectId ? "保存修改" : "创建项目"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/projects")}>
          取消
        </Button>
      </div>
    </form>
  );
}

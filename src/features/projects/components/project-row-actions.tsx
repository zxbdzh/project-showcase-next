"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import { toast } from "sonner";
import { Eye, EyeOff, Star, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { cn } from "@/lib/utils";
import { deleteProject, toggleProjectFeatured, toggleProjectPublished } from "../actions";

export function ProjectRowActions({
  id,
  title,
  status,
  featured,
  readOnly = false,
}: {
  id: string;
  title: string;
  status: "draft" | "published";
  featured: boolean;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(okMsg);
        router.refresh();
      } else {
        toast.error(res.error ?? "操作失败");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={pending || readOnly}
        aria-label={featured ? "取消精选" : "设为精选"}
        title={readOnly ? "仅管理员可操作" : featured ? "取消精选" : "设为精选"}
        onClick={() => run(() => toggleProjectFeatured(id), featured ? "已取消精选" : "已设为精选")}
      >
        <Star className={cn("size-4", featured && "fill-brand text-brand")} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={pending || readOnly}
        aria-label={status === "published" ? "转为草稿" : "发布"}
        title={readOnly ? "仅管理员可操作" : status === "published" ? "转为草稿" : "发布"}
        onClick={() =>
          run(() => toggleProjectPublished(id), status === "published" ? "已转为草稿" : "已发布")
        }
      >
        {status === "published" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </Button>
      {readOnly ? (
        <Button variant="ghost" size="icon-sm" disabled aria-label="编辑" title="仅管理员可操作">
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href={`/admin/projects/${id}`} />}
          aria-label="编辑"
        >
          <Pencil className="size-4" />
        </Button>
      )}
      {readOnly ? (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label={`删除 ${title}`}
          title="仅管理员可操作"
        >
          <Trash2 className="text-destructive size-4" />
        </Button>
      ) : (
        <DeleteButton itemName={title} action={() => deleteProject(id)} />
      )}
    </div>
  );
}

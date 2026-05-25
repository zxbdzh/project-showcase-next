"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestUploadUrl } from "@/features/media/actions";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * 图片字段:R2 已配置时支持选文件直传(预签名 PUT),否则仅手填 URL。
 * 受控:value 为已落库的公开 URL,变更经 onChange 回传。
 */
export function ImageUpload({
  value,
  onChange,
  uploadEnabled,
  alt = "预览",
}: {
  value: string;
  onChange: (url: string) => void;
  uploadEnabled: boolean;
  alt?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!ALLOWED.includes(file.type)) {
      toast.error("仅支持图片(jpg/png/webp/gif/svg)");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("图片不能超过 5MB");
      return;
    }
    setUploading(true);
    try {
      const res = await requestUploadUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const put = await fetch(res.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) {
        toast.error("上传失败,请重试");
        return;
      }
      onChange(res.data.publicUrl);
      toast.success("上传成功");
    } catch {
      toast.error("上传出错");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="border-border bg-muted/40 relative flex aspect-video w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={alt} className="size-full object-cover" />
          ) : (
            <ImageIcon className="text-muted-foreground size-6" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          {uploadEnabled && (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                {uploading ? "上传中…" : "上传图片"}
              </Button>
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange("")}
                  disabled={uploading}
                >
                  <X /> 清除
                </Button>
              )}
            </div>
          )}
          <Input
            type="url"
            placeholder="或粘贴图片 URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

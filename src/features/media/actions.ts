"use server";

import { z } from "zod";
import { actionFail, actionOk, requireAdmin, type ActionResult } from "@/lib/action-result";
import { createPresignedUpload, isStorageConfigured } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z
    .string()
    .refine((t) => ALLOWED_TYPES.includes(t), "仅支持图片(jpg/png/webp/gif/svg)"),
  size: z.number().int().positive().max(MAX_SIZE, "图片不能超过 5MB"),
});

/** 为后台图片上传生成 R2 预签名直传地址。仅管理员可用,密钥不下发客户端。 */
export async function requestUploadUrl(
  input: unknown
): Promise<ActionResult<{ uploadUrl: string; publicUrl: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  if (!isStorageConfigured()) return actionFail("存储未配置,请改用图片 URL");

  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) {
    return actionFail("文件校验未通过", z.flattenError(parsed.error).fieldErrors);
  }

  try {
    const { uploadUrl, publicUrl } = await createPresignedUpload({
      filename: parsed.data.filename,
      contentType: parsed.data.contentType,
    });
    return actionOk({ uploadUrl, publicUrl });
  } catch {
    return actionFail("生成上传地址失败");
  }
}

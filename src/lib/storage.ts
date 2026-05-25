import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

/**
 * 对象存储是否已完整配置(S3 兼容:AWS S3 / Cloudflare R2 / MinIO 等)。
 * 缺任一必需项则上传整体禁用,降级为手填 URL。endpoint 可选(AWS 按 region 推导)。
 */
export function isStorageConfigured(): boolean {
  return Boolean(
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY &&
    env.S3_BUCKET &&
    env.NEXT_PUBLIC_S3_PUBLIC_URL
  );
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new Error("对象存储未配置");
  }
  client ??= new S3Client({
    region: env.S3_REGION ?? "auto",
    // 留空则走 AWS 默认(按 region 推导);R2 / MinIO 等填各自 endpoint
    endpoint: env.S3_ENDPOINT,
    // MinIO 等需路径风格(endpoint/bucket/key);R2 / AWS 用虚拟主机风格
    forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

/** 把原始文件名收敛为安全 key 片段(保留扩展名,其余非字母数字转 -)。 */
function safeKeyPart(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext =
    dot >= 0
      ? filename
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "";
  return ext ? `.${ext}` : "";
}

/**
 * 生成对象存储直传预签名 PUT URL。密钥仅留在服务端,客户端拿 uploadUrl 直传,
 * 成功后用 publicUrl 落库。expiresIn 短(60s),仅够单次上传。
 */
export async function createPresignedUpload(input: {
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!isStorageConfigured() || !env.S3_BUCKET || !env.NEXT_PUBLIC_S3_PUBLIC_URL) {
    throw new Error("对象存储未配置,无法生成上传地址");
  }
  const key = `uploads/${crypto.randomUUID()}${safeKeyPart(input.filename)}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: input.contentType,
  });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 60 });
  const publicUrl = `${env.NEXT_PUBLIC_S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return { uploadUrl, publicUrl, key };
}

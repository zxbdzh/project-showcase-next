import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";

/** R2 是否已完整配置(缺任一变量则上传功能整体禁用,降级为手填 URL)。 */
export function isStorageConfigured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME &&
    env.NEXT_PUBLIC_R2_PUBLIC_URL
  );
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 未配置");
  }
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
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
 * 生成 R2 直传预签名 PUT URL。密钥仅留在服务端,客户端拿 uploadUrl 直传,
 * 成功后用 publicUrl 落库。expiresIn 短(60s),仅够单次上传。
 */
export async function createPresignedUpload(input: {
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!isStorageConfigured() || !env.R2_BUCKET_NAME || !env.NEXT_PUBLIC_R2_PUBLIC_URL) {
    throw new Error("R2 未配置,无法生成上传地址");
  }
  const key = `uploads/${crypto.randomUUID()}${safeKeyPart(input.filename)}`;
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: input.contentType,
  });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 60 });
  const publicUrl = `${env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return { uploadUrl, publicUrl, key };
}

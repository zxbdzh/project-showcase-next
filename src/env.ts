import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // 空字符串视为未设置:.env 里留空("")的可选变量(SMTP/S3/邮箱等)按 undefined 处理,
  // 避免 ""(非 undefined)触发 .url()/.email() 等校验而启动失败。
  emptyStringAsUndefined: true,
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    GITHUB_ID: z.string().min(1),
    GITHUB_SECRET: z.string().min(1),

    // 对象存储(S3 兼容:AWS S3 / Cloudflare R2 / MinIO 等)。可选,缺失时上传降级为手填 URL。
    S3_ENDPOINT: z.string().url().optional(), // 兼容服务(R2/MinIO)必填;AWS 可留空,按 region 推导
    S3_REGION: z.string().optional(), // 默认 "auto"(R2/MinIO);AWS 填真实 region
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_FORCE_PATH_STYLE: z.string().optional(), // MinIO 等需 "true";虚拟主机风格(R2/AWS)留空

    // AI:provider 可选 openai(含 OpenAI 兼容端点如 GLM)/ anthropic
    AI_PROVIDER: z.enum(["openai", "anthropic"]).default("openai"),
    AI_MODEL: z.string().optional(),
    // AI 分身对话(/api/ai/chat)需多步工具调用,必须用「支持 function calling 的非思考模型」。
    // 思考/reasoner 模型(如 deepseek 的 thinking 系列)要求回传 reasoning_content,
    // 在多步工具调用下会 400。留空则回退 AI_MODEL。推荐设为 deepseek-chat。
    AI_MODEL_TOOLS: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.string().url().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_BASE_URL: z.string().url().optional(),

    // 联系表单邮件(SMTP)。全部可选:任一缺失则留言不发邮件、降级为仅记录日志。
    SMTP_HOST: z.string().optional(), // 如 smtp.qq.com
    SMTP_PORT: z.string().optional(), // 465(SSL)/ 587(STARTTLS),默认 465
    SMTP_USER: z.string().optional(), // 发件邮箱账号
    SMTP_PASS: z.string().optional(), // 邮箱授权码(非登录密码)
    SMTP_FROM: z.string().optional(), // 发件人地址,留空用 SMTP_USER
    CONTACT_TO_EMAIL: z.string().email().optional(), // 留言收件邮箱
  },
  client: {
    NEXT_PUBLIC_S3_PUBLIC_URL: z.string().url().optional(), // 对象公开访问基址(CDN / 公开桶)
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_MODEL: process.env.AI_MODEL,
    AI_MODEL_TOOLS: process.env.AI_MODEL_TOOLS,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    NEXT_PUBLIC_S3_PUBLIC_URL: process.env.NEXT_PUBLIC_S3_PUBLIC_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});

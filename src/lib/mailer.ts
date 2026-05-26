import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/env";

/**
 * 按 env 创建 SMTP transporter。SMTP_HOST/USER/PASS 任一缺失即视为未配置,返回 null,
 * 让调用方降级处理(如联系表单仅记录日志,不报错)。
 * 端口 465 走隐式 SSL(secure:true),其余(如 587)用 STARTTLS。
 */
function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  const port = Number(env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

/** SMTP 与收件地址是否齐全;不齐全时联系表单走「仅记录」降级。 */
export function isMailerConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.CONTACT_TO_EMAIL);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 把访客留言发到 CONTACT_TO_EMAIL。replyTo 设为访客邮箱,便于直接回复。
 * 发件人多数 SMTP(QQ/163)要求与认证账号一致,故 from 默认用 SMTP_USER。
 */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter || !env.CONTACT_TO_EMAIL) {
    throw new Error("SMTP not configured");
  }
  const { name, email, message } = data;
  await transporter.sendMail({
    from: env.SMTP_FROM ?? env.SMTP_USER,
    to: env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `作品集新留言 — ${name}`,
    text: `姓名: ${name}\n邮箱: ${email}\n\n${message}`,
    html: `<p><strong>姓名:</strong> ${escapeHtml(name)}</p>
<p><strong>邮箱:</strong> ${escapeHtml(email)}</p>
<p><strong>留言:</strong></p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
  });
}

"use server";

import { z } from "zod";
import { sendContactEmail, isMailerConfigured } from "@/lib/mailer";

const contactSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(100),
  email: z.string().email("请输入有效的邮箱"),
  message: z.string().min(10, "留言至少 10 个字").max(5000),
});

export interface ContactFormState {
  success: boolean;
  message: string;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "请检查输入" };
  }

  // 未配置 SMTP(见 .env 的 SMTP_*/CONTACT_TO_EMAIL):降级为仅记录日志,
  // 不向访客报错,保证演示环境可用。
  if (!isMailerConfigured()) {
    console.warn("[contact] SMTP 未配置,留言未发送(已记录):", parsed.data);
    return { success: true, message: "已收到,我会尽快回复你!" };
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (error) {
    console.error("[contact] 邮件发送失败:", error);
    return { success: false, message: "发送失败,请稍后再试或直接邮件联系我。" };
  }

  return { success: true, message: "已收到,我会尽快回复你!" };
}

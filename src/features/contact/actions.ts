"use server";

import { z } from "zod";

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

  // TODO: 发送邮件或存储到数据库
  console.log("Contact form submission:", parsed.data);

  return { success: true, message: "已收到,我会尽快回复你!" };
}

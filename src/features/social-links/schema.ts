import { z } from "zod";

/** 社交链接表单校验。 */
export const socialLinkFormSchema = z.object({
  platform: z.string().min(1, "请输入平台名").max(60),
  url: z.string().url("需为有效 URL").max(500),
  icon: z.string().max(200),
  sortOrder: z.number().int(),
});
export type SocialLinkFormValues = z.infer<typeof socialLinkFormSchema>;

import { z } from "zod";

const slug = z
  .string()
  .min(1, "请输入 slug")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "只能含小写字母、数字与连字符");

/** 分类表单校验。 */
export const categoryFormSchema = z.object({
  name: z.string().min(1, "请输入名称").max(100),
  slug,
  description: z.string().max(300, "最多 300 字"),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/** 标签表单校验。 */
export const tagFormSchema = z.object({
  name: z.string().min(1, "请输入名称").max(100),
  slug,
});
export type TagFormValues = z.infer<typeof tagFormSchema>;

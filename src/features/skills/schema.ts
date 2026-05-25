import { z } from "zod";

/** 技能表单校验。 */
export const skillFormSchema = z.object({
  name: z.string().min(1, "请输入名称").max(100),
  category: z.string().max(60),
  level: z.number().int().min(0, "0–100").max(100, "0–100"),
  icon: z.string().max(200),
  sortOrder: z.number().int(),
});
export type SkillFormValues = z.infer<typeof skillFormSchema>;

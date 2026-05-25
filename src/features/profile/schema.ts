import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url("需为有效 URL")]);

/** 管理员资料表单校验。 */
export const profileFormSchema = z.object({
  headline: z.string().max(120),
  bio: z.string().max(2000),
  location: z.string().max(120),
  website: optionalUrl,
  avatar: optionalUrl,
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

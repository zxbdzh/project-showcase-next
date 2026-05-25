import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url("需为有效 URL")]);

/** 后台项目表单校验。输入即输出(无默认值),默认值由表单 defaultValues 提供。 */
export const projectFormSchema = z.object({
  title: z.string().min(1, "请输入标题").max(200),
  slug: z
    .string()
    .min(1, "请输入 slug")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "只能含小写字母、数字与连字符"),
  summary: z.string().max(500, "摘要最多 500 字"),
  content: z.string(),
  coverImage: optionalUrl,
  demoUrl: optionalUrl,
  repoUrl: optionalUrl,
  techStack: z.array(z.string().min(1)),
  featured: z.boolean(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int(),
  categoryId: z.string(),
  tagIds: z.array(z.string()),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

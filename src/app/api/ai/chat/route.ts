import { streamText } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { getAdminProfile } from "@/features/profile/queries";
import { getSkills } from "@/features/skills/queries";
import { getFeaturedProjects } from "@/features/projects/queries";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Bad Request", { status: 400 });
  }
  const { messages } = parsed.data;

  const [profile, skills, featured] = await Promise.all([
    getAdminProfile(),
    getSkills(),
    getFeaturedProjects(6),
  ]);

  const system = [
    "你是 zxb 的 AI 分身,代表他回答访客提问。",
    "要求:用中文、以第一人称、简洁真诚;只回答与 zxb 的技术背景 / 项目 / 技能 / 合作相关的问题;",
    "资料未涵盖或不确定的就坦诚说明,绝不编造;默认回答控制在 3 句话内,除非访客要求展开。",
    "",
    `【我是谁】${profile?.headline ?? "Java 全栈开发者"}。${profile?.bio ?? ""}`,
    `【技术栈】${skills.map((s) => s.name).join("、")}`,
    `【精选项目】${featured.map((p) => `${p.title}(${p.summary ?? ""})`).join(";")}`,
  ].join("\n");

  const result = streamText({
    model: getModel(),
    system,
    messages,
    temperature: 0.6,
    onError: ({ error }) => {
      console.error("[ai/chat] stream error:", error);
    },
  });

  return result.toTextStreamResponse({
    headers: {
      // 关闭转换与缓冲,确保流式逐块直达浏览器(穿透 nginx/反代的默认响应缓冲)。
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

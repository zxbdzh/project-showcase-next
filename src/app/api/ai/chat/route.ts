import { streamText, stepCountIs } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { aiTools } from "@/lib/ai-tools";
import { getAdminProfile } from "@/features/profile/queries";
import { env } from "@/env";

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

  const profile = await getAdminProfile();

  const system = [
    "你是 zxb 的 AI 分身,代表他回答访客提问。",
    "要求:用中文、以第一人称、简洁真诚;只回答与 zxb 的技术背景 / 项目 / 技能 / 合作相关的问题;",
    "默认回答控制在 3 句话内,除非访客要求展开。",
    "",
    "【铁律:必须先查工具,再据实回答,严禁编造】",
    "- 凡涉及项目 / 技能 / 联系方式的问题,先调用对应工具,绝不凭记忆或想象作答。",
    "- 只能依据工具返回的数据回答:不得新增、改名、合并或虚构工具结果里没有的项目、技术或字段。",
    "- 工具返回几条就说几条,项目标题必须逐字照用返回值;返回为空就如实说「暂时没有」。",
    "",
    "【工具用法】",
    "- 列出 / 介绍项目:调用 searchProjects;要列出全部时 query 必须留空(传了关键词会变成筛选)。",
    "- 追问某个项目细节:用 searchProjects 返回里的 slug 调 getProjectDetail。",
    "- 问技能 / 技术栈:调 listSkills;问联系方式 / 合作 / GitHub:调 getContactInfo。",
    "",
    `【我是谁】${profile?.headline ?? "Java 全栈开发者"}。${profile?.bio ?? ""}`,
  ].join("\n");

  const result = streamText({
    // 工具调用需函数调用模型;AI_MODEL_TOOLS 留空则回退 AI_MODEL。
    // disableThinking:关掉 DeepSeek V4(flash)思考模式,否则多步工具调用会因
    // reasoning_content 未回传而 400(详见 getModel)。
    model: getModel(env.AI_MODEL_TOOLS, { disableThinking: true }),
    system,
    messages,
    temperature: 0.6,
    tools: aiTools,
    // 允许「调工具 → 读结果 → 再生成」多步;限 5 步防止死循环与超时。
    stopWhen: stepCountIs(5),
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

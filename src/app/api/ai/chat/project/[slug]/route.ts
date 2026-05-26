import { streamText, stepCountIs } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";
import { aiTools, excerpt } from "@/lib/ai-tools";
import { getProjectBySlug } from "@/features/projects/queries";
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

// 项目专属 AI 分身:slug 由 URL 段取,服务端自查,客户端无法越权切换上下文。
// 工具集裁掉 searchProjects(已锁定当前项目),保留 getProjectDetail / getContactInfo,
// 新增 getProjectReadme:模型按需翻页取更长正文片段。
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const project = await getProjectBySlug(slug);
  if (!project) {
    return new Response("Not Found", { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Bad Request", { status: 400 });
  }
  const { messages } = parsed.data;

  const profile = await getAdminProfile();

  const system = [
    `你是 zxb 的 AI 分身,正在回答关于「${project.title}」这个项目的问题。`,
    "要求:用中文、以第一人称、简洁真诚;默认 3 句话内,除非访客明确要求展开。",
    "",
    "【铁律:据实回答,严禁编造】",
    "- 只能依据 system 给的项目元信息 + 工具返回值回答;不得新增、改名、虚构技术或字段。",
    "- 正文摘录不够时,先调 getProjectReadme(传 slug 与 offset)翻页,而不是脑补。",
    "- 问到联系方式/合作时,调 getContactInfo。",
    "",
    "【离题策略】",
    "- 若问题与本项目无关(如「你还做过什么」「会什么技术」),不要在本面板展开,",
    "  礼貌引导访客打开右上角 ⌘K 命令面板或访问首页的 AI 分身全局对话。",
    "",
    `【本项目元信息】slug=${project.slug}`,
    `- 标题:${project.title}`,
    `- 分类:${project.category?.name ?? "未分类"}`,
    `- 技术栈:${(project.techStack ?? []).join(", ") || "未填写"}`,
    `- 标签:${project.tags.map((t) => t.name).join(", ") || "未填写"}`,
    `- 简介:${project.summary ?? "(无)"}`,
    `- 演示:${project.demoUrl ?? "(无)"} / 仓库:${project.repoUrl ?? "(无)"}`,
    `- 是否精选:${project.featured ? "是" : "否"}`,
    "",
    `【README 摘录(已去 Markdown 标记,~1200 字)】`,
    excerpt(project.content, 1200) || "(暂无正文,可据元信息回答)",
    "",
    `【我是谁】${profile?.headline ?? "Java 全栈开发者"}。${profile?.bio ?? ""}`,
  ].join("\n");

  const result = streamText({
    model: getModel(env.AI_MODEL_TOOLS, { disableThinking: true }),
    system,
    messages,
    temperature: 0.6,
    // 裁掉 searchProjects:当前面板已锁定 slug,不允许跳项目检索。
    tools: {
      getProjectDetail: aiTools.getProjectDetail,
      getProjectReadme: aiTools.getProjectReadme,
      getContactInfo: aiTools.getContactInfo,
    },
    stopWhen: stepCountIs(3),
    onError: ({ error }) => {
      console.error("[ai/chat/project] stream error:", error);
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

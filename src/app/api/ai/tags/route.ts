import { streamObject } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai";

const bodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response("Bad Request", { status: 400 });
  }
  const { title, description } = parsed.data;

  // 用 no-schema(json_object)而非带 schema 的 json_schema —— 后者多数 OpenAI 兼容端点
  // (GLM、DeepSeek)不支持。JSON 形状写进 prompt 约束,前端按约定解析。
  const result = streamObject({
    model: getModel(),
    output: "no-schema",
    prompt: `根据以下项目信息,生成 5-8 个技术标签。只返回 JSON,不要任何额外文字。
JSON 格式:{"tags":[{"name":"标签名称","confidence":0到1之间的小数,表示与项目的相关程度}]}

项目标题:${title}
项目描述:${description}`,
  });

  return result.toTextStreamResponse();
}

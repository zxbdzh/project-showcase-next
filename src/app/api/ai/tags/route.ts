import { streamObject } from "ai";
import { z } from "zod";
import { glm, GLM_MODEL } from "@/lib/ai";

const tagSchema = z.object({
  tags: z.array(
    z.object({
      name: z.string().describe("标签名称"),
      confidence: z.number().min(0).max(1).describe("置信度"),
    })
  ),
});

export async function POST(req: Request) {
  const { title, description } = await req.json();

  const result = streamObject({
    model: glm(GLM_MODEL),
    schema: tagSchema,
    prompt: `根据以下项目信息,生成 5-8 个技术标签。\n\n项目标题: ${title}\n项目描述: ${description}\n\n返回技术相关的标签,置信度表示该标签与项目的相关程度。`,
  });

  return result.toTextStreamResponse();
}

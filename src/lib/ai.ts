import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";
import { env } from "@/env";
import { DEFAULT_MODEL } from "@/lib/ai-config";

/**
 * 关闭 DeepSeek V4 思考模式的 fetch 包装:在发往 /chat/completions 的请求体里
 * 注入 `thinking:{type:"disabled"}`。
 * 起因:deepseek-v4-flash 默认开启思考、会返回 `reasoning_content`,而 AI SDK 多步
 * 工具调用在续写步不会把它回传,DeepSeek 遂以「reasoning_content must be passed back」
 * 报 400。关掉思考即可让 flash 正常完成「调工具 → 读结果 → 再生成」。
 */
const thinkingDisabledFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (typeof init?.body === "string") {
    try {
      const body = JSON.parse(init.body);
      body.thinking = { type: "disabled" };
      init = { ...init, body: JSON.stringify(body) };
    } catch {
      // 非 JSON body(理论上不会发生)原样放行
    }
  }
  return fetch(input, init);
};

/**
 * 根据 env 选择 AI provider,返回统一的 LanguageModel。
 * - `AI_PROVIDER=openai`:OpenAI 或任意 OpenAI 兼容端点(如 GLM,经 OPENAI_BASE_URL)
 * - `AI_PROVIDER=anthropic`:Anthropic(可经 ANTHROPIC_BASE_URL 指向兼容端点)
 * 模型默认由 AI_MODEL 指定(留空用各 provider 默认);可经 `modelId` 覆盖,
 * 用于按场景选模型(如对话路由需函数调用模型,见 AI_MODEL_TOOLS)。
 * `opts.disableThinking`:对 DeepSeek V4 思考模型关闭思考(多步工具调用必需,见上)。
 */
export function getModel(modelId?: string, opts?: { disableThinking?: boolean }): LanguageModel {
  if (env.AI_PROVIDER === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}),
    });
    return anthropic(modelId ?? env.AI_MODEL ?? DEFAULT_MODEL.anthropic);
  }

  const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {}),
    ...(opts?.disableThinking ? { fetch: thinkingDisabledFetch } : {}),
  });
  // 用 chat completions(/chat/completions),而非 AI SDK v6 默认的 Responses API(/responses)。
  // 多数 OpenAI 兼容端点(GLM、DeepSeek 等)只实现前者,用默认会 404。
  return openai.chat(modelId ?? env.AI_MODEL ?? DEFAULT_MODEL.openai);
}

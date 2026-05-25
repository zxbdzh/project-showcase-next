import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";
import { env } from "@/env";

const DEFAULT_MODEL: Record<"openai" | "anthropic", string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
};

/**
 * 根据 env 选择 AI provider,返回统一的 LanguageModel。
 * - `AI_PROVIDER=openai`:OpenAI 或任意 OpenAI 兼容端点(如 GLM,经 OPENAI_BASE_URL)
 * - `AI_PROVIDER=anthropic`:Anthropic(可经 ANTHROPIC_BASE_URL 指向兼容端点)
 * 模型由 AI_MODEL 指定,留空则用各 provider 默认。
 */
export function getModel(): LanguageModel {
  if (env.AI_PROVIDER === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}),
    });
    return anthropic(env.AI_MODEL ?? DEFAULT_MODEL.anthropic);
  }

  const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {}),
  });
  // 用 chat completions(/chat/completions),而非 AI SDK v6 默认的 Responses API(/responses)。
  // 多数 OpenAI 兼容端点(GLM、DeepSeek 等)只实现前者,用默认会 404。
  return openai.chat(env.AI_MODEL ?? DEFAULT_MODEL.openai);
}

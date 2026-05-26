import { env } from "@/env";

/** 各 provider 的默认模型(未配置 AI_MODEL 时回退)。 */
export const DEFAULT_MODEL: Record<"openai" | "anthropic", string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
};

/**
 * 当前驱动 AI 分身对话的模型 ID(前台展示用),与 chat 路由一致。
 * 故意只依赖 env、不引入任何 AI SDK——这样 server 组件(如首页)引用它时
 * 不会把 @ai-sdk/* 整套依赖图拽进路由,避免 Turbopack dev 冷编译变慢/卡死。
 */
export function getModelId(): string {
  return env.AI_MODEL_TOOLS ?? env.AI_MODEL ?? DEFAULT_MODEL[env.AI_PROVIDER];
}

import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/env";

export const glm = createOpenAI({
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
});

export const GLM_MODEL = "glm-4-flash";

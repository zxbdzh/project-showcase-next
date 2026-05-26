"use client";

import { useCallback } from "react";
import { useLenis } from "lenis/react";
import { PROJECT_AI_ANCHOR_ID, PROJECT_AI_INNER_ID } from "./ai-chat-anchor";

/**
 * 详情页跳转到项目 AI 分身 + 聚焦输入框。
 * 复用点:ProjectManifest 的 `$ ask --ai` 按钮、⌘K 命令面板的「问 AI 这个项目」。
 *
 * Lenis 接管根滚动,原生 hash/scrollIntoView 会被它拉回,故首选 lenis.scrollTo;
 * reduced-motion 用户回到原生平滑。聚焦延后 ~400ms 等惯性滚动完成。
 */
export function useScrollToProjectAi() {
  const lenis = useLenis();

  return useCallback(() => {
    const target = document.getElementById(PROJECT_AI_ANCHOR_ID);
    if (!target) return;
    if (lenis) {
      // 跨页导航后 Lenis 缓存的 limit 仍是旧页面的值,先 resize() 重新测量。
      lenis.resize();
      lenis.scrollTo(target, { offset: -72 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.setTimeout(() => {
      const wrapper = document.getElementById(PROJECT_AI_INNER_ID);
      const input = wrapper?.querySelector<HTMLInputElement>("input[aria-label='向 AI 分身提问']");
      input?.focus();
    }, 400);
  }, [lenis]);
}

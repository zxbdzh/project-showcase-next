"use client";

import { useCallback } from "react";
import { useLenis } from "lenis/react";
import { PROJECT_AI_ANCHOR_ID, PROJECT_AI_INNER_ID } from "./ai-chat-anchor";

/**
 * 详情页跳转到项目 AI 分身 + 聚焦输入框。
 * 复用点:ProjectManifest 的 `$ ask --ai` 按钮、⌘K 命令面板的「问 AI 这个项目」。
 *
 * Lenis 接管根滚动,原生 hash/scrollIntoView 会被它拉回,故首选 lenis.scrollTo;
 * reduced-motion 用户回到原生平滑。
 *
 * 二次校正:README MDX 内的图片是 loading="lazy",用户点按钮时下方图片还没加载,
 * layout 总高度比真实值小,Lenis 用当前 limit 夹目标 y 会把位置卡在 README 中段。
 * 滚动启动后图片随之进入视口被加载、limit 增长 — 我们在 ~520ms 后再 resize+scrollTo
 * 一次,把目标精准纠正到 AI 段。这个区间小到不会出现明显跳跃感。
 */
export function useScrollToProjectAi() {
  const lenis = useLenis();

  return useCallback(() => {
    const scroll = () => {
      const target = document.getElementById(PROJECT_AI_ANCHOR_ID);
      if (!target) return false;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(target, { offset: -72 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return true;
    };

    if (!scroll()) return;
    const correction = window.setTimeout(scroll, 520);
    const focusTimer = window.setTimeout(() => {
      const wrapper = document.getElementById(PROJECT_AI_INNER_ID);
      const input = wrapper?.querySelector<HTMLInputElement>("input[aria-label='向 AI 分身提问']");
      input?.focus({ preventScroll: true });
    }, 760);
    // 这里不返回 cleanup —— hook 调用方是事件回调,不挂载/卸载生命周期。
    // 但留个安全网:把 timer 暴露在 closure 上不影响 GC,函数返回后引用即可释放。
    void correction;
    void focusTimer;
  }, [lenis]);
}

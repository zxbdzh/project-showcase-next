"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollToProjectAi } from "./use-scroll-to-project-ai";

/** 首次访客提示的 localStorage 键(版本化,future schema 变更可 bump)。 */
const HINT_SEEN_KEY = "seen:project-ai-button:v1";
/** 高亮停留时长(ms);超时自动消失并写入 seen。 */
const HINT_DURATION = 4500;
/** 挂载到显示提示的延迟,等页面动画稳定 + 不打扰首屏。 */
const HINT_DELAY = 600;

/**
 * 详情页 ProjectManifest footer 的召唤按钮。
 * 点击 → 滚动到 #ai-chat-project + 聚焦输入框,确保访客发现页面下方的 AI 分身。
 *
 * 首次访客一次性高亮(ring + 注释气泡 + 一次性渐入),严禁无限循环;
 * 看到一次后写入 localStorage,永不再显示。
 */
export function AskAiButton() {
  const scrollToAi = useScrollToProjectAi();
  const [showHint, setShowHint] = useState(false);

  const dismiss = useCallback(() => {
    setShowHint(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(HINT_SEEN_KEY, "1");
      } catch {
        /* 静默 */
      }
    }
  }, []);

  // 挂载时:未见过则延迟显示 hint,超时自动消失。
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = "1";
    try {
      seen = window.localStorage.getItem(HINT_SEEN_KEY) ?? "";
    } catch {
      seen = "1"; // 隐私模式 / 禁用 localStorage:当作已见过,不打扰
    }
    if (seen) return;
    const showTimer = window.setTimeout(() => setShowHint(true), HINT_DELAY);
    const hideTimer = window.setTimeout(() => dismiss(), HINT_DELAY + HINT_DURATION);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [dismiss]);

  function handleClick() {
    if (showHint) dismiss();
    scrollToAi();
  }

  return (
    // 把 relative 放在按钮自身上,bubble 作为按钮的子节点 → left-1/2 必然是按钮中心,
    // 不受外层 flex 容器度量影响。bubble 用 <span> 以满足 button 的 phrasing content。
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "border-brand/40 bg-brand/5 text-brand hover:bg-brand/15 relative inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 transition-shadow",
        showHint && "ring-brand/50 ring-offset-background ring-2 ring-offset-2"
      )}
    >
      {showHint && (
        <span
          aria-hidden="true"
          className="ask-ai-hint bg-brand text-primary-foreground pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-sm px-2.5 py-1 font-mono text-xs whitespace-nowrap shadow-sm"
        >
          <span className="opacity-70 select-none">{"// "}</span>
          试试问 AI 这个项目
        </span>
      )}
      <span className="text-brand select-none">$</span> ask --ai
      <Bot className="size-3" />
    </button>
  );
}

"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { TerminalWindow } from "@/components/terminal";
import { ChatMarkdown } from "@/components/shared/chat-markdown";

type Msg = { role: "user" | "assistant"; content: string };

type GlobalProps = {
  mode?: "global";
};

type ProjectProps = {
  mode: "project";
  slug: string;
  projectTitle: string;
  seedQuestions?: string[];
};

export type AiChatProps = (GlobalProps | ProjectProps) & {
  /** localStorage 持久化键;留空则不持久化 */
  storageKey?: string;
  /** 容器 id,⌘K 等可锚定跳转 */
  id?: string;
  /** 标题栏文案;留空走 mode 默认 */
  title?: string;
};

export type AiChatHandle = {
  /** ⌘K 等外部触发:聚焦输入框 */
  focus: () => void;
};

const GLOBAL_SUGGESTIONS = ["你最擅长什么?", "介绍下你的项目", "用什么技术栈?", "怎么联系你?"];

const PROJECT_FALLBACK_SUGGESTIONS = [
  "这个项目用了什么技术?",
  "怎么跑起来?",
  "踩过什么坑?",
  "和你其他项目有什么不同?",
];

/** 历史消息存储版本:schema 变更时丢弃旧记录,避免反序列化崩溃。 */
const STORAGE_VERSION = 1;

type StoredChat = {
  v: number;
  messages: Msg[];
};

function loadStored(key: string | undefined): Msg[] {
  if (!key || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredChat;
    if (parsed?.v !== STORAGE_VERSION || !Array.isArray(parsed.messages)) return [];
    return parsed.messages.filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    );
  } catch {
    return [];
  }
}

function saveStored(key: string | undefined, messages: Msg[]) {
  if (!key || typeof window === "undefined") return;
  try {
    // 流式过程中末尾常出现 content:"" 的占位 assistant,落盘时过滤,避免下次 hydration 看到空回复。
    const clean = messages.filter((m) => m.content.trim());
    const payload: StoredChat = { v: STORAGE_VERSION, messages: clean };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* 配额满或被禁,静默 */
  }
}

/**
 * 终端式 AI 对话分身。
 * - mode="global"(默认):走 /api/ai/chat,全站 AI 分身。
 * - mode="project":走 /api/ai/chat/project/{slug},上下文锁定到当前项目。
 * 自管消息状态 + 流式读取(text stream),不依赖 useChat 版本差异。
 */
export const AiChat = forwardRef<AiChatHandle, AiChatProps>(function AiChat(props, ref) {
  const mode = props.mode ?? "global";
  const storageKey = props.storageKey;

  const endpoint =
    mode === "project"
      ? `/api/ai/chat/project/${encodeURIComponent((props as ProjectProps).slug)}`
      : "/api/ai/chat";

  const defaultTitle =
    mode === "project" ? `~/ask-about/${(props as ProjectProps).slug} — ai` : "~/ask-zxb — ai";
  const title = props.title ?? defaultTitle;

  const suggestions =
    mode === "project"
      ? (props as ProjectProps).seedQuestions?.length
        ? (props as ProjectProps).seedQuestions!
        : PROJECT_FALLBACK_SUGGESTIONS
      : GLOBAL_SUGGESTIONS;

  const emptyHint =
    mode === "project"
      ? `问关于「${(props as ProjectProps).projectTitle}」的细节 —— 技术选型 / 踩坑 / 部署。`
      : "问问我的 AI 分身 —— 关于我的技术、项目或合作。";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  // 初次挂载从 localStorage 读回历史。SSR-safe:不放进 useState 初值。
  useEffect(() => {
    const restored = loadStored(storageKey);
    if (restored.length > 0) setMessages(restored);
    setHydrated(true);
  }, [storageKey]);

  // 历史变化时落盘(hydration 完成之后才写,避免覆盖)
  useEffect(() => {
    if (!hydrated) return;
    saveStored(storageKey, messages);
  }, [messages, storageKey, hydrated]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    // 只把有内容的历史发给后端,避免上一轮空回复(content:"")触发服务端 400 校验。
    const history = messages.filter((m) => m.content.trim());
    const next: Msg[] = [...history, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "⚠ 没有收到回复,请稍后再试。" };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "⚠ 出错了,请稍后再试。" };
        return copy;
      });
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function clearHistory() {
    if (busy) return;
    setMessages([]);
    if (storageKey && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* 静默 */
      }
    }
    inputRef.current?.focus();
  }

  return (
    <div id={props.id}>
      <TerminalWindow
        title={title}
        footer={
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-brand select-none">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask(input);
              }}
              disabled={busy}
              placeholder={busy ? "思考中…" : "输入问题,回车发送"}
              aria-label="向 AI 分身提问"
              spellCheck={false}
              autoComplete="off"
              className="text-foreground placeholder:text-muted-foreground/60 min-w-0 flex-1 bg-transparent outline-none disabled:opacity-60"
            />
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                disabled={busy}
                aria-label="清空对话"
                title="清空对话"
                className="text-muted-foreground hover:text-brand inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eraser className="size-3.5" />
                <span className="hidden sm:inline">清空</span>
              </button>
            )}
          </div>
        }
      >
        <div
          ref={bodyRef}
          className="max-h-[26rem] min-h-[16rem] space-y-3 overflow-y-auto px-4 py-3 font-mono text-sm break-words"
        >
          {messages.length === 0 ? (
            <div className="text-muted-foreground space-y-1">
              <p className="text-foreground/90">{emptyHint}</p>
              <p>试试下面的问题,或直接输入。</p>
              <div className="flex flex-wrap gap-2 pt-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    disabled={busy}
                    className="border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-brand/40 cursor-pointer rounded-sm border px-2 py-0.5 text-xs transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) =>
              m.role === "user" ? (
                <p key={i}>
                  <span className="text-muted-foreground">$ </span>
                  <span className="text-foreground">{m.content}</span>
                </p>
              ) : (
                <div key={i} className="text-muted-foreground flex gap-2">
                  <span className="text-brand select-none">→</span>
                  <div className="min-w-0 flex-1">
                    {m.content ? (
                      <ChatMarkdown>{m.content}</ChatMarkdown>
                    ) : (
                      <span className="terminal-caret text-brand">▋</span>
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </TerminalWindow>
    </div>
  );
});

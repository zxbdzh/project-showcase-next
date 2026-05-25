"use client";

import { useEffect, useRef, useState } from "react";
import { TerminalWindow } from "@/components/terminal";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["你最擅长什么?", "介绍下你的项目", "用什么技术栈?", "怎么联系你?"];

/**
 * 终端式 AI 对话分身:自管消息状态 + 流式读取(text stream),不依赖 useChat 版本差异。
 * 后端 /api/ai/chat 注入 zxb 的 profile/skills/projects 上下文。
 */
export function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch("/api/ai/chat", {
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

  return (
    <TerminalWindow
      title="~/ask-zxb — ai"
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
        </div>
      }
    >
      <div
        ref={bodyRef}
        className="max-h-[26rem] min-h-[16rem] space-y-3 overflow-y-auto px-4 py-3 font-mono text-sm break-words"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground space-y-1">
            <p className="text-foreground/90">问问我的 AI 分身 —— 关于我的技术、项目或合作。</p>
            <p>试试下面的问题,或直接输入。</p>
            <div className="flex flex-wrap gap-2 pt-3">
              {SUGGESTIONS.map((s) => (
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
              <p key={i} className="text-muted-foreground whitespace-pre-wrap">
                <span className="text-brand">→ </span>
                {m.content || <span className="terminal-caret text-brand">▋</span>}
              </p>
            )
          )
        )}
      </div>
    </TerminalWindow>
  );
}

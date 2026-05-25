"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { useInView, useReducedMotion } from "motion/react";
import { GridBackdrop } from "@/components/terminal";
import { TerminalOutput } from "@/features/hero/components/markup";
import type { HeroCommand } from "@/features/hero/schema";

type Line = { id: number; kind: "cmd" | "out"; content: ReactNode };

/** 可经 `/route` 直接跳转的站内路由 */
const ROUTES = new Set(["/", "/projects", "/about", "/contact"]);

/**
 * Hero 交互终端:进入时逐字打出 help;支持点击预设命令与真实输入。
 * 命令与输出取自后台配置(commands);help / clear 为内置。
 * 纯 DOM / CSS,无 WebGL;明暗双模式自适应。
 * prefers-reduced-motion 时跳过打字动画,命令即时落定。
 */
export function HeroTerminal({ commands }: { commands: HeroCommand[] }) {
  const reduce = useReducedMotion();
  const router = useTransitionRouter();
  const [history, setHistory] = useState<Line[]>([]);
  const [activeCmd, setActiveCmd] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const idRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(false);

  const commandMap = useMemo(() => new Map(commands.map((c) => [c.name, c])), [commands]);
  const buttonCmds = useMemo(() => ["help", ...commands.map((c) => c.name)], [commands]);

  // 仅当终端滚动进入视口后才触发自动打字 —— 让用户看完上方滚动叙事再开场。
  const inView = useInView(rootRef, { once: true, margin: "-80px" });

  /** 命令输出:help 由命令列表生成,其余查配置;未命中回 command not found */
  const renderOutput = useCallback(
    (cmd: string): ReactNode => {
      if (cmd === "help") {
        return (
          <div className="text-muted-foreground">
            <p className="text-foreground/90">可用命令:</p>
            {commands.map((c) => (
              <p key={c.name}>{`  ${c.name.padEnd(10)}${c.desc}`}</p>
            ))}
            <p>{"  clear     清屏"}</p>
          </div>
        );
      }
      const found = commandMap.get(cmd);
      if (found) return <TerminalOutput text={found.output} />;
      return (
        <p className="text-muted-foreground">
          command not found: {cmd} — 输入 <span className="text-foreground">help</span> 查看可用命令
        </p>
      );
    },
    [commands, commandMap]
  );

  const commit = useCallback(
    (cmd: string) => {
      const c = cmd.trim();
      if (!c) return;
      if (c === "clear") {
        setHistory([]);
        return;
      }
      // `/route` 直接跳转(走 View Transitions);未知路由仍落到 command not found
      if (c.startsWith("/") && ROUTES.has(c)) {
        setHistory((h) => [
          ...h,
          { id: (idRef.current += 1), kind: "cmd", content: c },
          {
            id: (idRef.current += 1),
            kind: "out",
            content: (
              <p className="text-muted-foreground">
                正在打开 <span className="text-brand">{c}</span> …
              </p>
            ),
          },
        ]);
        router.push(c);
        return;
      }
      setHistory((h) => [
        ...h,
        { id: (idRef.current += 1), kind: "cmd", content: c },
        { id: (idRef.current += 1), kind: "out", content: renderOutput(c) },
      ]);
    },
    [router, renderOutput]
  );

  // 逐字「打」出命令(自动入场 / 点击触发);用户手输则直接 commit
  const play = useCallback(
    (cmd: string) => {
      if (busy) return;
      if (reduce) {
        commit(cmd);
        return;
      }
      setBusy(true);
      setActiveCmd("");
      let i = 0;
      const step = () => {
        i += 1;
        setActiveCmd(cmd.slice(0, i));
        if (i < cmd.length) {
          timers.current.push(setTimeout(step, 55));
        } else {
          timers.current.push(
            setTimeout(() => {
              setActiveCmd(null);
              commit(cmd);
              setBusy(false);
            }, 180)
          );
        }
      };
      timers.current.push(setTimeout(step, 40));
    },
    [busy, reduce, commit]
  );

  // 入场:进入视口后再自动打出 help(只触发一次)
  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    timers.current.push(setTimeout(() => play("help"), 320));
    // 仅在进入视口时播放一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // 卸载时清理所有定时器
  useEffect(() => {
    const captured = timers.current;
    return () => captured.forEach(clearTimeout);
  }, []);

  // 输出后滚动到底部
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, activeCmd]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || busy) return;
    e.preventDefault();
    const v = input;
    setInput("");
    commit(v);
  };

  return (
    <div
      ref={rootRef}
      className="border-border bg-muted/30 relative isolate overflow-hidden rounded-lg border p-3 sm:p-4"
    >
      {/* 工程图纸网格底纹 */}
      <GridBackdrop />

      <div className="border-border/60 bg-card/70 flex min-h-[20rem] flex-col rounded-md border backdrop-blur-md sm:min-h-[24rem]">
        {/* 标题栏 */}
        <div className="border-border/50 flex items-center gap-1.5 border-b px-4 py-2.5">
          <span className="size-3 rounded-full bg-red-400/80" />
          <span className="size-3 rounded-full bg-amber-400/80" />
          <span className="size-3 rounded-full bg-emerald-400/80" />
          <span className="text-muted-foreground ml-2 font-mono text-xs">~/portfolio — bash</span>
        </div>

        {/* 输出区(可点击聚焦输入) */}
        <div
          ref={bodyRef}
          onClick={() => inputRef.current?.focus()}
          className="flex-1 cursor-text space-y-1 overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap"
        >
          {history.map((l) =>
            l.kind === "cmd" ? (
              <p key={l.id}>
                <span className="text-muted-foreground">$ </span>
                <span className="text-foreground">{l.content}</span>
              </p>
            ) : (
              <div key={l.id} className="pb-1">
                {l.content}
              </div>
            )
          )}

          {/* 正在打字的命令 */}
          {activeCmd !== null && (
            <p>
              <span className="text-muted-foreground">$ </span>
              <span className="text-foreground">{activeCmd}</span>
              <span className="text-brand terminal-caret ml-0.5 inline-block">▋</span>
            </p>
          )}

          {/* 实时输入行(打字动画期间隐藏,保证同时只有一个提示符) */}
          {!busy && (
            <p className="flex items-center">
              <span className="text-muted-foreground">$&nbsp;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                aria-label="终端命令输入"
                placeholder={history.length ? "" : "输入 help 回车"}
                className="text-foreground placeholder:text-muted-foreground/60 min-w-0 flex-1 bg-transparent outline-none"
              />
            </p>
          )}
        </div>

        {/* 可点击命令 */}
        <div className="border-border/50 flex flex-wrap gap-2 border-t px-4 py-2.5">
          {buttonCmds.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                play(c);
                inputRef.current?.focus();
              }}
              disabled={busy}
              className="border-border/60 bg-background/60 text-muted-foreground hover:text-foreground hover:border-brand/40 focus-visible:ring-brand/40 cursor-pointer rounded-md border px-2 py-0.5 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

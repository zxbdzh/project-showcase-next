"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Container } from "@/components/shared/container";
import { GridBackdrop, StatusDot } from "@/components/terminal";
import { buttonVariants } from "@/components/ui/button";
import { EASE_OUT_EXPO } from "@/lib/motion";

/** 输出行片段:em 片段为品牌色高亮;br 为桌面端软换行 */
type Seg = { t: ReactNode; em?: boolean } | { br: true };

/** 开机脚本行:命令行(mono chrome)或输出行(sans 中文叙事) */
type Row =
  | { kind: "cmd"; text: string }
  | { kind: "out"; segs: Seg[]; tone?: "head" | "body" | "status" };

/**
 * 终端「开机序列」脚本。进入视口后自动逐行 print:命令 → 其输出。
 */
const script: Row[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", tone: "head", segs: [{ t: "你好,我叫 " }, { t: "zxb", em: true }, { t: "。" }] },
  { kind: "cmd", text: "cat profile.txt" },
  {
    kind: "out",
    segs: [{ t: "我是一名 " }, { t: "Java 为主的全栈开发者", em: true }, { t: "。" }],
  },
  {
    kind: "out",
    segs: [{ t: "主力用 " }, { t: "Java / Spring Boot", em: true }, { t: " 做后端," }],
  },
  {
    kind: "out",
    segs: [{ t: "也能用 " }, { t: "TypeScript / React", em: true }, { t: " 独立扛起前端。" }],
  },
  {
    kind: "out",
    segs: [
      { t: "把 Web、小程序到桌面端的复杂需求," },
      { br: true },
      { t: "收敛成" },
      { t: "会上线的产品", em: true },
      { t: "。" },
    ],
  },
  { kind: "cmd", text: "./status --availability" },
  { kind: "out", tone: "status", segs: [{ t: "可参与合作 · Java 全栈 / 跨端 / AI 应用" }] },
  { kind: "cmd", text: "open --work" },
];

/** 逐行揭示节奏(ms):命令行前留更长停顿(阅读),输出行紧随其命令 print。整体偏舒缓 */
const LEAD = 600;
const CMD_DELAY = 1150;
const OUT_DELAY = 700;
const CTA_DELAY = 800;

function isBreak(s: Seg): s is { br: true } {
  return "br" in s;
}

const headClass =
  "text-3xl leading-[1.22] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl";
const bodyClass =
  "text-2xl leading-[1.3] font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl";

function Segments({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map((s, i) => {
        if (isBreak(s)) return <br key={i} className="hidden sm:block" />;
        if (s.em)
          return (
            <span key={i} className="text-brand">
              {s.t}
            </span>
          );
        return <span key={i}>{s.t}</span>;
      })}
    </>
  );
}

/** 命令行内容:`$ cmd`,等宽 chrome */
function CmdInner({ text, caret }: { text: string; caret?: ReactNode }) {
  return (
    <span className="text-muted-foreground inline-flex items-baseline font-mono text-base sm:text-lg">
      <span className="text-brand mr-2 select-none">$</span>
      <span className="text-foreground/90">{text}</span>
      {caret}
    </span>
  );
}

/** 输出行内容:`>` 标记 + 中文 sans 叙事 */
function OutInner({
  segs,
  tone,
  caret,
}: {
  segs: Seg[];
  tone?: "head" | "body" | "status";
  caret?: ReactNode;
}) {
  if (tone === "status") {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-2 font-mono text-sm sm:text-base">
        <StatusDot tone="emerald" ping />
        <Segments segs={segs} />
        {caret}
      </span>
    );
  }
  return (
    <span className={tone === "head" ? headClass : bodyClass}>
      <span className="text-brand/60 mr-2 align-middle font-mono text-lg select-none sm:text-2xl">
        {">"}
      </span>
      <Segments segs={segs} />
      {caret}
    </span>
  );
}

const caretEl = <span className="text-brand terminal-caret ml-1 inline-block align-middle">▋</span>;

/** 自动揭示的单行:可见前透明下移,落定后驻留;光标跟随当前末行 */
function BootRow({ row, visible, showCaret }: { row: Row; visible: boolean; showCaret: boolean }) {
  const caret = showCaret ? caretEl : null;
  return (
    <motion.div
      className="py-0.5"
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
    >
      {row.kind === "cmd" ? (
        <CmdInner text={row.text} caret={caret} />
      ) : (
        <OutInner segs={row.segs} tone={row.tone} caret={caret} />
      )}
    </motion.div>
  );
}

const cta = (
  <div className="flex flex-wrap items-center gap-3 pt-2">
    <Link href="/projects" className={buttonVariants({ className: "group rounded-md px-5" })}>
      查看作品
      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
    <Link
      href="/contact"
      className={buttonVariants({ variant: "outline", className: "rounded-md px-5" })}
    >
      联系我
    </Link>
  </div>
);

/** 静态降级:整段直出,高亮满色,无动画、无光标闪烁 */
function StaticBoot() {
  return (
    <section className="flex min-h-[88vh] items-center">
      <Container>
        <div className="space-y-1">
          {script.map((row, i) => (
            <div key={i} className="py-0.5">
              {row.kind === "cmd" ? (
                <CmdInner text={row.text} />
              ) : (
                <OutInner segs={row.segs} tone={row.tone} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-8">{cta}</div>
      </Container>
    </section>
  );
}

/**
 * 首页「开机序列」开场:进入视口后按定时器逐行自动 print 命令与输出,
 * 光标跟随当前末行,最后浮出 CTA。不绑滚动、不钉屏。
 * 仅用 transform/opacity;prefers-reduced-motion 时整段静态直出。
 */
export function HeroIntro() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // count = 已揭示行数(rows 0..count-1 可见)
  const [count, setCount] = useState(0);
  const [ctaShown, setCtaShown] = useState(false);
  const startedRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 进入视口后启动自动 print(只触发一次)
  useEffect(() => {
    if (reduce || !inView || startedRef.current) return;
    startedRef.current = true;
    let i = 0;
    const tick = () => {
      setCount(i + 1);
      i += 1;
      if (i >= script.length) {
        timers.current.push(setTimeout(() => setCtaShown(true), CTA_DELAY));
        return;
      }
      const delay = script[i].kind === "cmd" ? CMD_DELAY : OUT_DELAY;
      timers.current.push(setTimeout(tick, delay));
    };
    timers.current.push(setTimeout(tick, LEAD));
  }, [inView, reduce]);

  // 卸载时清理所有定时器
  useEffect(() => {
    const captured = timers.current;
    return () => captured.forEach(clearTimeout);
  }, []);

  if (reduce) return <StaticBoot />;

  // 光标:落在当前已揭示的最后一行;CTA 出现后移除
  const activeIndex = count - 1;

  return (
    <section ref={ref} className="relative flex min-h-svh items-center overflow-hidden">
      <GridBackdrop />
      <Container>
        <div className="space-y-1">
          {script.map((row, i) => (
            <BootRow
              key={i}
              row={row}
              visible={i < count}
              showCaret={!ctaShown && i === activeIndex}
            />
          ))}

          {/* CTA:最后揭示 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ctaShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="pt-4"
          >
            {cta}
          </motion.div>
        </div>
      </Container>

      {/* 开机完成后浮出「向下滚动」提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ctaShown ? 1 : 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-1 font-mono"
      >
        <span className="text-xs">▼ scroll</span>
        <ChevronDown className="hero-cue size-4" />
      </motion.div>
    </section>
  );
}

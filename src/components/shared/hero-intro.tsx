"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import { EASE_OUT_EXPO } from "@/lib/motion";

/** 一行由若干片段组成;em 片段为品牌色高亮,随滚动逐渐点亮;br 为桌面端软换行 */
type Seg = { t: ReactNode; em?: boolean } | { br: true };

/** greeting 进入即显示,其余随滚动逐句揭示 */
const greeting: ReactNode = (
  <>
    你好,我叫{" "}
    <span className="from-brand bg-gradient-to-r to-violet-500 bg-clip-text text-transparent">
      zxb
    </span>
    。
  </>
);

const lines: Seg[][] = [
  [{ t: "我是一名 " }, { t: "Java 为主的全栈开发者", em: true }, { t: "。" }],
  [{ t: "主力用 " }, { t: "Java / Spring Boot", em: true }, { t: " 做后端," }],
  [{ t: "也能用 " }, { t: "TypeScript / React", em: true }, { t: " 独立扛起前端。" }],
  [
    { t: "把 Web、小程序到桌面端的复杂需求," },
    { br: true },
    { t: "收敛成" },
    { t: "会上线的产品", em: true },
    { t: "。" },
  ],
];

/**
 * 滚动揭示节奏:首句留白后每句占一个 step;整段(含 CTA)在 ~0.76 处完成,
 * 之后驻留至区块末尾,避免「滚到底之前内容就消失」。
 */
const LEAD = 0.05;
const STEP = 0.14;
const LEN = 0.11;

function isBreak(s: Seg): s is { br: true } {
  return "br" in s;
}

function RevealLine({
  progress,
  index,
  segs,
  className,
}: {
  progress: MotionValue<number>;
  index: number;
  segs: Seg[];
  className?: string;
}) {
  const start = LEAD + index * STEP;
  const opacity = useTransform(progress, [start, start + LEN], [0, 1]);
  const y = useTransform(progress, [start, start + LEN], [28, 0]);
  // 高亮在该行落定后才点亮:由 0.2(微显)渐强到 1(满品牌色)
  const hl = useTransform(progress, [start + LEN * 0.4, start + LEN + 0.06], [0.2, 1]);

  return (
    <motion.p style={{ opacity, y }} className={className}>
      {segs.map((s, i) => {
        if (isBreak(s)) return <br key={i} className="hidden sm:block" />;
        if (s.em)
          return (
            <motion.span key={i} style={{ opacity: hl }} className="text-brand">
              {s.t}
            </motion.span>
          );
        return <span key={i}>{s.t}</span>;
      })}
    </motion.p>
  );
}

/** 静态渲染一行(降级分支):高亮直接满色 */
function StaticLine({ segs, className }: { segs: Seg[]; className?: string }) {
  return (
    <p className={className}>
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
    </p>
  );
}

/**
 * 首页滚动驱动叙事开场:sticky 钉屏,随滚动逐句揭示并点亮高亮,最后浮出 CTA。
 * 仅用 transform/opacity;prefers-reduced-motion 时整段静态直出。
 */
export function HeroIntro() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // CTA 在最后一句之后揭示,完成后驻留
  const ctaStart = LEAD + lines.length * STEP;
  const ctaOpacity = useTransform(scrollYProgress, [ctaStart, ctaStart + LEN + 0.04], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [ctaStart, ctaStart + LEN + 0.04], [28, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  const lineClass =
    "text-3xl leading-[1.25] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl";

  const pill = (
    <div className="border-border/60 bg-card/60 mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-emerald-500/50" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-muted-foreground text-xs font-medium">
        可参与合作 · Java 全栈 / 跨端 / AI 应用
      </span>
    </div>
  );

  const cta = (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <Link href="/projects" className={buttonVariants({ className: "group rounded-full px-5" })}>
        查看作品
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
      <Link
        href="/contact"
        className={buttonVariants({ variant: "outline", className: "rounded-full px-5" })}
      >
        联系我
      </Link>
    </div>
  );

  // 降级:静态直出,不绑定滚动
  if (reduce) {
    return (
      <section className="flex min-h-[88vh] items-center">
        <Container>
          {pill}
          <div className="text-foreground space-y-2">
            <p className={lineClass}>{greeting}</p>
            {lines.map((segs, i) => (
              <StaticLine key={i} segs={segs} className={lineClass} />
            ))}
          </div>
          {cta}
        </Container>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <Container>
          {/* 状态徽标:进入即淡入 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          >
            {pill}
          </motion.div>

          <div className="text-foreground space-y-2">
            {/* 首句:进入即落定 */}
            <motion.p
              className={lineClass}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT_EXPO }}
            >
              {greeting}
            </motion.p>

            {/* 其余句:随滚动逐句揭示并点亮高亮 */}
            {lines.map((segs, i) => (
              <RevealLine
                key={i}
                progress={scrollYProgress}
                index={i}
                segs={segs}
                className={lineClass}
              />
            ))}
          </div>

          {/* CTA:最后揭示 */}
          <motion.div style={{ opacity: ctaOpacity, y: ctaY }}>{cta}</motion.div>
        </Container>

        {/* 向下滚动提示 */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-1"
        >
          <span className="text-xs">向下滚动</span>
          <ChevronDown className="hero-cue size-4" />
        </motion.div>
      </div>
    </section>
  );
}

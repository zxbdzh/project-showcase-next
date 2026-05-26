import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { GalleryImage } from "@/components/gallery";

/**
 * 终端风 MDX 渲染。
 *
 * 兼容 GitHub README:`format: "md"` 走 commonmark 解析,
 * `remark-gfm` 接住表格 / 任务列表 / 删除线,
 * `rehype-raw` 允许在 markdown 中内联 HTML(`<br>`、`<details>`、`<p align="center">`、`<kbd>` 等)。
 *
 * 组件层为常见元素套上终端工程美学:等宽 chrome、方角、暖灰中性 + 琥珀信号色,
 * 与 prose 工具类不再叠加(避免双重间距)。
 */
const components = {
  // 标题:压制 MDX 内首个 H1 视觉为 H2(避免与页面 H1 冲突),并加 mono 注释体前缀
  h1: ({ className, children, ...props }: ComponentProps<"h1">) => (
    <h2
      className={cn(
        "mt-16 mb-4 scroll-mt-24 font-mono text-2xl font-semibold tracking-tight sm:text-3xl",
        "before:text-brand before:mr-2 before:content-['#']",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h2: ({ className, children, ...props }: ComponentProps<"h2">) => (
    <h2
      className={cn(
        "mt-14 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight",
        "before:text-brand before:mr-2 before:font-mono before:content-['##']",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: ComponentProps<"h3">) => (
    <h3
      className={cn(
        "mt-10 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight",
        "before:text-brand/70 before:mr-2 before:font-mono before:content-['###']",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ className, children, ...props }: ComponentProps<"h4">) => (
    <h4
      className={cn(
        "mt-8 mb-2 scroll-mt-24 text-lg font-semibold tracking-tight",
        "before:text-muted-foreground before:mr-2 before:font-mono before:content-['####']",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  ),

  // 段落与基础文本
  p: ({ className, ...props }: ComponentProps<"p">) => (
    <p className={cn("text-foreground/90 my-4 leading-7", className)} {...props} />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="text-foreground font-semibold" {...props} />
  ),
  em: (props: ComponentProps<"em">) => <em className="italic" {...props} />,
  del: (props: ComponentProps<"del">) => (
    <del className="text-muted-foreground line-through decoration-2" {...props} />
  ),

  // 链接:琥珀色 + 下划线偏移
  a: ({ className, href, ...props }: ComponentProps<"a">) => {
    const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={cn(
          "text-brand hover:text-brand-hover underline underline-offset-4 transition-colors",
          className
        )}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  },

  // 列表:暖灰圆点 + 琥珀 marker(任务列表 checkbox 由 remark-gfm 维持)
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul
      className={cn("marker:text-brand/70 my-4 ml-6 list-outside list-disc space-y-1.5", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol
      className={cn(
        "marker:text-muted-foreground my-4 ml-6 list-outside list-decimal space-y-1.5 marker:font-mono",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<"li">) => (
    <li className={cn("text-foreground/90 leading-7", className)} {...props} />
  ),

  // 引用块:左侧琥珀竖条 + mono 注释
  blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote
      className={cn(
        "border-brand text-muted-foreground bg-muted/40 my-6 border-l-2 px-4 py-3",
        "[&>p]:text-foreground/80 [&>p]:my-0",
        className
      )}
      {...props}
    />
  ),

  // 代码:行内代码 vs 代码块(由 pre 包裹判定)
  code: ({ className, ...props }: ComponentProps<"code">) => (
    <code
      className={cn(
        // 行内代码
        "bg-muted rounded-sm px-1.5 py-0.5 font-mono text-[0.875em]",
        // 在 pre 内时由 pre 控制 padding,行内样式被重置
        "[pre_&]:rounded-none [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-sm",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<"pre">) => (
    <pre
      className={cn(
        "border-border bg-muted/60 my-6 overflow-x-auto rounded-md border p-4 font-mono text-sm leading-relaxed",
        className
      )}
      {...props}
    />
  ),

  // 分隔线:方角点线
  hr: ({ className, ...props }: ComponentProps<"hr">) => (
    <hr className={cn("border-border/60 my-10", className)} {...props} />
  ),

  // 表格:边框 + 暖灰 head 底色 + zebra
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table
        className={cn("border-border w-full border-collapse border text-sm", className)}
        {...props}
      />
    </div>
  ),
  thead: (props: ComponentProps<"thead">) => <thead className="bg-muted/60" {...props} />,
  tr: ({ className, ...props }: ComponentProps<"tr">) => (
    <tr className={cn("border-border/60 border-b last:border-b-0", className)} {...props} />
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th
      className={cn(
        "border-border/60 border-r px-3 py-2 text-left font-mono text-xs font-semibold tracking-wide last:border-r-0",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => (
    <td
      className={cn("border-border/60 border-r px-3 py-2 align-top last:border-r-0", className)}
      {...props}
    />
  ),

  // 图片:点击放大幻灯片(由外层 GalleryProvider 接管),延迟加载 + 方角边框
  img: ({ className, alt, src, ...props }: ComponentProps<"img">) => (
    <GalleryImage
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      className={cn("border-border/60 my-6 h-auto max-w-full rounded-md border", className)}
      {...props}
    />
  ),

  // HTML 习惯:kbd / sub / sup / details / summary
  kbd: ({ className, ...props }: ComponentProps<"kbd">) => (
    <kbd
      className={cn(
        "border-border bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none",
        className
      )}
      {...props}
    />
  ),
  details: ({ className, ...props }: ComponentProps<"details">) => (
    <details
      className={cn(
        "border-border bg-muted/30 my-6 rounded-md border px-4 py-3 [&[open]>summary]:mb-3 [&[open]>summary::after]:content-['−']",
        className
      )}
      {...props}
    />
  ),
  summary: ({ className, children, ...props }: ComponentProps<"summary">) => (
    <summary
      className={cn(
        "text-foreground cursor-pointer list-none font-mono text-sm font-semibold select-none",
        "before:text-brand before:mr-2 before:content-['$']",
        "after:text-muted-foreground after:ml-auto after:content-['+']",
        "flex items-center",
        className
      )}
      {...props}
    >
      {children}
    </summary>
  ),
};

export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          // 走 commonmark 解析,MDX 不再把 `<` 当作 JSX 起始
          format: "md",
          remarkPlugins: [remarkGfm],
          // 让 remark-rehype 把 HTML 节点保留为 raw,再交由 rehype-raw 解析,
          // 这样 GitHub README 里常见的 <br>、<details>、<p align="center">、<kbd> 才能正常渲染。
          remarkRehypeOptions: { allowDangerousHtml: true },
          rehypePlugins: [rehypeRaw],
        },
      }}
    />
  );
}

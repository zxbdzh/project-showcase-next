import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// 终端风格的 Markdown 渲染:琥珀链接、方角、等宽继承自父容器。
// 用于 AI 分身回复(模型输出含 **加粗** / [链接]() / 列表等)。
const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="marker:text-brand/60">{children}</li>,
  // 标题在小气泡里降级为加粗段落,避免突兀的大字号
  h1: ({ children }) => <p className="text-foreground my-1.5 font-semibold">{children}</p>,
  h2: ({ children }) => <p className="text-foreground my-1.5 font-semibold">{children}</p>,
  h3: ({ children }) => <p className="text-foreground my-1.5 font-semibold">{children}</p>,
  code: ({ children }) => (
    <code className="bg-muted text-foreground rounded-sm px-1 py-0.5 text-[0.85em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted my-2 overflow-x-auto rounded-sm p-2 text-xs [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-border text-muted-foreground/80 my-1.5 border-l-2 pl-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border/60 my-2" />,
};

export function ChatMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}

import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import { TerminalWindow, StatusDot } from "@/components/terminal";
import { AskAiButton } from "@/components/shared/ask-ai-button";
import { cn } from "@/lib/utils";

/**
 * 项目 Hero:把元数据转译成 JSON manifest 文件视觉。
 * - 终端窗口外壳 + `~/projects/{slug}.json` 标题
 * - 结构化字段表:name / category / status / since / views / demo / repo / stack / tags
 * - 底部命令式 CTA:$ open --demo / $ git clone
 *
 * 比平铺标签和平实按钮更具技术辨识度,呼应 hero-terminal 母题。
 */
type Tag = {
  id: string;
  name: string;
  slug: string;
};

export interface ProjectManifestProps {
  title: string;
  slug: string;
  summary: string | null;
  category: { name: string } | null;
  createdAt: Date | string;
  views: number;
  featured: boolean;
  demoUrl: string | null;
  repoUrl: string | null;
  techStack: string[] | null;
  tags: Tag[];
}

/** 把字符串域名抽出来,简化 UI 显示(去 protocol、去末尾 /) */
function shortenUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  // YYYY-MM-DD 工程化日期格式
  return date.toISOString().slice(0, 10);
}

/** 单行字段:左 key、中冒号、右 value(可为任意 ReactNode) */
function Field({
  k,
  children,
  className,
}: {
  k: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[6.5rem_1fr] items-baseline gap-x-3 py-1.5 font-mono text-sm sm:grid-cols-[7.5rem_1fr]",
        className
      )}
    >
      <span className="text-muted-foreground select-none">
        <span className="text-brand/70 select-none">{'"'}</span>
        {k}
        <span className="text-brand/70 select-none">{'":'}</span>
      </span>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

function ValueString({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-foreground/90">
      <span className="text-emerald-600/80 select-none dark:text-emerald-400/80">{'"'}</span>
      {children}
      <span className="text-emerald-600/80 select-none dark:text-emerald-400/80">{'"'}</span>
    </span>
  );
}

function ValueLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand hover:text-brand-hover group inline-flex items-center gap-1 underline underline-offset-4 transition-colors"
    >
      <span className="text-emerald-600/80 select-none dark:text-emerald-400/80">{'"'}</span>
      <span className="truncate">{children}</span>
      <span className="text-emerald-600/80 select-none dark:text-emerald-400/80">{'"'}</span>
      <ArrowUpRight className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function ValueMuted({ children = "—" }: { children?: React.ReactNode }) {
  return <span className="text-muted-foreground/60">{children}</span>;
}

export function ProjectManifest({
  title,
  slug,
  summary,
  category,
  createdAt,
  views,
  featured,
  demoUrl,
  repoUrl,
  techStack,
  tags,
}: ProjectManifestProps) {
  const statusLabel = featured ? "featured" : "published";

  return (
    <TerminalWindow
      title={`~/projects/${slug}.json`}
      className="bg-card/70 backdrop-blur-md"
      bodyClassName="px-4 py-4 sm:px-6 sm:py-5"
      footer={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
          {demoUrl && (
            <Link
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-brand/40 bg-brand/10 text-brand hover:bg-brand/20 inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 transition-colors"
            >
              <span className="text-brand select-none">$</span> open --demo
              <ArrowUpRight className="size-3" />
            </Link>
          )}
          {repoUrl && (
            <Link
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-background/60 text-foreground hover:border-brand/40 hover:text-brand inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 transition-colors"
            >
              <span className="text-muted-foreground select-none">$</span> git clone
              <ArrowUpRight className="size-3" />
            </Link>
          )}
          <AskAiButton />
          <span className="text-muted-foreground/70 ml-auto inline-flex items-center gap-1">
            <Eye className="size-3" />
            {views.toLocaleString()} views
          </span>
        </div>
      }
    >
      {/* manifest body */}
      <div className="font-mono text-sm leading-relaxed">
        <p className="text-muted-foreground select-none">{"{"}</p>

        <div className="pl-4">
          <Field k="name">
            <ValueString>{title}</ValueString>
          </Field>

          {summary && (
            <Field k="summary">
              <span className="text-foreground/80 font-sans leading-relaxed">{summary}</span>
            </Field>
          )}

          <Field k="category">
            {category ? <ValueString>{category.name}</ValueString> : <ValueMuted />}
          </Field>

          <Field k="status">
            <span className="inline-flex items-center gap-2">
              <StatusDot tone={featured ? "amber" : "emerald"} />
              <ValueString>{statusLabel}</ValueString>
            </span>
          </Field>

          <Field k="since">
            <span className="text-foreground/80">{formatDate(createdAt)}</span>
          </Field>

          <Field k="demo">
            {demoUrl ? <ValueLink href={demoUrl}>{shortenUrl(demoUrl)}</ValueLink> : <ValueMuted />}
          </Field>

          <Field k="repo">
            {repoUrl ? <ValueLink href={repoUrl}>{shortenUrl(repoUrl)}</ValueLink> : <ValueMuted />}
          </Field>

          <Field k="stack">
            {!techStack || techStack.length === 0 ? (
              <ValueMuted>[]</ValueMuted>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground select-none">[</span>
                {techStack.map((t, i) => (
                  <span
                    key={t}
                    className="border-border/70 bg-muted/40 hover:border-brand/40 inline-flex items-center rounded-sm border px-2 py-0.5 text-xs transition-colors"
                  >
                    <span>{t}</span>
                    {i < techStack.length - 1 && (
                      <span className="text-muted-foreground/40 -mr-1 select-none">,</span>
                    )}
                  </span>
                ))}
                <span className="text-muted-foreground select-none">]</span>
              </div>
            )}
          </Field>

          <Field k="tags">
            {tags.length === 0 ? (
              <ValueMuted>[]</ValueMuted>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground select-none">[</span>
                {tags.map((t, i) => (
                  <span
                    key={t.id}
                    className="text-muted-foreground inline-flex items-center text-xs"
                  >
                    <span className="text-brand/70">#</span>
                    {t.name}
                    {i < tags.length - 1 && (
                      <span className="text-muted-foreground/40 mx-1 select-none">,</span>
                    )}
                  </span>
                ))}
                <span className="text-muted-foreground select-none">]</span>
              </div>
            )}
          </Field>
        </div>

        <p className="text-muted-foreground select-none">{"}"}</p>
      </div>
    </TerminalWindow>
  );
}

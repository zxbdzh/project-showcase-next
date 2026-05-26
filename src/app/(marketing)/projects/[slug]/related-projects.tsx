import { Link as TransitionLink } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedProject {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  techStack: string[] | null;
}

/**
 * 相关项目:文件式编号卡(// related/0)+ 路径 caption + 终端 hover 描边。
 * 区别于通用 portfolio 网格,呼应母题的"工程项目目录"语义。
 */
export function RelatedProjects({ items }: { items: RelatedProject[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-border/60 mt-20 border-t pt-12">
      <header className="mb-8 flex items-baseline justify-between">
        <h2 className="font-mono text-sm tracking-tight">
          <span className="text-brand select-none">{"// "}</span>
          <span className="text-muted-foreground">related projects</span>
        </h2>
        <TransitionLink
          href="/projects"
          className="text-muted-foreground hover:text-brand inline-flex items-center gap-1 font-mono text-xs transition-colors"
        >
          $ ls ../ <ArrowUpRight className="size-3" />
        </TransitionLink>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((p, i) => (
          <TransitionLink
            key={p.id}
            href={`/projects/${p.slug}`}
            className={cn(
              "group border-border/60 bg-card/40 hover:border-brand/50 relative flex flex-col overflow-hidden rounded-md border transition-colors"
            )}
          >
            {/* 文件路径 caption */}
            <div className="border-border/60 text-muted-foreground group-hover:text-brand/80 flex items-center justify-between border-b px-3 py-2 font-mono text-[11px] transition-colors">
              <span className="truncate">
                <span className="select-none">{`// related/${i.toString().padStart(2, "0")}`}</span>
              </span>
              <ArrowUpRight className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            {/* 缩略图(无图时显示 grid 占位) */}
            {p.coverImage ? (
              <div className="aspect-video overflow-hidden">
                <img
                  src={p.coverImage}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  style={{ viewTransitionName: `project-cover-${p.slug}` }}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ) : (
              <div className="bg-muted/50 terminal-grid aspect-video" />
            )}

            {/* 卡片正文 */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="text-foreground line-clamp-1 text-sm font-semibold tracking-tight">
                {p.title}
              </h3>
              {p.summary && (
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {p.summary}
                </p>
              )}
              {p.techStack && p.techStack.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-1 pt-1">
                  {p.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="border-border/70 text-muted-foreground rounded-sm border px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {tech}
                    </span>
                  ))}
                  {p.techStack.length > 3 && (
                    <span className="text-muted-foreground/60 px-1 font-mono text-[10px]">
                      +{p.techStack.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  );
}

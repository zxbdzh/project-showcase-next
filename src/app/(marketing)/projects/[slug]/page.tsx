import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowLeft, Eye } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  getProjectBySlug,
  incrementProjectViews,
  getRelatedProjects,
} from "@/features/projects/queries";
import { MdxContent } from "./mdx-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "项目未找到" };

  return {
    title: project.title,
    description: project.summary ?? undefined,
    openGraph: {
      title: project.title,
      description: project.summary ?? undefined,
      images: project.coverImage ? [project.coverImage] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // 异步增加浏览量(不阻塞渲染)
  incrementProjectViews(project.id);

  const related = await getRelatedProjects(project.category?.id ?? null, project.id);

  return (
    <article className="py-24 sm:py-32">
      <Container className="max-w-[980px]">
        <FadeIn>
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" /> 返回作品列表
          </Link>
        </FadeIn>

        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{project.title}</h1>
        </FadeIn>

        {project.summary && (
          <FadeIn delay={0.06}>
            <p className="text-muted-foreground mt-4 text-xl">{project.summary}</p>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.category && (
              <Badge variant="secondary" className="rounded-full">
                {project.category.name}
              </Badge>
            )}
            {project.tags?.map((tag) => (
              <Badge key={tag.id} variant="outline" className="rounded-full">
                {tag.name}
              </Badge>
            ))}
            {project.techStack?.map((tech) => (
              <Badge key={tech} variant="outline" className="rounded-full">
                {tech}
              </Badge>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.14}>
          <div className="mt-6 flex items-center gap-4 text-sm">
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "sm", className: "rounded-full" })}
              >
                在线演示 <ArrowUpRight className="size-3.5" />
              </Link>
            )}
            {project.repoUrl && (
              <Link
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "rounded-full",
                })}
              >
                源代码 <ArrowUpRight className="size-3.5" />
              </Link>
            )}
            <span className="text-muted-foreground flex items-center gap-1">
              <Eye className="size-3.5" /> {project.views} 次浏览
            </span>
          </div>
        </FadeIn>

        {project.coverImage && (
          <FadeIn delay={0.16}>
            <div className="mt-10 aspect-video overflow-hidden rounded-2xl">
              <img
                src={project.coverImage}
                alt={project.title}
                className="size-full object-cover"
              />
            </div>
          </FadeIn>
        )}

        {project.content && (
          <FadeIn delay={0.2}>
            <div className="prose prose-neutral dark:prose-invert mt-12 max-w-none">
              <MdxContent source={project.content} />
            </div>
          </FadeIn>
        )}

        {/* 相关项目 */}
        {related.length > 0 && (
          <FadeIn delay={0.24}>
            <div className="border-border/60 mt-20 border-t pt-12">
              <h2 className="text-2xl font-semibold tracking-tight">相关项目</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="group border-border/60 bg-card block rounded-2xl border p-6 transition-shadow hover:shadow-lg"
                  >
                    {p.coverImage ? (
                      <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                        <img src={p.coverImage} alt={p.title} className="size-full object-cover" />
                      </div>
                    ) : (
                      <div className="bg-muted mb-4 aspect-video rounded-xl" />
                    )}
                    <h3 className="font-medium">{p.title}</h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{p.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </Container>
    </article>
  );
}

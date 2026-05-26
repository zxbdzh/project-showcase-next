import type { Metadata } from "next";
import { Suspense } from "react";
import { after, connection } from "next/server";
import { Link as TransitionLink } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Skeleton } from "@/components/ui/skeleton";
import { GridBackdrop } from "@/components/terminal";
import {
  getProjectBySlug,
  incrementProjectViews,
  getRelatedProjects,
} from "@/features/projects/queries";
import { GalleryImage, GalleryProvider } from "@/components/gallery";
import { MdxContent } from "./mdx-content";
import { ProjectManifest } from "./project-manifest";
import { RelatedProjects } from "./related-projects";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // 构建期不连库:返回占位 param 满足 cacheComponents 要求;真实详情页运行期按需渲染。
  return [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "__none__") return { title: "项目详情" };
  const project = await getProjectBySlug(slug).catch(() => null);
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

export default function ProjectDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: Props) {
  await connection();
  const { slug } = await params;
  if (slug === "__none__") notFound();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // 响应后异步累加浏览量,不参与渲染
  after(() => incrementProjectViews(project.id));

  const related = await getRelatedProjects(project.category?.id ?? null, project.id);

  return (
    <GalleryProvider>
      <article className="relative isolate py-20 sm:py-28">
        {/* 工程图纸网格底纹 */}
        <GridBackdrop className="[mask-image:linear-gradient(to_bottom,black_0%,transparent_60%)] opacity-50" />

        <Container className="max-w-[980px]">
          {/* 返回链接(命令式) */}
          <FadeIn>
            <TransitionLink
              href="/projects"
              className="text-muted-foreground hover:text-brand mb-8 inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span className="select-none">cd</span>
              <span>../</span>
            </TransitionLink>
          </FadeIn>

          {/* 主标题(SEO 唯一 H1) + summary - 隐藏视觉,manifest 已覆盖核心信息 */}
          <h1 className="sr-only">{project.title}</h1>

          {/* Hero:项目 manifest 卡 */}
          <FadeIn>
            <ProjectManifest
              title={project.title}
              slug={project.slug}
              summary={project.summary}
              category={project.category}
              createdAt={project.createdAt}
              views={project.views}
              featured={project.featured}
              demoUrl={project.demoUrl}
              repoUrl={project.repoUrl}
              techStack={project.techStack}
              tags={project.tags}
            />
          </FadeIn>

          {/* 封面图:工程化 fig 注释 caption,点击进入幻灯片 */}
          {project.coverImage && (
            <FadeIn delay={0.1}>
              <figure className="mt-12">
                <div className="border-border/60 aspect-video overflow-hidden rounded-md border">
                  <GalleryImage
                    src={project.coverImage}
                    alt={project.title}
                    style={{ viewTransitionName: `project-cover-${slug}` }}
                    className="size-full object-cover"
                  />
                </div>
                <figcaption className="text-muted-foreground mt-3 font-mono text-xs">
                  <span className="text-brand select-none">{"// "}</span>
                  fig.1 — {project.title} 系统界面
                </figcaption>
              </figure>
            </FadeIn>
          )}

          {/* 正文:README 文件头 + MDX 内容 */}
          {project.content && (
            <FadeIn delay={0.14}>
              <section className="mt-16">
                {/* 文件头 banner */}
                <header className="border-border/60 bg-muted/40 flex items-center justify-between rounded-t-md border border-b-0 px-4 py-2.5">
                  <span className="text-muted-foreground inline-flex items-center gap-2 font-mono text-xs">
                    <FileText className="size-3.5" />
                    README.md
                  </span>
                  <span className="text-muted-foreground/70 font-mono text-[11px]">
                    preview · markdown
                  </span>
                </header>

                {/* 正文容器(底部圆角)。MDX 内部标题已自压制为 h2 视觉,避免双 H1 */}
                <div className="border-border/60 bg-card/40 rounded-b-md border px-6 py-10 sm:px-10 sm:py-12">
                  <MdxContent source={project.content} />
                </div>
              </section>
            </FadeIn>
          )}

          {/* 相关项目 */}
          <FadeIn delay={0.2}>
            <RelatedProjects items={related} />
          </FadeIn>
        </Container>
      </article>
    </GalleryProvider>
  );
}

function ProjectDetailSkeleton() {
  return (
    <article className="py-20 sm:py-28">
      <Container className="max-w-[980px]">
        <Skeleton className="h-4 w-20" />
        {/* manifest card 占位 */}
        <div className="mt-8 space-y-3">
          <Skeleton className="h-10 w-full rounded-t-lg" />
          <div className="space-y-2 px-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
        <Skeleton className="mt-12 aspect-video w-full rounded-md" />
        <div className="mt-16 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Container>
    </article>
  );
}

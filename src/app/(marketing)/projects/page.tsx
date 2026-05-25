import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { getProjectList } from "@/features/projects/queries";
import { getCategories } from "@/features/taxonomy/queries";
import { ProjectFilters } from "./project-filters";

export const metadata: Metadata = {
  title: "作品",
  description: "查看我的项目作品集,涵盖全栈开发、开源工具等领域。",
};

interface Props {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [data, categories] = await Promise.all([
    getProjectList({
      categorySlug: params.category,
      q: params.q,
      page,
    }),
    getCategories(),
  ]);

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">作品</h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg">我参与设计和开发的项目。</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-10">
            <ProjectFilters
              categories={categories}
              currentCategory={params.category}
              currentQ={params.q}
            />
          </div>
        </FadeIn>

        {data.items.length === 0 ? (
          <FadeIn delay={0.2}>
            <p className="text-muted-foreground mt-16 text-center">暂无符合条件的项目。</p>
          </FadeIn>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.06}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group border-border/60 bg-card block h-full rounded-2xl border p-6 transition-shadow hover:shadow-lg"
                >
                  {p.coverImage ? (
                    <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        style={{ viewTransitionName: `project-cover-${p.slug}` }}
                        className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted mb-4 aspect-video rounded-xl" />
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{p.title}</h3>
                    <ArrowUpRight className="text-muted-foreground group-hover:text-brand size-4 transition-colors" />
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{p.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.category && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {p.category.name}
                      </Badge>
                    )}
                    {p.techStack?.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="rounded-full text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}

        {/* 分页 */}
        {data.totalPages > 1 && (
          <FadeIn delay={0.2}>
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/projects?page=${p}${params.category ? `&category=${params.category}` : ""}${params.q ? `&q=${params.q}` : ""}`}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "border-border/60 hover:bg-muted border"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </FadeIn>
        )}
      </Container>
    </section>
  );
}

import Link from "next/link";
import { Container } from "./container";

const links = [
  { href: "https://github.com/zxbdzh", label: "GitHub", external: true },
  { href: "/projects", label: "作品" },
  { href: "/contact", label: "联系" },
];

export async function SiteFooter() {
  "use cache";
  const year = new Date().getFullYear();
  return (
    <footer className="border-border/60 text-muted-foreground border-t py-12 text-sm">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-mono text-xs">
          <span className="text-muted-foreground/60 select-none">{"// "}</span>© {year} zxb · built
          with Next.js
        </p>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}

import Link from "next/link";
import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer className="border-border/60 text-muted-foreground border-t py-12 text-sm">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p>© {new Date().getFullYear()} 名字. 用 Next.js 构建.</p>
        <div className="flex items-center gap-6">
          <Link href="https://github.com" className="hover:text-foreground transition-colors">
            GitHub
          </Link>
          <Link href="/projects" className="hover:text-foreground transition-colors">
            作品
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            联系
          </Link>
        </div>
      </Container>
    </footer>
  );
}

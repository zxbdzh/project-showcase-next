import Link from "next/link";
import { Container } from "./container";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { href: "/projects", label: "作品" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tight">
          名字<span className="text-brand">.dev</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/contact"
            className={buttonVariants({ size: "sm", className: "rounded-full px-4" })}
          >
            合作
          </Link>
        </div>
      </Container>
    </header>
  );
}

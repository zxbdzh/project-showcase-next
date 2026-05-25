import { Link } from "next-view-transitions";
import { Container } from "./container";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandMenuButton } from "@/components/command-palette";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const navItems = [
  { href: "/projects", label: "作品" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur-xl">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-mono text-base font-semibold tracking-tight">
          <span className="text-muted-foreground">~/</span>zxb
          <span className="text-brand"> $</span>
        </Link>
        <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <CommandMenuButton />
          <ThemeToggle />
          {session?.user ? (
            <Link
              href="/admin"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "rounded-full px-4",
              })}
            >
              后台
            </Link>
          ) : (
            <Link
              href="/contact"
              className={buttonVariants({ size: "sm", className: "rounded-full px-4" })}
            >
              合作
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}

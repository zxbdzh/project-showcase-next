"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  CornerDownLeft,
  Home,
  FolderGit2,
  User,
  Mail,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/terminal";
import { cn } from "@/lib/utils";

/** 唤起命令面板的全局事件名;header 按钮等可 dispatch 复用 */
export const OPEN_COMMAND_PALETTE = "open-command-palette";

type Command = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  keywords?: string[];
  perform: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // 全局 ⌘K / Ctrl+K 与自定义事件唤起
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_PALETTE, onOpen);
    };
  }, []);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      {
        id: "home",
        label: "首页",
        group: "导航",
        icon: Home,
        keywords: ["home", "index"],
        perform: go("/"),
      },
      {
        id: "projects",
        label: "作品",
        group: "导航",
        icon: FolderGit2,
        keywords: ["projects", "work"],
        perform: go("/projects"),
      },
      {
        id: "about",
        label: "关于",
        group: "导航",
        icon: User,
        keywords: ["about", "me"],
        perform: go("/about"),
      },
      {
        id: "contact",
        label: "联系",
        group: "导航",
        icon: Mail,
        keywords: ["contact", "email"],
        perform: go("/contact"),
      },
      {
        id: "theme-light",
        label: "亮色主题",
        group: "主题",
        icon: Sun,
        keywords: ["light", "theme"],
        perform: () => setTheme("light"),
      },
      {
        id: "theme-dark",
        label: "暗色主题",
        group: "主题",
        icon: Moon,
        keywords: ["dark", "theme"],
        perform: () => setTheme("dark"),
      },
      {
        id: "theme-system",
        label: "跟随系统",
        group: "主题",
        icon: Monitor,
        keywords: ["system", "auto", "theme"],
        perform: () => setTheme("system"),
      },
      {
        id: "github",
        label: "GitHub",
        group: "链接",
        icon: ExternalLink,
        keywords: ["github", "code", "zxbdzh"],
        perform: () => window.open("https://github.com/zxbdzh", "_blank", "noopener"),
      },
    ];
  }, [router, setTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords?.some((k) => k.includes(q))
    );
  }, [commands, query]);

  // query 变化时高亮归位(在 onChange 中重置,避免 effect 内 setState)
  const onQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const execute = useCallback((cmd: Command) => {
    setOpen(false);
    setQuery("");
    cmd.perform();
  }, []);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) execute(cmd);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-[12vh] max-w-[calc(100%-2rem)] translate-y-0 gap-0 overflow-hidden p-0 font-mono sm:max-w-lg"
      >
        <DialogTitle className="sr-only">命令面板</DialogTitle>

        {/* 搜索行 */}
        <div className="border-border flex items-center gap-2 border-b px-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="命令或搜索"
            placeholder="输入命令或搜索…"
            className="placeholder:text-muted-foreground/60 h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <Kbd>ESC</Kbd>
        </div>

        {/* 命令列表 */}
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              command not found: {query}
            </p>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              const showGroup = i === 0 || filtered[i - 1].group !== cmd.group;
              const active = i === activeIndex;
              return (
                <Fragment key={cmd.id}>
                  {showGroup && (
                    <p className="text-muted-foreground/70 px-2 pt-2 pb-1 text-xs select-none">
                      <span className="text-brand">{"// "}</span>
                      {cmd.group}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => execute(cmd)}
                    onMouseMove={() => setActiveIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                      active ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                  >
                    <Icon className="text-muted-foreground size-4 shrink-0" />
                    <span className="flex-1">{cmd.label}</span>
                    {active && <CornerDownLeft className="text-muted-foreground size-3.5" />}
                  </button>
                </Fragment>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

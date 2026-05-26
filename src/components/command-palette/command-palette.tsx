"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLenis } from "lenis/react";
import {
  Search,
  CornerDownLeft,
  Home,
  FolderGit2,
  User,
  Mail,
  Bot,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/terminal";
import { useScrollToProjectAi } from "@/components/shared/use-scroll-to-project-ai";
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
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // 选中的命令延后到面板关闭动画结束再执行(见 execute / onOpenChangeComplete)。
  const [pending, setPending] = useState<Command | null>(null);

  // 当前是否处于项目详情页:用于条件注册「问 AI 这个项目」快捷动作。
  const isProjectDetail =
    !!pathname && /^\/projects\/[^/]+$/.test(pathname) && !pathname.endsWith("/projects");

  // 详情页「问 AI 这个项目」:由 onOpenChangeComplete(Dialog 关闭后)触发,
  // 与 ProjectManifest 的 `$ ask --ai` 按钮共用同一份滚动+聚焦逻辑。
  const jumpToProjectAi = useScrollToProjectAi();

  // 平滑滚动到首页的 AI 分身模块(id="ai")。Lenis(root)接管了滚动,原生 hash
  // 跳转会被它拉回顶部,故必须用 lenis.scrollTo;无 Lenis(reduced-motion)时降级原生。
  // 不在首页则先 router.push("/"),再轮询等该模块挂载后滚动。
  // 注意:本函数由 onOpenChangeComplete 在面板关闭动画结束后调用,确保 Dialog 的
  // 滚动锁(modal overflow:hidden)已释放,否则会出现「已滚动但要等鼠标滚动才刷新」的卡顿。
  const jumpToAi = useCallback(() => {
    const scrollToAi = () => {
      const el = document.getElementById("ai");
      if (!el) return false;
      if (lenis) {
        // 跨页导航后 Lenis 缓存的可滚动高度(limit)仍是旧页面的值,直接 scrollTo
        // 会被旧 limit 夹住而滚不到底部模块;先同步 resize() 重新测量。
        lenis.resize();
        lenis.scrollTo(el, { offset: -72 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return true;
    };
    if (window.location.pathname === "/") {
      scrollToAi();
      return;
    }
    // scroll:false 阻止 Next 导航后自动回顶(否则会盖掉我们的 lenis.scrollTo,表现为「只回了首页」)。
    // 轮询等 #ai 挂载后滚动一次即停;再延时校正一次,纠正图片等晚加载导致的位移(避免多次 scrollTo 互相打架的卡顿)。
    router.push("/", { scroll: false });
    let tries = 0;
    const timer = window.setInterval(() => {
      if (scrollToAi()) {
        window.clearInterval(timer);
        window.setTimeout(scrollToAi, 400);
      } else if (++tries > 60) {
        window.clearInterval(timer);
      }
    }, 50);
  }, [lenis, router]);

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
    const list: Command[] = [];
    // 详情页专属动作置顶,落在「上下文」分组,优先级最高。
    if (isProjectDetail) {
      list.push({
        id: "ask-this-project",
        label: "问 AI 这个项目",
        group: "上下文",
        icon: MessageSquare,
        keywords: ["ask", "project", "ai", "本项目", "问", "细节"],
        perform: jumpToProjectAi,
      });
    }
    list.push(
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
        id: "ai-clone",
        label: "AI 分身",
        group: "导航",
        icon: Bot,
        keywords: ["ai", "分身", "chat", "assistant", "问问", "对话"],
        perform: jumpToAi,
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
      }
    );
    return list;
  }, [router, setTheme, jumpToAi, isProjectDetail, jumpToProjectAi]);

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

  // 先关面板、把命令存入 pending,等关闭动画结束(onOpenChangeComplete)再执行。
  // 否则命令(尤其 lenis.scrollTo)会在 Dialog 滚动锁未释放时跑,导致跳转卡顿。
  const execute = useCallback((cmd: Command) => {
    setPending(cmd);
    setOpen(false);
    setQuery("");
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
      onOpenChangeComplete={(o) => {
        // 关闭动画完全结束(滚动锁已释放)后再跑选中的命令,见 execute 注释。
        if (!o && pending) {
          pending.perform();
          setPending(null);
        }
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

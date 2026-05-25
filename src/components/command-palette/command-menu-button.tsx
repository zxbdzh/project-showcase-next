"use client";

import { Search } from "lucide-react";
import { Kbd } from "@/components/terminal";
import { OPEN_COMMAND_PALETTE } from "./command-palette";

/** header 内的命令面板触发器;通过全局事件唤起,无需共享状态 */
export function CommandMenuButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE))}
      aria-label="打开命令面板"
      className="text-muted-foreground hover:text-foreground hover:border-border border-border/0 inline-flex h-8 items-center gap-2 rounded-md border px-2 transition-colors"
    >
      <Search className="size-4" />
      <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
    </button>
  );
}

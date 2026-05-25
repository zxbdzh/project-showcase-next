"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// 跟随系统 → 亮色 → 暗色 → 跟随系统
const order = ["system", "light", "dark"] as const;
const meta = {
  system: { Icon: Monitor, label: "主题:跟随系统(点击切到亮色)" },
  light: { Icon: Sun, label: "主题:亮色(点击切到暗色)" },
  dark: { Icon: Moon, label: "主题:暗色(点击切到跟随系统)" },
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current = (mounted && theme && theme in meta ? theme : "system") as keyof typeof meta;
  const { Icon, label } = meta[current];

  function cycle() {
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTheme(next);
  }

  return (
    <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={cycle}>
      {mounted ? <Icon className="size-5" /> : <Monitor className="size-5" />}
    </Button>
  );
}

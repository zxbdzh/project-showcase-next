"use client";

import * as icons from "simple-icons";
import { Mail, Globe, Send, MessageCircle } from "lucide-react";

const simpleIconsMap: Record<string, { path: string; hex: string }> = {
  siOpenjdk: icons.siOpenjdk,
  siTypescript: icons.siTypescript,
  siPython: icons.siPython,
  siSharp: icons.siSharp,
  siSpringboot: icons.siSpringboot,
  siNodedotjs: icons.siNodedotjs,
  siFastapi: icons.siFastapi,
  siReact: icons.siReact,
  siVuedotjs: icons.siVuedotjs,
  siNextdotjs: icons.siNextdotjs,
  siWechat: icons.siWechat,
  siTailwindcss: icons.siTailwindcss,
  siMysql: icons.siMysql,
  siPostgresql: icons.siPostgresql,
  siRedis: icons.siRedis,
  siDrizzle: icons.siDrizzle,
  siElectron: icons.siElectron,
  siDocker: icons.siDocker,
  siGit: icons.siGit,
  siVitest: icons.siVitest,
  siUnity: icons.siUnity,
};

const techColors: Record<string, string> = {
  siOpenjdk: "#007396",
  siTypescript: "#3178C6",
  siPython: "#3776AB",
  siSharp: "#512BD4",
  siSpringboot: "#6DB33F",
  siNodedotjs: "#339933",
  siFastapi: "#009688",
  siReact: "#61DAFB",
  siVuedotjs: "#4FC08D",
  siNextdotjs: "",
  siWechat: "#07C160",
  siTailwindcss: "#06B6D4",
  siMysql: "#4479A1",
  siPostgresql: "#4169E1",
  siRedis: "#DC382D",
  siDrizzle: "#C5F74F",
  siElectron: "#47848F",
  siDocker: "#2496ED",
  siGit: "#F05032",
  siVitest: "#6E9F18",
  siUnity: "",
};

export function TechIcon({ icon, className = "size-4" }: { icon: string; className?: string }) {
  if (!icon) return null;

  if (icon.startsWith("si")) {
    const si = simpleIconsMap[icon];
    if (!si) return null;
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill="currentColor"
      >
        <path d={si.path} />
      </svg>
    );
  }

  return null;
}

export function TechIconColor({
  icon,
  className = "size-4",
}: {
  icon: string;
  className?: string;
}) {
  if (!icon) return null;

  if (icon.startsWith("si")) {
    const si = simpleIconsMap[icon];
    if (!si) return null;
    const color = techColors[icon] || `#${si.hex}`;
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill={color}
      >
        <path d={si.path} />
      </svg>
    );
  }

  return null;
}

const platformLucideMap: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  website: Globe,
  telegram: Send,
  wechat: MessageCircle,
};

const platformSimpleIconsMap: Record<string, { path: string; hex: string }> = {
  github: icons.siGithub,
  twitter: icons.siX,
  discord: icons.siDiscord,
};

const platformColors: Record<string, string> = {
  discord: "#5865F2",
};

// 近黑的单色品牌(GitHub、X)在暗色模式下不可见,改用 currentColor 跟随主题前景色。
const monochromePlatforms = new Set(["github", "twitter"]);

export function SocialIcon({
  platform,
  className = "size-4",
}: {
  platform: string;
  className?: string;
}) {
  const key = platform.toLowerCase();

  const siData = platformSimpleIconsMap[key];
  if (siData) {
    const color = monochromePlatforms.has(key)
      ? "currentColor"
      : platformColors[key] || `#${siData.hex}`;
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        fill={color}
      >
        <path d={siData.path} />
      </svg>
    );
  }

  const LucideIcon = platformLucideMap[key];
  if (LucideIcon) {
    return <LucideIcon className={className} />;
  }

  return <Globe className={className} />;
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";
import { ViewTransitions } from "next-view-transitions";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 母题等宽字体:命令提示符 / 标签 / 数字 / 代码块 / 终端组件
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// 中文正文与标题;CJK 体积大,不预加载,交由 fallback 兜底避免阻塞
const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "zxb · Java 全栈开发者",
    template: "%s · zxb",
  },
  description:
    "zxb 的作品集 —— Java 为主的全栈开发者,Spring Boot 后端、TypeScript 前端,覆盖 Web 全栈、跨端小程序与桌面应用,端到端类型安全。",
  authors: [{ name: "zxb", url: "https://github.com/zxbdzh" }],
  creator: "zxb",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "zxb · 作品集",
    title: "zxb · Java 全栈开发者",
    description: "Java 全栈 · 跨端 · 桌面端 · AI 应用 —— 端到端类型安全的作品集。",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="zh-CN"
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} h-full`}
      >
        <body className="flex min-h-full flex-col antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SmoothScroll>{children}</SmoothScroll>
            <CommandPalette />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}

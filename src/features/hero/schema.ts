import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().min(1, "必填").max(40),
  href: z.string().min(1, "必填").max(200),
});

const commandSchema = z.object({
  name: z
    .string()
    .min(1, "必填")
    .max(24)
    .regex(/^[a-z][a-z0-9-]*$/, "仅小写字母 / 数字 / 连字符,且以字母开头")
    .refine((v) => v !== "help" && v !== "clear", "help / clear 为内置命令,不可使用"),
  desc: z.string().max(40),
  output: z.string().max(2000),
});

/** 首页 Hero 配置:开机序列输出 + 交互终端各命令输出。正文用 *星号* 标高亮。 */
export const heroConfigSchema = z.object({
  intro: z.object({
    greeting: z.string().max(200),
    lines: z.array(z.string().max(200)).max(8),
    status: z.string().max(200),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
  }),
  terminal: z.object({
    commands: z.array(commandSchema).max(12),
  }),
});

export type HeroConfig = z.infer<typeof heroConfigSchema>;
export type HeroCommand = HeroConfig["terminal"]["commands"][number];

/** 把 DB 里存的 jsonb 值收敛为合法配置;为空 / 不合法时回退默认值。 */
export function coerceHeroConfig(value: unknown): HeroConfig {
  const parsed = heroConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_HERO;
}

/** DB 为空时的回退,逐字取自改造前的 hero-intro / hero-terminal,保证零视觉回归。 */
export const DEFAULT_HERO: HeroConfig = {
  intro: {
    greeting: "你好,我叫 *zxb*。",
    lines: [
      "我是一名 *Java 为主的全栈开发者*。",
      "主力用 *Java / Spring Boot* 做后端,",
      "也能用 *TypeScript / React* 独立扛起前端。",
      "把 Web、小程序到桌面端的复杂需求,收敛成*会上线的产品*。",
    ],
    status: "可参与合作 · Java 全栈 / 跨端 / AI 应用",
    primaryCta: { label: "查看作品", href: "/projects" },
    secondaryCta: { label: "联系我", href: "/contact" },
  },
  terminal: {
    commands: [
      {
        name: "whoami",
        desc: "简介",
        output:
          "Java 全栈开发者 · 端到端类型安全\n*Java / TypeScript / Python*\nSpring Boot 后端 · Web 全栈 · 跨端 · 桌面端\n提示: 输入 help 查看可用命令",
      },
      {
        name: "skills",
        desc: "技术栈",
        output:
          "*Java Spring Boot TypeScript React Next.js Drizzle uni-app Electron FastAPI Docker*",
      },
      {
        name: "projects",
        desc: "精选作品",
        output:
          "10+ 已上线项目,精选:\n  · WordMiniApp     uni-app + Spring Boot 全栈背单词\n  · clip-tool-next  Electron + FastAPI 直播切片工具\n  · moyu            Electron + Three.js 桌面应用\n查看全部 → /projects",
      },
      {
        name: "about",
        desc: "关于我",
        output:
          "习惯把复杂需求收敛成简洁、可上线、可维护的产品,把测试 / CI / Docker / 类型安全当工程底线。了解更多 → /about",
      },
      {
        name: "contact",
        desc: "联系方式",
        output:
          "GitHub   https://github.com/zxbdzh\n合作 · 全职 · 技术交流均欢迎\n联系我 → /contact",
      },
    ],
  },
};

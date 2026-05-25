# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

全栈作品集 + CMS 后台。对标老项目 `project-showcase` 的业务,但 **UI / 架构 / 技术栈完全重做**,目标是**展示技术力**:端到端类型安全、SSR/PPR 性能、含 **滚动叙事 + 交互式终端 Hero** 与 **流式 AI** 两个亮点 feature。

完整方案见已批准的 plan 与 `docs/ROADMAP.md`。

## 当前状态

- ✅ **Wave 0–2 已完成**:脚手架、设计系统(Tailwind v4 主题 + shadcn/ui + 明暗模式 + Lenis + Motion 动画封装 + 前台/后台布局)、鉴权(Auth.js v5 + GitHub OAuth + RBAC,`/admin` 路由保护)、前台展示(项目列表/详情/MDX/浏览量、关于、联系、SEO)、流式 AI(GLM `streamObject` 标签生成)。
- 🚧 **待办**:Wave 3 后台 CMS(`/admin` 目前仅占位页)、Wave 4 部署与打磨。
- ⚠️ **R2 存储未落地**:`src/env.ts` 已声明 R2 变量,但尚无 S3 客户端 / 预签名代码(`@aws-sdk` 未安装),实现时需补齐。
- 进度与并行波次、依赖关系**以 `docs/ROADMAP.md` 为准**,任务详情见 `docs/tasks/`。开工前先读 ROADMAP 选未完成且依赖已满足的任务。

## 命令

- `pnpm dev` — 开发服务器(Turbopack)
- `pnpm build` — 生产构建(Turbopack)
- `pnpm start` — 运行构建产物
- `pnpm lint` — ESLint
- `pnpm format` — Prettier 格式化
- `pnpm format:check` — 检查格式
- `pnpm typecheck` — TypeScript 类型检查
- `pnpm test` — 单元测试(Vitest)
- `pnpm test:ui` — 测试 UI
- `pnpm test:coverage` — 测试覆盖率
- `pnpm e2e` — E2E 测试(Playwright)
- `pnpm e2e:ui` — E2E 测试 UI
- `pnpm db:generate` — 生成数据库迁移
- `pnpm db:migrate` — 运行数据库迁移
- `pnpm db:push` — 推送数据库 schema
- `pnpm db:seed` — 填充示例数据

## 技术栈

| 层        | 选型                                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 框架      | Next.js 16(App Router / RSC / Server Actions / `cacheComponents` PPR / Turbopack)、React 19                                                               |
| 语言      | TypeScript strict                                                                                                                                         |
| 环境变量  | `@t3-oss/env-nextjs` + Zod(server/client 分离,见 `src/env.ts`)                                                                                            |
| UI        | Tailwind v4 + shadcn/ui(基于 `@base-ui/react`)+ Motion(`motion/react`,原 Framer Motion)+ Lenis(平滑滚动)+ `lucide-react` / `simple-icons` + `next-themes` |
| 数据库    | Neon(Serverless Postgres)+ Drizzle ORM + drizzle-kit                                                                                                      |
| 鉴权      | Auth.js v5(`next-auth@beta`)+ `@auth/drizzle-adapter` + GitHub OAuth + JWT/RBAC                                                                           |
| 校验/表单 | Zod + React Hook Form                                                                                                                                     |
| 存储      | Cloudflare R2(S3 兼容)+ 服务端预签名 — **规划中,尚未实现**(env 已配)                                                                                      |
| AI        | Vercel AI SDK(`ai` + `@ai-sdk/openai` 经 `createOpenAI` 指向 GLM 兼容端点),流式;模型 `glm-4-flash`,env 用 `OPENAI_API_KEY` / `OPENAI_BASE_URL`            |
| 测试      | Vitest + Testing Library + Playwright                                                                                                                     |

## 设计基调(终端 / 工程美学)

母题是**命令行 / 工程师工作台**:等宽字体、命令提示符、注释体标题、终端窗口、暖灰 stone 中性阶 + **琥珀 amber 信号色**。冷峻、克制、有工程纪律感,明暗双模式(暗色为主场)。完整规范见 [`docs/design-system.md`](docs/design-system.md),**所有 UI 必须遵循**;母题组件在 `src/components/terminal/`。

- 信号色 `--brand`(琥珀)**只**用于 CTA / 链接 / 光标 / 关键高亮;方角(`--radius` 0.25rem,禁胶囊与大圆角);中性用暖灰 stone。
- 缓动统一 `cubic-bezier(0.16,1,0.3,1)`(`src/lib/motion.ts` 的 `EASE_OUT_EXPO`);滚动入场 `opacity + translateY`;`sticky` pinned 叙事段;Lenis 平滑惯性滚动;Hero 为**滚动叙事 + 交互式终端**(`src/components/shared/hero-intro.tsx`、`hero-terminal.tsx`)。
- 工程纪律:仅用 `transform`/`opacity`;**禁无限循环发光 / 呼吸 / 脉冲**;严格尊重 `prefers-reduced-motion`;移动端降级。
- 不对标 apple.com,也不沿用老项目的霓虹极客 / 矩阵雨 / 故障文字风格。

## 架构与约定(重要)

- **App Router + RSC**:默认 Server Component;仅交互组件加 `'use client'`。
- **写操作 = Server Action**:`'use server'` + Zod 校验入参 + 会话/角色鉴权 + `revalidatePath/revalidateTag`。**禁止在客户端直接写库**。
- **读操作 = RSC 内直接调** `features/<domain>/queries.ts`(Drizzle);不为读多建 API route。
- **端到端类型安全**:DB 类型用 Drizzle `$inferSelect` / `$inferInsert`,经 Zod schema,再到前端 props——全程不手写重复类型(这是老项目类型漂移问题的根治)。
- **目录 feature-based**:`features/<domain>/{actions,queries,schema,components}`;跨域共享 UI 放 `components/`。
- **环境变量**:统一经 `src/env.ts`,区分 server / client。

### 关键路径速查

- 路由用 **route groups**:`src/app/(marketing)/*`(前台)、`src/app/(admin)/admin/*`(后台,中间件保护)、`src/app/api/*`(AI / Auth / OG)。
- DB schema 按表拆文件于 `src/db/schema/*`,经 `schema/index.ts` 汇总导出;关系集中在 `relations.ts`;`db` 客户端在 `src/db/index.ts`。
- 鉴权:服务端用 `import { auth } from "@/lib/auth"`;`/admin/*` 由 `src/middleware.ts` 拦截;角色在 `session.user.role`(`"admin" | "user"`,JWT 注入),Server Action 内做角色判断。
- AI:`src/lib/ai.ts` 导出 `glm` 客户端与 `GLM_MODEL`;流式接口在 `src/app/api/ai/tags/route.ts`。

## 安全(老项目的硬伤,务必避免重蹈)

- 密钥(`DATABASE_URL`、R2、GLM、`AUTH_SECRET`)**只在服务端**;客户端只能读 `NEXT_PUBLIC_*`。
- `.env` 不提交(已在 `.gitignore`,仅维护 `.env.example`)。
- 每个 Server Action 入口都做 **Zod 校验 + 会话/角色鉴权**。

## 本项目相关 Skills(命中场景时主动调用)

| 场景                                | Skill                         |
| ----------------------------------- | ----------------------------- |
| 写 / 审查 React、Next.js 代码与性能 | `vercel-react-best-practices` |
| UI / 组件设计与实现                 | `ui-ux-pro-max`               |
| UI 代码审查 / 可访问性              | `web-design-guidelines`       |
| 本地启动并测试 Web 功能             | `webapp-testing`              |
| 审查改动找 bug                      | `code-review`                 |
| 安全审查(密钥 / Server Action)      | `security-review`             |
| 验证某改动是否真的生效              | `verify`                      |

## 协作约定

- **中文**沟通。
- Git 提交:`type(模块): 描述`(中文,如 `feat(db): 新增项目表 schema`),**禁止任何署名**;仅在阶段测试通过后提交。
- 开工前读 `docs/ROADMAP.md`,选取**未完成、依赖已满足**的任务;开工把任务文档状态改「进行中」,完成改「已完成」。

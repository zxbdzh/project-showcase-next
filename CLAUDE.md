# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

全栈作品集 + CMS 后台。对标老项目 `project-showcase` 的业务,但 **UI / 架构 / 技术栈完全重做**,目标是**展示技术力**:端到端类型安全、SSR/PPR 性能、含 **3D Hero** 与 **流式 AI** 两个亮点 feature。

完整方案见已批准的 plan 与 `docs/ROADMAP.md`。

## 当前状态

- ✅ **阶段 0 脚手架已完成**:Next.js 16 + React 19 + Tailwind v4 + TS 6(strict),生产构建通过,git 已初始化(`main`)。
- 其余工作拆成**可并行任务**,详见 `docs/tasks/`,并行波次与依赖见 `docs/ROADMAP.md`。

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

| 层        | 选型                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| 框架      | Next.js 16(App Router / RSC / Server Actions / `cacheComponents` PPR / Turbopack)、React 19 |
| 语言      | TypeScript strict                                                                           |
| 环境变量  | `@t3-oss/env-nextjs` + Zod(server/client 分离)                                              |
| UI        | Tailwind v4 + shadcn/ui + Framer Motion + Lenis(平滑滚动)+ `lucide-react` + `next-themes`   |
| 3D        | `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`                  |
| 数据库    | Neon(Serverless Postgres)+ Drizzle ORM + drizzle-kit                                        |
| 鉴权      | Auth.js v5(`next-auth@beta`)+ `@auth/drizzle-adapter` + GitHub OAuth + RBAC                 |
| 校验/表单 | Zod + React Hook Form                                                                       |
| 存储      | Cloudflare R2(S3 兼容)+ 服务端预签名                                                        |
| AI        | Vercel AI SDK(`ai` + `@ai-sdk/openai` 指向 GLM 兼容端点),流式                               |
| 测试      | Vitest + Testing Library + Playwright                                                       |

## 设计基调(Apple 风)

对标 **apple.com**:极简留白、超大紧字距标题、克制中性配色(白 / `#f5f5f7` / 纯黑沉浸段)、沉浸式分段叙事。**核心是精致的滚动驱动交互与动画**,明暗双模式。完整规范见 [`docs/design-system.md`](docs/design-system.md),**所有 UI 必须遵循**。

- 缓动统一 `cubic-bezier(0.16,1,0.3,1)`;滚动入场 `opacity + translateY`;`sticky` pinned 叙事段;Lenis 平滑惯性滚动;3D Hero 随滚动驱动(drei `ScrollControls`)。
- 工程纪律:仅用 `transform`/`opacity`;严格尊重 `prefers-reduced-motion`;移动端降级。
- 不沿用老项目的极客暗黑 / 矩阵雨 / 故障文字风格。

## 架构与约定(重要)

- **App Router + RSC**:默认 Server Component;仅交互组件加 `'use client'`。
- **写操作 = Server Action**:`'use server'` + Zod 校验入参 + 会话/角色鉴权 + `revalidatePath/revalidateTag`。**禁止在客户端直接写库**。
- **读操作 = RSC 内直接调** `features/<domain>/queries.ts`(Drizzle);不为读多建 API route。
- **端到端类型安全**:DB 类型用 Drizzle `$inferSelect` / `$inferInsert`,经 Zod schema,再到前端 props——全程不手写重复类型(这是老项目类型漂移问题的根治)。
- **目录 feature-based**:`features/<domain>/{actions,queries,schema,components}`;跨域共享 UI 放 `components/`。
- **环境变量**:统一经 `src/env.ts`,区分 server / client。

## 安全(老项目的硬伤,务必避免重蹈)

- 密钥(`DATABASE_URL`、R2、GLM、`AUTH_SECRET`)**只在服务端**;客户端只能读 `NEXT_PUBLIC_*`。
- `.env` 不提交(已在 `.gitignore`,仅维护 `.env.example`)。
- 每个 Server Action 入口都做 **Zod 校验 + 会话/角色鉴权**。

## 本项目相关 Skills(命中场景时主动调用)

| 场景                                | Skill                                              |
| ----------------------------------- | -------------------------------------------------- |
| 写 / 审查 R3F、Three.js 3D 代码     | `r3f-best-practices`、`threejs-graphics-optimizer` |
| 写 / 审查 React、Next.js 代码与性能 | `vercel-react-best-practices`                      |
| UI / 组件设计与实现                 | `ui-ux-pro-max`                                    |
| UI 代码审查 / 可访问性              | `web-design-guidelines`                            |
| 本地启动并测试 Web 功能             | `webapp-testing`                                   |
| 审查改动找 bug                      | `code-review`                                      |
| 安全审查(密钥 / Server Action)      | `security-review`                                  |
| 验证某改动是否真的生效              | `verify`                                           |

## 协作约定

- **中文**沟通。
- Git 提交:`type(模块): 描述`(中文,如 `feat(db): 新增项目表 schema`),**禁止任何署名**;仅在阶段测试通过后提交。
- 开工前读 `docs/ROADMAP.md`,选取**未完成、依赖已满足**的任务;开工把任务文档状态改「进行中」,完成改「已完成」。

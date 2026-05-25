# 实施路线图(ROADMAP)

本项目按「**先打通垂直切片、再横向铺开**」推进。下列任务大多可**并行**,按波次组织;每个任务详情见 `docs/tasks/`。

## 已完成

- **Wave 0 · 脚手架**:Next.js 16 + React 19 + Tailwind v4 + TS 6(strict),生产构建通过,git 初始化(`main`)。
- **Wave 1 · 02 设计系统**:Tailwind v4 主题 + shadcn/ui 16组件 + 明暗主题 + Lenis平滑滚动 + Framer Motion动画封装 + 前台/后台布局骨架。
- **Wave 2 · 03 3D Hero**:R3F + drei `ScrollControls` 滚动驱动玻璃折射几何体,移动端降级 + `prefers-reduced-motion` 静态回退。
- **Wave 2 · 04 鉴权**:Auth.js v5 + Drizzle adapter + GitHub OAuth + JWT RBAC,`/admin` 路由保护 + 登录页。
- **Wave 2 · 06 前台展示**:项目列表/详情(筛选/搜索/MDX/浏览量)、关于页(技能进度条)、联系页(Server Action)、SEO(`generateMetadata` + OG image + sitemap + robots)。
- **Wave 2 · 07 流式 AI**:Vercel AI SDK + GLM 端点 + `streamObject` 结构化标签生成 API。
- **重做 · 终端美学升级(2026-05)**:UI / 架构从 Apple 风全面重做为**终端 / 工程美学** —— 暖橙琥珀 + 暖灰 stone + JetBrains Mono 设计系统、⌘K 命令面板、`next-view-transitions` 跨页转场 + 项目封面共享元素、全量 PPR(`cacheComponents` + `'use cache'`)、AI 对话分身(`/api/ai/chat`)。3D Hero 已由交互式终端 + 滚动叙事替代。

## 并行波次

### Wave 1 — 脚手架后立即并行(相互无依赖)

- [01 数据层](tasks/01-data-layer.md) — Drizzle schema + 迁移 + seed(**多数任务的基础,建议最先**)
- [02 设计系统](tasks/02-design-system.md) — Tailwind 主题、shadcn、暗色模式、布局骨架
- [08 工程化 / CI](tasks/08-engineering-ci.md) — Prettier/Husky/lint-staged/commitlint、Vitest/Playwright、`env.ts`、GitHub Actions

### Wave 2 — 依赖 Wave 1

- [03 3D Hero](tasks/03-3d-hero.md) — 依赖 **02** ✅
- [04 鉴权](tasks/04-auth.md) — 依赖 **01** ✅
- [06 前台展示](tasks/06-public-site.md) — 依赖 **01 + 02** ✅
- [07 流式 AI](tasks/07-ai-streaming.md) — 依赖 **01**(`lib/ai.ts` 可先独立) ✅

### Wave 3 — 依赖 Wave 2

- [05 后台 CMS](tasks/05-admin-cms.md) — 依赖 **01 + 04**(+02)
- 07 的「后台集成」部分 — 依赖 **05**

### Wave 4 — 收尾

- [09 部署与打磨](tasks/09-deploy.md) — 依赖大部分;Vercel、Lighthouse、Sentry、E2E、README

## 依赖图

```
脚手架 ─┬─ 01 数据层 ───┬─ 04 鉴权 ───────┐
        │               ├─ 06 前台        │
        │               └─ 07 AI(lib)    ├─ 05 后台 CMS ─ 09 部署/打磨
        ├─ 02 设计系统 ─┬─ 03 3D Hero      │
        │               └─ 06 前台         │
        └─ 08 工程化/CI ──────────────────┘
```

## 认领与协作约定

- 选**未完成、依赖已满足**的任务;开工把任务文档状态改「进行中」,完成改「已完成」。
- 跨任务共享类型放 `src/db/schema` 与 `features/<domain>/schema.ts`,**避免重复定义**。
- 每个任务完成需满足其「验收标准」,并通过 `pnpm build` + 相关测试后再提交。
- 提交规范见 `CLAUDE.md`(`type(模块): 描述`,中文,禁署名)。

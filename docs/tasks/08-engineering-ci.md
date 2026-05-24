# 任务 08 · 工程化与 CI

- **状态**:待开始
- **波次**:Wave 1
- **依赖**:仅脚手架
- **可与之并行**:01 数据层、02 设计系统

## 目标

建立质量与测试底座、类型安全的环境变量、自动化 CI,让后续所有任务都在受保护的工程基线上开发。

## 交付物(checklist)

- [ ] **格式化**:Prettier + `prettier-plugin-tailwindcss`,`format` 脚本
- [ ] **Git 钩子**:Husky + lint-staged(pre-commit 跑 lint/format)+ commitlint(自定义中文 `type(模块): 描述` 规范,见 `CLAUDE.md`)
- [ ] **类型检查**:`typecheck` 脚本(`tsc --noEmit`)
- [ ] **环境变量**:`@t3-oss/env-nextjs` 的 `src/env.ts`(server/client 分离 + Zod 校验),`.env.example`(占位,不含真实值)
- [ ] **单元测试**:Vitest + `@testing-library/react` + jsdom,配置 + 1 个示例测试
- [ ] **E2E**:Playwright 配置 + `tests/e2e/` 1 个冒烟用例(首页可访问)
- [ ] **CI**:GitHub Actions —— install → lint → typecheck → test → build
- [ ] `package.json` 脚本补全:`format` / `typecheck` / `test` / `e2e`

## 技术要点

- `env.ts`:缺失/非法环境变量时**构建即失败**(替代老项目运行时才报错)。客户端变量必须 `NEXT_PUBLIC_` 前缀。
- commitlint 用 `type-enum` 限定 `feat|fix|chore|refactor|docs|test|style|perf`,scope 自由。
- CI 用 pnpm + cache;`pnpm install --frozen-lockfile`。
- 完成后回到 `CLAUDE.md` 的「命令」一节补上新增脚本。

## 相关 Skills

- `update-config`(如需配置 `.claude/settings.json` 权限/钩子)
- `code-review`

## 验收标准

- 本地 `pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全通过。
- 故意写错提交信息会被 commitlint 拦截。
- 删掉一个必需环境变量后 `pnpm build` 报错(env 校验生效)。
- 推送后 GitHub Actions 全绿。

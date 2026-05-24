# 任务 04 · 鉴权与 RBAC(Auth.js v5)

- **状态**:待开始
- **波次**:Wave 2
- **依赖**:01 数据层(`users` / `accounts` / `sessions` 表)
- **可与之并行**:03 3D Hero、06 前台、07 AI
- **是后续基础**:05 后台 CMS 依赖本任务保护

## 目标

用 Auth.js v5 + Drizzle adapter + GitHub OAuth 实现登录与会话,基于 `role` 做 RBAC,保护整个 `/admin`。

## 交付物(checklist)

- [ ] 安装 `next-auth@beta` `@auth/drizzle-adapter`
- [ ] `src/lib/auth.ts`:`NextAuth({...})` 导出 `handlers` / `auth` / `signIn` / `signOut`
  - [ ] DrizzleAdapter 接入任务 01 的 auth 表
  - [ ] GitHub provider
  - [ ] `session` / `jwt` callback 注入 `user.role`
- [ ] `app/api/auth/[...nextauth]/route.ts`
- [ ] `app/(admin)/admin/layout.tsx` 内 `auth()` 校验:未登录 → 登录页;`role !== 'admin'` → 拒绝/首页
- [ ] 登录页 / 登录按钮 + 用户菜单(登出)
- [ ] (可选)`middleware.ts` 做边缘层快速拦截

## 技术要点

- 环境变量:`AUTH_SECRET`、`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET`(全部服务端,经 `env.ts`)。
- 首位管理员:seed 时把指定邮箱的 `users.role` 设为 `admin`,或提供一次性提升脚本。
- 服务端统一用 `auth()` 读会话;Server Action 内复用做鉴权。

## 相关 Skills

- `security-review`(鉴权边界 / 会话 / 密钥)

## 验收标准

- GitHub 登录成功,会话含 `role`。
- 非 admin 访问 `/admin/*` 被拒;admin 正常进入。
- 密钥不出现在客户端 bundle。

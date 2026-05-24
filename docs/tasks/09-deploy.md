# 任务 09 · 部署与打磨

- **状态**:待开始
- **波次**:Wave 4(收尾)
- **依赖**:01–08 大部分完成

## 目标

上线到 Vercel,接入可观测,性能 / SEO 冲分,E2E 覆盖关键流程,完善项目文档,让作品集真正「可访问、可展示、可被评审」。

## 交付物(checklist)

- [ ] **Vercel**:连接仓库 + 配置环境变量(`DATABASE_URL`、`AUTH_*`、`R2_*`、`GLM_*`)+ 生产域名
- [ ] **生产数据**:Neon 生产分支 + R2 生产 bucket(与开发隔离)
- [ ] **可观测**:Sentry(错误)+ `@vercel/analytics` + `@vercel/speed-insights`
- [ ] **性能冲分**:`next/image`、字体优化、bundle 分析、缓存头;目标 Lighthouse 四项接近满分
- [ ] **E2E**:Playwright 覆盖关键链路 —— GitHub 登录 → 后台创建并发布项目 → 前台可见
- [ ] **文档**:`README`(简介、技术栈、架构图、亮点说明、本地启动、截图/GIF)+ `docs/` 架构说明

## 技术要点

- Vercel 预览部署用于每次 PR 验收;生产环境变量与开发分离。
- 上线后核对:动态 OG image、`cacheComponents`(PPR)线上行为、sitemap/robots。
- 部署前过一遍安全清单:确认无任何密钥进入客户端 bundle。

## 相关 Skills

- `performance`(加载与运行时优化)
- `verify`(上线后端到端验证真实行为)
- `security-review`、`code-review`(发布前审查)

## 验收标准

- 线上地址可正常访问,核心功能可用。
- Lighthouse Performance / Accessibility / Best Practices / SEO 接近满分。
- 关键流程 E2E 全绿;README 完整、含可视化展示。

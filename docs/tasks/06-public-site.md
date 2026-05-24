# 任务 06 · 前台展示与 SEO

- **状态**:待开始
- **波次**:Wave 2
- **依赖**:01 数据层、02 设计系统
- **可与之并行**:03 3D Hero、04 鉴权、07 AI
- **协作**:首页集成任务 03 的 Hero

## 目标

实现前台所有公开页面(RSC 取数 + PPR/streaming),完成项目筛选/搜索、MDX 详情、技能/社交展示,以及完整 SEO。

## 交付物(checklist)

- [ ] 首页 `app/(marketing)/page.tsx`:集成 3D Hero + 精选项目 + 技能概览
- [ ] 项目列表 `projects/`:按分类/标签**筛选**、关键词**搜索**、分页 —— 全部走 URL `searchParams`(可分享、SSR 友好)
- [ ] 项目详情 `projects/[slug]/`:MDX 渲染(`next-mdx-remote`)、浏览量 +1、相关项目
- [ ] 关于页:技能(可做能力雷达/进度)、个人简介
- [ ] 联系页:表单(Server Action 提交)+ 社交链接
- [ ] **SEO**:`generateMetadata`(标题/描述/canonical)、动态 OG image(`app/api/og/route.tsx`)、`app/sitemap.ts`、`app/robots.ts`
- [ ] **性能**:`next.config` 开 `cacheComponents`(PPR);静态外壳 + 动态数据用 `<Suspense>` streaming

## 技术要点

- 读数据在 RSC 直接调 `features/<domain>/queries.ts`,不经客户端。
- 筛选状态存 URL,服务端据 `searchParams` 查询。
- 用 `revalidateTag` 配合后台写操作做增量更新。

## 相关 Skills

- `vercel-react-best-practices`(RSC / 缓存 / streaming)
- `web-design-guidelines`(可访问性 / SEO 结构)
- `performance`(如需进一步提速)

## 验收标准

- 列表筛选/搜索通过 URL 驱动,刷新/分享保持状态。
- 详情页 meta 与 OG image 正确;`sitemap.xml` / `robots.txt` 可访问。
- Lighthouse SEO 高分;PPR 静态外壳秒出、动态部分流式补齐。

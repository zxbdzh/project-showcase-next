# 任务 02 · 设计系统与布局骨架(Apple 风)

- **状态**:待开始
- **波次**:Wave 1
- **依赖**:仅脚手架
- **可与之并行**:01 数据层、08 工程化/CI
- **是后续基础**:03 3D Hero、06 前台展示、05 后台 CMS 复用本任务的组件与布局
- **权威规范**:实现必须严格对齐 [`docs/design-system.md`](../design-system.md)(Apple 风单一真相源)

## 目标

把 `docs/design-system.md` 的 **Apple 风设计系统**落地为代码:Tailwind v4 主题 token + shadcn/ui 组件 + 明暗主题 + **滚动动画 / 平滑滚动设施**,并搭好前台/后台两套布局骨架。

## 交付物(checklist)

- [ ] `shadcn` 初始化,加入基础组件:button、input、textarea、label、dialog、dropdown-menu、card、table、form、sonner(toast)、badge、tabs、select、skeleton
- [ ] Tailwind v4 CSS-first 主题:全局 CSS 用 `@theme` 定义 token,**严格对齐 design-system.md 的色板 / 字体 / 圆角**(中性色 + 苹果蓝强调,无霓虹)
- [ ] 字体:`next/font` 接入 **Inter**;CSS 字体栈优先 `-apple-system, "SF Pro Display", Inter, ...`;标题紧字距 `-0.02em`
- [ ] 明暗主题:`next-themes`(`ThemeProvider` + 切换组件,默认跟随系统,SSR 无闪烁)
- [ ] **平滑滚动**:接入 **Lenis**(根布局初始化;`prefers-reduced-motion` 时禁用)
- [ ] **动画封装** `components/motion/`:基于 Framer Motion 封装 `FadeIn` / `Stagger` / `Parallax`(统一用苹果缓动 `cubic-bezier(0.16,1,0.3,1)`,仅 transform/opacity)
- [ ] 路由分组布局:
  - [ ] `app/(marketing)/layout.tsx`:Apple 风响应式导航(细顶栏 + 毛玻璃)+ 页脚
  - [ ] `app/(admin)/admin/layout.tsx`:侧边栏 + 顶栏(鉴权在任务 04 接入)
- [ ] 共享组件 `components/shared/`:导航、页脚、主题切换、容器(`max-w` 统一)

## 技术要点

- Tailwind v4 用 CSS `@theme`(脚手架已是 v4),token 命名对齐 design-system.md。
- 颜色用 CSS 变量 + `dark:` 适配;`text/secondary` 在浅灰底注意对比度 ≥ 4.5:1。
- 动画封装统一缓动与时长,集中尊重 `prefers-reduced-motion`(供后续所有页面复用)。
- 布局只放结构/样式与动画容器,数据由后续任务注入。

## 相关 Skills

- `ui-ux-pro-max`(设计与组件实现)
- `web-design-guidelines`(可访问性 / UX 审查)

## 验收标准

- 视觉与 `docs/design-system.md` 一致(配色/字体/圆角/留白)。
- 明暗主题切换正常、无闪烁;Lenis 平滑滚动生效且 `reduced-motion` 下自动禁用。
- `FadeIn`/`Stagger` 等封装可用,滚动入场动画顺滑(仅 transform/opacity)。
- 前台、后台两套布局骨架可访问、响应式(375/768/1024/1440)。

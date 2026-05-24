# 任务 03 · 3D Hero(亮点 A · 滚动驱动)

- **状态**:已完成
- **波次**:Wave 2
- **依赖**:02 设计系统
- **可与之并行**:04 鉴权、06 前台、07 AI
- **权威规范**:对齐 [`docs/design-system.md`](../design-system.md)(Apple 风)

## 目标

做一个 **Apple 风的滚动驱动 3D Hero**:首屏一个精致的抽象几何/材质对象,**随页面滚动旋转、缩放、推进**(类似苹果产品页的产品展示),配合文字分段揭示。视觉冲击 + 克制高级,严格控制对性能的影响。

## 交付物(checklist)

- [x] 安装 `three` `@react-three/fiber` `@react-three/drei` `@react-three/postprocessing`
- [x] `components/three/hero-scene.tsx`(`'use client'`):**玻璃折射几何体**(晶体/扭结造型 + drei `MeshTransmissionMaterial`),折射与边缘泛光用品牌色 Indigo `#4F46E5`
- [x] **滚动驱动**:用 drei `ScrollControls` + `useScroll`,把滚动进度映射到相机/物体的旋转与缩放;文字段随进度淡入(配合 02 的 `FadeIn`)
- [x] 首页通过 `next/dynamic`(`ssr: false`)懒加载,提供静态 fallback(海报图),避免拖累首屏 LCP
- [x] **降级策略**:移动端 / 低端设备降复杂度或回退静态海报
- [x] 尊重 `prefers-reduced-motion`:关闭滚动驱动动画,保留静态展示
- [ ] 按需引入 postprocessing(轻量 bloom 等),控制 bundle

## 技术要点

- `<Canvas>` 仅客户端;不要在 RSC 直接渲染。
- 滚动驱动优先用 drei `ScrollControls`(与 Lenis 协调:二选一驱动滚动,避免双重接管;通常 Hero 段内用 ScrollControls,页面整体用 Lenis,需做好衔接)。
- 性能预算:首屏 LCP 不被 3D 阻塞(异步加载,主文案先渲染);材质/几何复用,控制 draw call。
- 配色取自 `design-system.md`(中性 + 品牌色 Indigo `#4F46E5`),折射/泛光吃品牌色,避免霓虹。

## 相关 Skills

- `r3f-best-practices`、`threejs-graphics-optimizer`(性能与最佳实践)
- `vercel-react-best-practices`(动态加载 / 渲染边界)

## 验收标准

- 滚动时 3D 对象平滑旋转/缩放、文字分段揭示,有「Apple 产品页」质感。
- 桌面端流畅(目标 60fps),移动端降级、不卡顿。
- `prefers-reduced-motion` 下关闭滚动动画、回退静态。
- Lighthouse 首页 LCP / 性能分不被 Hero 明显拖累。

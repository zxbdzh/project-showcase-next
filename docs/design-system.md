# 设计系统 · Apple 风(精致交互 + 滚动驱动动画)

> 本文件是项目 UI 的**单一真相源**。所有页面/组件必须遵循;页面级偏差在各任务文档中显式说明。

## 设计基调

对标 **apple.com**:极简、大量留白、超大产品级排版、克制中性配色、沉浸式分段叙事。**核心体验是精致的滚动驱动交互与动画**。明暗双模式(含纯黑沉浸段)。气质:专业、现代、有记忆点,面向技术招聘方/同行。

## 色彩 Token

**亮色(默认)**
| token | 值 | 用途 |
|---|---|---|
| `bg/base` | `#ffffff` | 主背景 |
| `bg/subtle` | `#f5f5f7` | 苹果标志性浅灰段 |
| `text/primary` | `#1d1d1f` | 主文字 |
| `text/secondary` | `#6e6e73` | 次要文字 |
| `accent`(品牌色) | `#4F46E5` | CTA/链接/进度/3D 折射 · 靛蓝紫 Indigo |
| `accent/hover` | `#4338CA` | 悬停 |
| `accent/subtle` | `#EEF2FF` | 品牌色淡底(badge / hover 背景) |

**暗色(沉浸黑段)**:`bg #000000` / `text #f5f5f7` / `accent #818CF8`(暗底用更亮的 Indigo)

**个人品牌色 = 靛蓝紫 `#4F46E5`(Indigo)**:全站唯一强调色,贯穿按钮、链接、滚动进度条与 **3D Hero 的玻璃折射 / 泛光**。原则:大面积中性色;强调色**只**用于 CTA/链接/关键高亮;避免霓虹、高饱和堆叠、廉价渐变(与老项目极客风划清界限)。

## 字体

- 字体栈:`-apple-system, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif`(Mac/iOS 原生 SF Pro,其余经 `next/font` 回退 **Inter**)
- 标题:大字号(clamp 响应式)+ **紧字距 `-0.02em ~ -0.03em`** + 600/700
- 正文:≥17px,行高 1.5,色用 `text/secondary`
- 行宽 65–75 字符

## 间距与形状

- section 垂直 padding 大(`py-24 ~ py-40`),节奏宽松
- 容器 `max-w-[980px]` / `max-w-[1200px]` 居中
- 圆角:卡片 18–28px;按钮**胶囊** `rounded-full`(苹果 980px)
- 阴影克制:大模糊、低透明度

## 动画与交互(核心)

- **缓动**:`cubic-bezier(0.16, 1, 0.3, 1)`(ease-out expo);入场 0.6–1s,微交互 200–300ms
- **滚动入场**:`opacity 0→1` + `translateY 24→0`(进入视口),Framer Motion `whileInView` 或 `useScroll`+`useTransform`
- **sticky pinned 叙事**:section `position: sticky` 钉住,内部随滚动进度推进(特性逐步展现)
- **视差**:前后景不同速度位移
- **大图/卡片**:进入视口 `scale 0.96→1` + 淡入
- **平滑滚动**:**Lenis** 提供苹果质感惯性滚动(根布局初始化)
- **3D Hero**:随滚动旋转/缩放(见 `tasks/03-3d-hero.md`,drei `ScrollControls`)

**约束**:仅用 `transform`/`opacity`(GPU 友好,禁改 width/height/top);严格尊重 `prefers-reduced-motion`(关位移/视差、保留淡入,Lenis 同步禁用);移动端降级(减视差/3D 复杂度)。

## 技术设施

- **Framer Motion**(`motion`):`whileInView`、`useScroll`、`useTransform`、`layout`
- **Lenis**:平滑滚动;`reduced-motion` 时禁用
- **shadcn/ui**:基础组件,主题变量对齐上方 token
- **next/font**:Inter(SF Pro 回退)

## 可访问性

- 对比度 ≥ 4.5:1(注意 `text/secondary` 在浅灰底)
- 焦点环可见、键盘可达、触控目标 ≥ 44px
- 动画可被 `prefers-reduced-motion` 关闭;`color` 不作唯一信息载体

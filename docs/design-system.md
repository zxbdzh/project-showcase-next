# 设计系统 · 终端 / 工程美学

> 本文件是项目 UI 的**单一真相源**。所有页面 / 组件必须遵循;页面级偏差在各任务文档中显式说明。
> Token 落地在 [`src/app/globals.css`](../src/app/globals.css),母题组件在 [`src/components/terminal/`](../src/components/terminal/)。

## 设计基调

母题是**命令行 / 工程师工作台**:等宽字体、命令提示符、注释体标题、终端窗口、文件树、构建日志。气质冷峻、克制、有工程纪律感,面向技术招聘方 / 同行。明暗双模式(暗色是真正的主场)。

**与「对标 apple.com」划清界限**:辨识度来自专属母题 + 暖橙琥珀信号色,而非留白堆砌或苹果式特效。同时也**不沿用老项目的霓虹极客 / 矩阵雨 / 故障文字**。

## 色彩 Token

中性阶用**暖灰 stone**(与琥珀同色温),信号色用**琥珀 amber**。完整值见 `globals.css`。

| token                | 亮色                 | 暗色                 | 用途                     |
| -------------------- | -------------------- | -------------------- | ------------------------ |
| `--background`       | `#FAFAF9` stone-50   | `#0C0A09` stone-950  | 主背景                   |
| `--foreground`       | `#1C1917` stone-900  | `#FAFAF9`            | 主文字                   |
| `--card`             | `#FFFFFF`            | `#1C1917` stone-900  | 卡片 / 终端窗口          |
| `--muted`            | `#F5F5F4` stone-100  | `#1C1917`            | 浅段                     |
| `--muted-foreground` | `#78716C` stone-500  | `#A8A29E` stone-400  | 次要文字                 |
| `--border`           | `#E7E5E4` stone-200  | `#292524` stone-800  | 描边                     |
| `--brand` 信号琥珀   | `#C2410C` orange-700 | `#FB923C` orange-400 | CTA / 链接 / 光标 / 高亮 |
| `--brand-hover`      | `#9A3412`            | `#FDBA74`            | 悬停                     |
| `--brand-subtle`     | `#FFEDD5` orange-100 | `#2A1A0E` 深琥珀棕   | 淡底 / 选中              |

**用色原则**:大面积中性;`--brand` **只**用于 CTA、链接、终端光标、关键高亮与选中态。**禁霓虹、禁多色渐变堆叠、禁残留紫色。** 亮色信号色用 orange-700(非亮橙)以保对比度 ≥ 4.5:1。

## 字体

| 变量          | 字体                                    | 用途                                                                                      |
| ------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `--font-mono` | **JetBrains Mono**                      | 母题字体:命令提示符、标签 / eyebrow、数字(统计 / 浏览量 / level)、代码块、终端组件、`kbd` |
| `--font-sans` | **Inter**(西文)+ **Noto Sans SC**(中文) | 正文与中文标题                                                                            |

- 中文等宽体验差,故**标题用 sans + 紧字距 `-0.02em`**,「终端感」靠 mono 用在 UI chrome(提示符 / 标签 / 数字 / 注释体)。
- 正文 ≥ 16px,行高 1.5–1.6,次要文字用 `--muted-foreground`;行宽 65–75 字符。

## 间距与形状

- **方角母题**:`--radius = 0.25rem`。**禁用 `rounded-full` 胶囊与 `rounded-2xl/3xl`**;常规用 `rounded-sm/md`,终端窗口用 `rounded-lg`。
- section 垂直 padding 宽松(`py-20 ~ py-32`);容器见 `components/shared/container.tsx`(`max-w-[1120px]`)。
- 边框是主要分隔手段(终端感),阴影克制。

## 动画与交互

**缓动** `cubic-bezier(0.16,1,0.3,1)`(`lib/motion.ts` 的 `EASE_OUT_EXPO`);入场 0.6–0.9s,微交互 150–250ms。

**保留 / 推荐**(仅 `transform`/`opacity`):

- 打字机逐字输出(终端命令)+ **单处**光标闪烁(`.terminal-caret`)
- 滚动入场 `opacity 0→1 + translateY`(`components/motion/fade-in.tsx`、`stagger.tsx`)
- 滚动驱动叙事(`useScroll` + `useTransform`,见 hero)
- 数字 `count-up` 滚动;hover 用下划线 / 方框 / 描边变色 / 轻微位移
- 在线状态点 `animate-ping`(单点状态指示,`StatusDot ping`)

**禁止**:无限循环的**发光 / 呼吸 / 脉冲 / 浮动**(已从 `globals.css` 移除 `stats-glow` / `cta-pulse` / `avatar-float` / `hero-float-*` 等)。

**约束**:严格尊重 `prefers-reduced-motion`(关位移 / 视差 / 打字,保留淡入,Lenis 同步禁用,见 `smooth-scroll.tsx`);移动端降级。

## 母题组件(`src/components/terminal/`)

| 组件             | 用途                                             |
| ---------------- | ------------------------------------------------ |
| `TerminalWindow` | 终端窗口外壳:信号灯 + 标题栏 + 可选底部工具栏    |
| `Prompt`         | 命令提示符 `$` / `→` 前缀                        |
| `CommentHeading` | 注释体小节标题 `// 标题`(eyebrow)                |
| `Kbd`            | 键盘按键样式(⌘K 等)                              |
| `StatusDot`      | 状态点(emerald/amber/red/muted,可 ping)          |
| `GridBackdrop`   | 工程图纸细网格底纹(替代浮动光球;父需 `relative`) |

## 可访问性

- 对比度 ≥ 4.5:1(注意 `--muted-foreground` 在浅段;信号琥珀亮色用 orange-700)
- 焦点环可见、键盘全可达、触控目标 ≥ 44px;命令面板需焦点陷阱 + Esc
- 动画可被 `prefers-reduced-motion` 关闭;颜色不作唯一信息载体

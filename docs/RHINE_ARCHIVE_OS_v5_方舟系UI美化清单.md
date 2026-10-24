# 方舟系 UI 美化清单 · 技法库

> **文档定位**：v3 定"改成什么样"，v4 定"用什么库"，本文档定"**用什么手艺**"。
> **核心主张**：真正的美学质感不来自更多的库和特效，来自**材质、线条、排印、节奏**这四件手上功夫。
> **目标仓库**：`H:\Zcode cangku\Leersxie.github.io`（Next.js 15 + React 19 + Tailwind v4）
> **编写日期**：2026-10-24

---

## 0. 用法

这份清单是**可勾选的**。每一条都给了：现状 → 改成什么 → 为什么 → 代码。

按这个顺序读：

```
第 1 节  先做减法：你现在命中了几条 AI 味（诚实打分，不美化）
第 2 节  材质层  ← 去 AI 味最核心的武器，投入产出比最高
第 3 节  线条    ← 方舟的骨架
第 4 节  色彩    ← "一次性色彩预算"
第 5 节  排印    ← 一刀见效
第 6 节  动效    ← 克制但有物理感
第 7 节  原生 CSS ← 真·前端实力，零依赖
第 8 节  组件细节 ← 50+ 条可直接改
第 9 节  突破性方案 ← 5 个没人这么做过的
第 10 节 参考项目
第 11 节 优先级
```

---

## 1. 先做减法：AI 味的 14 个 tell

### 1.1 为什么先做减法

调色、加特效、堆组件，都是**加法**。但"AI 味"的本质不是"缺东西"，是"多了一些不该有的东西"：

> **AI 生成的设计永远边缘完美、色彩均匀、圆角一致、动效齐全——因为它是在求"统计平均值"。**
> 人手做的设计有取舍、有不完美、有偏心。

所以第一件事不是加，是**对着清单删**。

### 1.2 十四项自查（每命中 1 项 = 1 分，越低越好）

| # | AI 味信号 | 具体表现 | 你的博客 | 修法 |
|---|---|---|---|---|
| 1 | **紫蓝渐变** | `#7c3aed→#6366f1` / `#667eea→#764ba2` / 紫蓝径向光晕 | **✅ 命中**。hero 是 `#141227→#1b2140`，h1 是 `from-primary-soft to-#7ea2ff` 渐变文字 | 见 4.5 |
| 2 | **默认字体** | Inter / Roboto / Open Sans / system-ui | ⚠️ 半命中。Jost 是主动选择（加分），但 `--font-display` 声明的 Space Grotesk 从未加载，实际 fallback 到 Noto Sans SC | 见 5.1 |
| 3 | **Bento 六宫格** | 等权重的 3×2 卡片，每张都是"图标+标题+两行" | **✅ 命中**。档案阵列 3 列等宽，每张结构相同 | 见 8.2 |
| 4 | **过度圆角** | 所有元素 `rounded-xl` / `rounded-2xl` / `rounded-3xl` | **✅ 命中**。`rounded-xl` 出现在卡片、命令面板、封面、上一篇/下一篇 | 见 3.1 |
| 5 | **无理由玻璃拟态** | `backdrop-filter: blur()` 加在没有层级理由的地方 | **✅ 命中**。`.glass-panel` 用在命令面板、移动端顶条 | 见 2.7 |
| 6 | **强调色过载** | 一个饱和色同时用于按钮、图标、徽章、链接 | **✅ 命中**。紫蓝同时用于：链接、active 导航、标签、进度条、边框 hover、渐变 | 见 4 |
| 7 | **渐变文字** | 标题/数字用 `bg-clip-text` 造"视觉趣味" | **✅ 命中**。`RHINE ARCHIVE OS` 的 ARCHIVE OS 是渐变字 | 见 5.4 |
| 8 | **动画疲劳** | 每个 hover 都弹、每个进入都淡入 | **✅ 命中**。`archive-card:hover` 同时触发：扫描光 600ms + 位移 + 边框变色 + OPEN 淡入；外层还有 `Reveal` 入场 | 见 6.6 |
| 9 | **状态药丸** | 每个 tag 都是彩色圆角 pill | **✅ 命中**。`rounded border px-1.5 py-0.5` 的 tag chip | 见 8.4 |
| 10 | **居中堆叠** | 所有内容居中，因为没有真正做过编排 | ⚠️ 部分。列表左对齐（加分），但纵向节奏单一 | 见 3.6 |
| 11 | **巨型数字** | 超大数字填满本该讲故事的空间 | ⚠️ 部分。`ARCHIVES / WORDS / CATEGORIES` 三组数字占了大块 | 见 5.5 |
| 12 | **图标顶置** | 每个标题上方一个圆角方块图标 | ❌ 未命中 | — |
| 13 | **左侧彩条** | 卡片左边一条 3px 彩色竖线，假装是组织 | ⚠️ 潜在风险。v3 的 P2-05 建议 h2 加左边框 3px | 改成 2px + 编号 |
| 14 | **默认 shadcn/Tailwind 脸** | 一眼看出是模板 | ⚠️ 部分。自定义程度高（加分），但 `.nav-item` 胶囊 + `rounded-xl` 卡片的组合很"产品官网" | 见 3.2 |

### 1.3 你的得分：**8 / 14**

诚实说：**这是一个中高位的分数**。不是设计得差，而是"设计语言太通用"——它看起来像一个**做得不错的现代产品站**，而不是一个**有作者的项目**。

最该先修的 4 条：**#1 紫蓝渐变 · #6 强调色过载 · #7 渐变文字 · #8 动画疲劳**。这四条互相纠缠，本质是同一个病：**色彩和动效在替内容说话**。

### 1.4 最终测试（每次改完问自己）

> **把截图给别人看，说"这是 AI 做的"，他会立刻相信吗？**

如果会 → 还没改到位。

---

## 2. 材质层（去 AI 味的核心武器）

**为什么材质最重要**：AI 生成的设计**没有表面**。它是纯矢量——边缘锐利、填充均匀、渐变光滑。
而真实世界的纸有纤维、有厚度、有压痕；屏幕有像素、有摩尔纹、有残影。

**加一层材质，等于给设计加上"被制造过的证据"。**

### 2.1 噪点（Grain）—— 最基础也最有效

**三种颗粒配方**（`baseFrequency` 决定粗细，`numOctaves` 决定层次）：

```css
/* 配方 A · 中颗粒（纸上印刷，最通用）*/
.grain-paper {
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 50;
	opacity: 0.055;
	mix-blend-mode: overlay;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```
```css
/* 配方 B · 细密（胶片颗粒，暗色下用）*/
baseFrequency='0.9' numOctaves='4'
opacity: 0.04

/* 配方 C · 粗糙（旧纸/复印，只用于小面积）*/
baseFrequency='0.35' numOctaves='2'
opacity: 0.10
```

**六个必须遵守的细节**（这些都是实际踩过的坑）：

| # | 细节 | 为什么 |
|---|---|---|
| 1 | `stitchTiles='stitch'` | 不加会有明显的平铺接缝 |
| 2 | `pointer-events: none` | 否则整站无法点击 |
| 3 | `position: fixed` + 单层 | 每张卡片各加一层 = 几百个滤镜，性能崩。**全站一层** |
| 4 | 用 inline SVG data URI | 省一个 HTTP 请求，且与 CSS 同步加载 |
| 5 | 移动端 opacity 降 30–40%、`baseFrequency` 提高 | 小屏幕上颗粒会显得过密 |
| 6 | `mix-blend-mode: overlay` | `multiply` 会压暗整体，`soft-light` 太弱。`overlay` 是唯一"只加质感不改明度"的 |

**落位**：`app/layout.tsx` 的 `<body>` 内、`AppShell` 之前，一个 `<div className="grain-paper" aria-hidden />`。

> **视觉预期**：加完后截图对比，**变化很细微，但"干燥"变"有湿度"**。如果一眼看出加了噪点，opacity 太高。

### 2.2 位移扰动（`feDisplacementMap`）—— 杀手锏

**这是最被低估、最能"去 AI 味"的一招。**

原理：用噪点场推开像素。`scale="4"` 时，文字边缘会产生**极轻微的不均匀**——像铅字压印在纸上，墨的扩散不完全一致。

> 原文描述（Carmen Ansio）："At `scale='4'`, it's a subtle organic wobble that makes type look hand-pressed. Nobody knows why it looks good, it just does."

```css
/* 活字印刷：只给标题用，scale 必须 ≤ 5 */
@supports (filter: url(#x)) {
	.type-pressed {
		filter: url(#press);
	}
}
```
```html
<svg width="0" height="0" aria-hidden style="position:absolute">
	<filter id="press" x="-5%" y="-5%" width="110%" height="110%">
		<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="7" result="n" />
		<feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
	</filter>
</svg>
```

**四个参数决定成败**：

| 参数 | 值 | 说明 |
|---|---|---|
| `baseFrequency` | **0.008 – 0.018** | 极低。这是"大尺度起伏"，不是"细颗粒"。高了会变成"毛边"而不是"压印" |
| `numOctaves` | **1** | 必须 1。多了会碎 |
| `scale` | **2.5 – 4.5** | 超过 6 就开始"融化"，不是"压印" |
| `seed` | 固定数字 | 换个数字换一种"手感"，可以挑一个喜欢的 |

**用在哪**：
- ✅ 文章页 h1（一次）
- ✅ 页脚大字 `Leersxie.`
- ✅ 404 的巨型数字
- ❌ 正文（会降低可读性）
- ❌ 小字（小于 16px 时位移反而模糊）

**性能**：`feDisplacementMap` 比 `feGaussianBlur` 慢，**只能用于小面积静态元素**。绝对不要放在滚动容器或大面积元素上。

#### ⚠️ 实测踩坑（我做 demo 时真的踩了）

```css
/* ❌ 错：filter 不会继承字体样式 */
.pressed { filter: url(#press); }
/* 结果：位移生效了，但字变成了 16px 默认无衬线 —— 因为字体样式在父级 h2 上 */
```

```css
/* ✅ 对：filter + 完整字体样式，且必须 inline-block */
.pressed {
	filter: url(#press);
	font-family: "Noto Serif SC", Georgia, serif;
	font-size: clamp(2rem, 7vw, 4.5rem);
	font-weight: 600;
	letter-spacing: -0.03em;
	line-height: 1;
	display: inline-block;      /* 必需：inline 元素上 filter 表现不稳 */
}
```

**两条铁律**：
1. `filter` 是**渲染层属性**，不携带任何排版信息。加它的元素必须自己写完整字体样式。
2. `display: inline-block` 或 `block`。别加在裸 `<span>` 上。

> **这是本文档里唯一被实际截图验证过的技法。** 验证结果：位移生效后，字母边缘出现极轻微的不规则——不是"模糊"，是"墨的扩散不完全均匀"。对比图见交付附件。

> **这是"最高级的一招"**：它让文字从"矢量的"变成"印刷的"。用户说不出哪里不同，但会觉得"这个站有质感"。

### 2.3 半调网点（Halftone）

方舟物料里大量出现网点。CSS 实现分两种：

```css
/* A · 均匀网点（印刷底纹）*/
.halftone-dot {
	background-image: radial-gradient(circle, currentColor 1.1px, transparent 1.4px);
	background-size: 5px 5px;
	opacity: 0.07;
}

/* B · 渐变网点（明暗过渡处网点变大——真正的半调）*/
.halftone-gradient {
	background-image: radial-gradient(circle, currentColor 1.6px, transparent 1.8px);
	background-size: 6px 6px;
	-webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 80%);
	mask-image: linear-gradient(to bottom, #000 0%, transparent 80%);
}
```

**B 是关键**：真正的半调印刷，深色区的网点比浅色区大。用 `mask-image` 让网点整体渐隐，是**廉价但正确的模拟**。

**进阶（真正的半调）**：用两层不同 `background-size` 叠加，制造"网点在不同区域大小不同"的错觉：
```css
.halftone-real {
	background-image:
		radial-gradient(circle, currentColor 1.8px, transparent 2px),
		radial-gradient(circle, currentColor 0.9px, transparent 1.1px);
	background-size: 8px 8px, 5px 5px;
	background-position: 0 0, 2px 2px;
}
```

### 2.4 扫描线 / CRT

```css
.scanline {
	background-image: repeating-linear-gradient(
		0deg,
		rgb(255 255 255 / 0.028) 0px,
		rgb(255 255 255 / 0.028) 1px,
		transparent 1px,
		transparent 3px
	);
	pointer-events: none;
}
```

**亮度必须极低**（0.028）。高了会变成"复古游戏机"而不是"仪器屏幕"。

**只用在两处**：
1. 代码块的底衬（`pre` 内部，配合暗底）
2. BootSequence 的开屏层

### 2.5 纸纹 / 纤维

比噪点更"有方向"的质感。用双 `feTurbulence` + 各向异性 `baseFrequency`：

```css
.paper-fiber {
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9 0.02' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E");
	opacity: 0.05;
	mix-blend-mode: multiply;
}
```

**关键**：`baseFrequency='0.9 0.02'` —— x 高 y 低，产生**横向纤维**。这就是"纸张的方向"。

> 换成 `0.02 0.9` 就是竖向纤维，适合做"档案纸的竖向纹理"。

### 2.6 呼吸噪点（动画 `baseFrequency`）

**CSS 不能动画 SVG filter 属性，但 JS 可以。** 这让噪点"活着但不明显在动"：

```js
// 极轻的呼吸：0.62 ± 0.03，周期约 8 秒
const turb = document.querySelector("#grain-filter feTurbulence");
let frame = 0;
function breathe() {
	frame++;
	turb.setAttribute("baseFrequency", (0.62 + Math.sin(frame * 0.0026) * 0.03).toFixed(3));
	requestAnimationFrame(breathe);
}
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) breathe();
```

**参数**：`0.0026` 决定周期（约 8s），`0.03` 决定幅度（越大越"呼吸"）。
**幅度不要超过 0.05**，否则会变成"电视雪花"。

> **这是"第二高级的一招"**：静态噪点是"贴图"，呼吸噪点是"胶片在走"。差别是"有没有生命"。

### 2.7 玻璃的正确用法

`.glass-panel` 现在被用在了命令面板和移动端顶条——**这两处都没有"玻璃"的理由**（玻璃隐喻"下面是别的东西"，但这两处下面是纯色背景）。

**规则：只在有东西"透过"的地方用玻璃。**

| 位置 | 下面是什么 | 该不该用玻璃 |
|---|---|---|
| 桌面顶栏（sticky） | 滚动的内容 | ✅ 该用 |
| 移动端顶条（sticky） | 内容 | ✅ 该用 |
| 命令面板（模态） | 背后的页面 | ✅ 该用 |
| 卡片 | 纯色背景 | ❌ 不该用 |
| 侧栏 | 纯色背景 | ❌ 不该用 |

**并且加一条 Claude 的做法：玻璃要有"厚度"**

```css
.glass-panel {
	background: color-mix(in srgb, var(--color-panel) 82%, transparent);
	backdrop-filter: blur(16px) saturate(150%);
	border: 0.5px solid rgb(255 255 255 / 0.14);
	box-shadow:
		inset 0 1px 0 rgb(255 255 255 / 0.06),   /* 上边缘受光 */
		inset 0 -1px 0 rgb(0 0 0 / 0.04);         /* 下边缘阴影 */
}
```

`saturate(150%)` 是"玻璃提纯"（Claude 和 ignoredone 都用了这个），`inset` 双阴影是"厚度"。

---

## 3. 线条（方舟的骨架）

### 3.1 圆角：从"到处圆"到"四档制"

**现状**：`rounded` / `rounded-md` / `rounded-lg` / `rounded-xl` / `rounded-full` 混用，无规律。

**改成四档，且按"元素体积"分级**：

| 档位 | 值 | 用于 | 判据 |
|---|---|---|---|
| **胶囊** | `999px` | 导航项、按钮、标签、输入框 | 高度 ≤ 44px 的交互元素 |
| **卡片** | `14px` | 卡片、面板、模态、代码块 | 有内容区的容器 |
| **菜单** | `10px` | 菜单项、列表行、小方块 | 容器内的小块 |
| **标签** | `4px` | chip、kbd、行内 code | 文字级别的装饰 |

**关键判断**：`rounded-full` 只用于**高度确定且 ≤ 44px** 的东西。如果你给一个 200px 高的卡片加 `rounded-full`，那一定会变成"AI 味的过度圆角"。

### 3.2 描边：0.5px 发丝线

**Claude 的核心技法**：`border: 0.5px solid` 配 15–30% alpha 的深色 token——**几乎不用实心灰**。

```css
/* 旧：实心灰，1px */
border: 1px solid var(--color-line);          /* #23262e */

/* 新：发丝线，颜色带 alpha */
border: 0.5px solid color-mix(in srgb, var(--color-ink) 18%, transparent);

/* 或者是"双层"：外发丝 + 内高光 */
border: 0.5px solid rgb(255 255 255 / 0.08);
box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.04);
```

**为什么 0.5px 更好**：
- 1px 实线在 2x 屏上会被渲染成 2px，显得"粗笨"
- 0.5px 在 2x 屏上是 1 物理像素，**锐利**
- alpha 描边让边框"融进"背景，而不是"画在上面"

> **兼容性**：`0.5px` 在 1x 屏（老显示器）会被舍入成 1px 或消失。用 `@media (min-resolution: 2dppx)` 包裹，1x 屏仍用 1px。

### 3.3 双线描边（"档案夹"感）

方舟的面板常有"外层粗线 + 内层细线"的双重边框：

```css
.double-rule {
	position: relative;
	border: 1px solid var(--color-line-strong);
	padding: 1px;
}
.double-rule::before {
	content: "";
	position: absolute;
	inset: 3px;
	border: 0.5px solid var(--color-line);
	pointer-events: none;
}
```

**3px 的间距是关键**——太宽像"画框"，太窄像"重影"。

### 3.4 斜切角（`clip-path`）

方舟最标志性的形状语言。三种切法：

```css
/* A · 对角双切（最常用）*/
.cut-diagonal {
	clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
}

/* B · 单角切（"标签被撕掉一角"）*/
.cut-corner {
	clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
}

/* C · 斜边（"斜面卡片"）*/
.cut-slant {
	clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), 0 100%);
}
```

**三个必须知道的坑**：

| 坑 | 表现 | 解法 |
|---|---|---|
| `clip-path` 会切掉 `border` | 边框在切角处消失 | 用 `background` 色反差替代 border，或用 `filter: drop-shadow()` 描边 |
| `clip-path` 会切掉 `box-shadow` | 阴影不见了 | 同上，用 `drop-shadow` |
| 切角处无法 hover | 鼠标在切掉的区域不触发 | 这反而是对的——**切角就是"不可点击区"**，符合物理直觉 |

**用在哪**：按钮、徽章、图片容器、`/friends/` 的头像框。**不要用在卡片上**（卡片要平）。

### 3.5 角标：四角十字 / L 形括号

```tsx
/* A · 四角十字（已有，保留）*/
{["left-0 top-0","right-0 top-0","left-0 bottom-0","right-0 bottom-0"].map(p => (
	<span key={p} className={`absolute ${p} -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--color-line-strong)]`}>+</span>
))}
```

```css
/* B · L 形括号（"取景框"，比方舟的四角更含蓄）*/
.corner-bracket::before,
.corner-bracket::after {
	content: "";
	position: absolute;
	width: 10px;
	height: 10px;
	border-color: var(--color-line-strong);
	border-style: solid;
}
.corner-bracket::before { top: 0; left: 0; border-width: 1px 0 0 1px; }
.corner-bracket::after  { bottom: 0; right: 0; border-width: 0 1px 1px 0; }
```

**A 和 B 不要同时用。** 四角十字是"测量标记"，L 形括号是"取景框"，语义不同，混用会显得杂乱。

### 3.6 刻度与标尺

**这是"技术感"最廉价的来源**，纯 CSS 一行：

```css
/* 横向刻度（用在区块分隔、进度条底衬）*/
.ruler-x {
	height: 6px;
	background-image: repeating-linear-gradient(
		90deg,
		var(--color-line-strong) 0 1px,
		transparent 1px 8px
	);
	/* 每 5 格加一根长刻度 */
	background-size: 8px 100%, 40px 100%;
	background-image:
		repeating-linear-gradient(90deg, var(--color-line-strong) 0 1px, transparent 1px 8px),
		repeating-linear-gradient(90deg, var(--color-ink-soft) 0 1px, transparent 1px 40px);
	background-repeat: repeat-x;
}
```

**用在哪**：
- 区块之间的分隔线（替代普通 `border-top`）
- 阅读进度条的底衬（暗示"总量"）
- Hero 底部（v3 已建议，保留）

### 3.7 一条"线"的三种厚度

不要只有"有边框/无边框"两种状态。用三种厚度建立层级：

```
0.5px + 18% alpha  →  分隔（几乎看不见，只是"有边界"）
1px   + 100% alpha →  强调（当前项、focus、选中）
2px   + 品牌色     →  状态（左侧状态条，v4 的 .nav-item hover）
```

---

## 4. 色彩：一次性色彩预算

### 4.1 Raycast 的"每页一个饱和瞬间"

> 原话（fixmyslop）："Allow exactly one saturated color event per page — a single accent band, a single glow, a single product-color flush. This makes that moment feel intentional and scarce, not scattered."

**你的博客现在有几个"饱和瞬间"？**

hero 渐变 + h1 渐变文字 + 5 个板块 accent + 标签色 + 进度条渐变 + 卡片 hover 紫边 = **至少 6 个**。

**改成 1 个**。

### 4.2 Claude 的分工法（最重要的思路）

Claude 把色彩分成两个**互不重叠**的用途：

| 色 | 用途 | 绝不用于 |
|---|---|---|
| **蓝** | 交互：focus ring、选中、链接 | 品牌、装饰 |
| **陶土橙 `#d97757`** | 品牌、CTA | 交互状态 |

**这个分工的价值**：用户看颜色就知道"这个能点"还是"这是品牌"。当蓝色只用于交互时，蓝色就成了一种**功能信号**，而不是装饰。

**迁移到你的项目**：

| 色 | 用途 | 值 |
|---|---|---|
| `--color-brand` 紫 | **只用于品牌**：logo、hero 渐变、页脚大字 | `#7c5cff` |
| `--color-signal` 金 | **只用于状态与 CTA**：在线灯、主按钮、翻牌、进度 | `#f1c644` |
| `--color-data` 蓝 | **只用于交互**：链接、focus ring、选中态、hover 边框 | `#4aabea` |
| 中性 | 其余一切 | 见 4.4 |

**现在的问题**：紫同时在做品牌、交互、状态三件事。**必须拆开。**

### 4.3 三层骨架（墨 / 纸 / 信号）

```css
/* 墨：背景、面板、边框 —— 占 55–65% */
--ink-900: #0b0d11;   /* 页面底 */
--ink-800: #12141a;   /* 面板 */
--ink-700: #191c23;   /* 次级块 */
--ink-600: #23262e;   /* 分隔 */

/* 纸：文字、描边、高光 —— 占 30–40% */
--paper-100: #e9eaee; /* 主文字 */
--paper-300: #a6aab4; /* 正文 */
--paper-500: #6b707b; /* 元数据 */

/* 信号：≤5% */
--signal: #f1c644;
--data:   #4aabea;
--brand:  #7c5cff;
```

**5% 是什么概念**：1440×900 的视口 = 129.6 万像素，5% = **6.5 万像素**。大约是一块 255×255 的方块。**你的 hero 渐变文字 + 三个统计数字 + 6 个 tag 加起来可能就超了。**

### 4.4 用 `oklch` 做"同色不同浓度"

`oklch` 的感知均匀性让它非常适合做"同色系多档"——**改 `L` 就是明度，改 `C` 就是饱和，`H` 不变**：

```css
:root {
	/* 品牌紫的 5 档（H=285 不变）*/
	--brand-100: oklch(0.95 0.02 285);
	--brand-300: oklch(0.82 0.08 285);
	--brand-500: oklch(0.62 0.20 285);   /* 主色 */
	--brand-700: oklch(0.48 0.18 285);
	--brand-900: oklch(0.30 0.10 285);

	/* 组合派生（比手写第二组变量更好维护）*/
	--brand-dim:  color-mix(in oklch, var(--brand-500) 12%, transparent);
	--brand-line: color-mix(in oklch, var(--brand-500) 32%, transparent);
}
```

**为什么 `oklch` 优于 `hsl`**：HSL 里 `hsl(285 70% 50%)` 和 `hsl(285 70% 80%)` 的"看起来的饱和度"差很多（蓝紫在低明度时显得更饱和）。`oklch` 的 `C` 是感知饱和，**同 `C` 不同 `L` 时，"浓淡"关系是线性的**。

> **浏览器支持 93%**（Chrome 111+ / Safari 15.4+ / Firefox 113+）。可以放心用。

### 4.5 你的收敛方案（具体数值）

```css
@theme {
	/* —— 墨 —— */
	--color-bg:          #0b0d11;
	--color-panel:       #12141a;
	--color-panel-2:     #191c23;
	--color-line:        #23262e;
	--color-line-strong: #343945;

	/* —— 纸 —— */
	--color-ink:      #e9eaee;
	--color-ink-soft: #a6aab4;
	--color-muted:    #6b707b;

	/* —— 信号（严格分工）—— */
	--color-brand:  #7c5cff;   /* 仅品牌：logo / 页脚大字 / 无其他 */
	--color-signal: #f1c644;   /* 仅状态与 CTA：在线灯 / 主按钮 / 翻牌 / 进度 */
	--color-data:   #4aabea;   /* 仅交互：链接 / focus / 选中 / hover 边框 */

	/* —— 派生 —— */
	--color-brand-dim:  color-mix(in oklch, var(--color-brand) 12%, transparent);
	--color-signal-dim: color-mix(in oklch, var(--color-signal) 14%, transparent);
	--color-data-dim:   color-mix(in oklch, var(--color-data) 12%, transparent);
}
```

**要删掉的东西**：
- ❌ `hero` 的紫蓝渐变（改成纯 `--color-panel` + 材质层）
- ❌ h1 的渐变文字（改成纯白 + `feDisplacementMap`）
- ❌ 5 个板块 accent（改成 `sig` 浓度，见 v3 的 B2-3）
- ❌ `ReadingProgress` 的渐变（改成 `--color-signal` 纯色）
- ❌ `.archive-card:hover` 的紫边（改成 `--color-data`）
- ❌ `.nav-item.is-active` 的紫底（改成左侧 2px `--color-data` 条，无底）

**改完之后**：整站只剩 3 个饱和色，且各有职责。视觉重心自然集中。

---

## 5. 排印（一刀见效）

### 5.1 字体：反默认清单

**AI 味的第 2 号特征就是 Inter。** 你的 Jost 是主动选择，这一点是加分项。但还有两个问题：

**问题 1：`--font-display` 从未加载。**

`globals.css:60` 声明 `"Space Grotesk"`，但既没有 `@font-face`，`public/fonts/SpaceGrotesk.woff2` 也没被引用，`scripts/subset-fonts.mjs` 的 JOBS 里也没有。**所有 `font-display` 元素都在 fallback 到 Noto Sans SC。**

**问题 2：缺一个"有性格"的展示字体。**

Jost 很干净，但"干净"约等于"没有作者"。方舟的标题字是**思源宋体**（衬线、庄重），这与你现在的无衬线形成不了记忆点。

**建议的三字体体系**：

| 角色 | 字体 | 用途 | 理由 |
|---|---|---|---|
| **展示** | **Noto Serif SC / 思源宋体**（600） | h1、文章标题、页脚大字 | 衬线 = 编辑感 = "有人在编" |
| **正文** | Jost（400/500） | 所有 UI 与正文 | 几何无衬线，接近 Novecento 的现代感 |
| **等宽** | JetBrains Mono（400） | 编号、metadata、代码 | 已有，只需修子集 |

**"科技里用衬线"是有先例的**：Resend 用 Domaine 做标题，Anthropic 用 Anthropic Serif 做 AI 内容——这是在"工程师审美"里打出一个"编辑审美"的缺口，反而显得有品位。

> **只在这三处用衬线**：文章页 h1、归档页 h1、`.prose-os h2`。用多了变"古风"。

### 5.2 大小字距反转（最重要的排印规则）

这是方舟系设计最强的排印签名，也是 ignoredone 实测出来的：

```
字号 ≥ 32px  →  letter-spacing: -0.04em ~ -0.02em   （负字距，字母"咬"在一起）
字号 14–22px →  letter-spacing: 0 ~ -0.01em
字号 ≤ 12px  →  letter-spacing: +0.10em ~ +0.16em   （正字距 + uppercase，字母"散"开）
```

**为什么**：
- 大字负字距 → 减少"空气"，形成**块面**，视觉上更重
- 小字正字距 → 增加可辨识度，同时暗示"这是元数据不是内容"

**Vercel 用 `-0.04em` 让标题有签名感**；你的 `.mono-tag` 现在是 `0.1em`——对了，但字号 11px 偏小，可以提到 12px。

**检查清单**：

| 元素 | 应有字距 | 你现在的 |
|---|---|---|
| h1 `RHINE ARCHIVE OS` | `-0.03em` | `tracking-tight`（-0.025em）✅ 接近 |
| 页脚大字 | `-0.045em` | `tracking-tight` ⚠️ 不够极端 |
| `.mono-tag` | `+0.12em` | `0.14em` ✅ |
| 卡片标题 17px | `-0.01em` | 无 ⚠️ 补 |
| tag chip 10px | `+0.08em` | `0.14em`（继承 mono-tag）⚠️ 略过 |

### 5.3 数字的排印

三者缺一不可：

```css
.numeric {
	font-variant-numeric: tabular-nums;   /* 等宽数字，滚动时不跳 */
	font-feature-settings: "tnum" 1, "ss01" 1;
	font-variant: tabular-nums;
}
```

**`tabular-nums` 现在只在 `Clock` 上有，统计数字没有**——`RollingNumber` 滚动时数字宽度会变，肉眼可见的"抖动"。

**Raycast 的做法值得抄**：全站启用 Inter 的 `ss03`（单层 g），一个字符的差异就成了品牌签名。你的 JetBrains Mono 可以挑一个 stylistic set 用在全站编号上——**这是零成本的"作者签名"**。

### 5.4 去掉渐变文字（第 7 号 AI 味）

**现状**：`RHINE ARCHIVE OS` 的 "ARCHIVE OS" 是 `bg-gradient-to-r from-primary-soft to-#7ea2ff bg-clip-text`。

**问题**：渐变文字是 2020–2024 最典型的 AI 味，且它**用视觉噪音替代了排印层级**。

**改成**：

```tsx
// 方案 A：纯白 + 字重对比（最克制）
<h1 className="font-serif text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-white">
	RHINE <span className="text-[var(--color-ink-soft)]">ARCHIVE OS</span>
</h1>

// 方案 B：纯白 + 一个信号色的句点（方舟式收尾）
<h1 className="...">
	RHINE ARCHIVE OS<span className="text-[var(--color-signal)]">.</span>
</h1>
```

**方案 B 更好**：一个 `2px` 的信号色句点，比整个渐变金句强十倍。**这就是"用排印层级替代视觉噪音"。**

### 5.5 "巨型数字"的修正（第 11 号）

现状：`ARCHIVES 04 / WORDS 8,412 / CATEGORIES 3`，字号 `text-2xl` + `font-display`。

**问题**：这三组数字占了大块横向空间，但它们的信息量极低（04 篇？8441 字？3 个分类？）。

**改成"仪表读数"排版**，而不是"英雄数据"：

```tsx
<div className="flex flex-wrap items-end gap-x-8 gap-y-3 font-mono">
	{[
		{ k: "ARCH", v: posts.length },
		{ k: "WORD", v: totalWords },
		{ k: "CATG", v: categories.size },
	].map((s) => (
		<span key={s.k} className="inline-flex items-baseline gap-1.5">
			<span className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{s.k}</span>
			<span className="text-sm tabular-nums text-[var(--color-ink-soft)]">{String(s.v).padStart(2, "0")}</span>
		</span>
	))}
</div>
```

**变化**：从 `text-2xl font-display`（24px 展示字体）降到 `text-sm font-mono`（14px 等宽）。
**效果**：从"看我数据多漂亮"变成"这是仪表读数"。

> **这就是方舟的做法**：数据永远是小字等宽，排在角落。**没有人用 48px 的公司体展示"我们有 3 个分类"。**

### 5.6 中英混排规则

四条硬规则（v3 已提，这里给执行细节）：

```css
/* 中英混排时，英文的 letter-spacing 需要单独设 */
.mix-text {
	font-feature-settings: "palt" 1;   /* 比例字距，中日文排版必需 */
}
```

| 规则 | 说明 |
|---|---|
| 英文小签永远 uppercase + 正字距 | `tracking-[0.12em]` |
| 同一页英文前缀只用一种 | `//` 用于所有区块小签，`·` 只用于行内分隔，`[ ]` 只用于系列名 |
| 中文不用 `letter-spacing` 的默认值 | 中文小字号需要 `0.02em`（汉字本身是方块，加一点点更"松"） |
| 中英之间加空格 | `RHINE ARCHIVE OS v2 · 系统就绪` ← 用 `·` 分隔而不是直接拼接 |

---

## 6. 动效（克制但有物理感）

### 6.1 时长表（Claude 的标准）

| 类型 | 时长 | 用在哪 |
|---|---|---|
| **微交互** | **100–160ms** | hover 变色、focus ring、图标位移 |
| **位移** | **200–260ms** | 卡片抬起、按钮按下、抽屉 |
| **入场** | **480–560ms** | 卡片淡入、区块 reveal |
| **大转场** | **600–800ms** | 路由切换、hero 揭示 |
| **永不** | > 1000ms | 任何交互反馈 |

**Claude 原话**：`everything transitions in 100–200ms`。

**你的现状**：`.archive-card:hover` 的扫描光是 **600ms** —— 这是"入场"的时长用在了"微交互"上，所以感觉"迟钝又黏"。

### 6.2 缓动：只用三条曲线

```css
@theme {
	/* 出场：快起慢收，最有"物理停车"感 */
	--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
	/* 悬停：出入对称，最中性 */
	--ease-hover: cubic-bezier(0.22, 0.61, 0.36, 1);
	/* 入场：极慢起，用于大区块揭示 */
	--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

**不要用 `ease` / `ease-in-out` 这两个关键字**——它们是浏览器默认值，是最"没有作者"的曲线。

### 6.3 按钮按下 `scale(0.985)`

Claude 的细节：`buttons press down with scale(0.985)`。

**注意是 0.985 不是 0.95**。0.95 是"弹跳"，0.985 是"被手指按下去 1.5%"。

```css
button:active,
.btn:active {
	transform: scale(0.985);
	transition-duration: 80ms;
}
```

**这一个数字，比十个 hover 特效都更能体现"打磨过"。**

### 6.4 交错：`stagger` 110ms

**你的现状**：`<Reveal delay={i * 70}>` —— 70ms 偏快，12 张卡片在 840ms 内全部出完，看起来像"一起涌上来"。

**改成 110ms**：12 张卡在 1320ms 内依次出现，每张有 520ms 的独立表演时间，**"一张一张来"的感觉才成立**。

```tsx
<Reveal delay={i * 110}>
```

**上限**：列表超过 8 项时，从第 9 项起固定 `delay={880}`（8 × 110），否则最后一张要等 1.5 秒。

### 6.5 一次性饱和瞬间（Raycast 的做法）

**给整站一个"只有这一处会很亮"的时刻。**

建议放在 **Hero 的信号色句点**（5.4 方案 B）+ **一处极小的状态灯**。除此之外，全站没有一个地方是"亮"的。

**这就是"稀缺"**：当 95% 的画面是中性色，那 5% 的黄色就变成了"事件"。

### 6.6 动画预算（你的现状 vs 目标）

| 位置 | 现状 | 目标 |
|---|---|---|
| Hero | 阵列滚动 + 指针视差 + blob 呼吸 + 打字机 + 渐变字 | 阵列滚动 + 指针视差 + 打字机（**删 blob、删渐变**） |
| 卡片 hover | 扫描光 600ms + 位移 + 边框 + OPEN 淡入 | 位移 -3px 260ms + 边框 + 阴影（**删扫描光、OPEN 常驻**） |
| 卡片入场 | Reveal 700ms + 70ms stagger | Reveal 520ms + 110ms stagger |
| 页面切换 | 上浮 550ms | 保留 |
| 全站 | 无材质 | **+ 一层静态噪点 + 标题位移扰动** |
| **总动效数** | **5 + 4 + N** | **3 + 2 + N** |

**加了两层材质，减了三处动效。** 这就是"更安静但更有质感"。

---

## 7. 原生 CSS 能力（真·前端实力）

**为什么单列一节**：用户要"展现实力最强的前端实现能力"。而"最强的实现"不是用了最多库，是**用最少的代码做到别人要装库才能做到的事**。

### 7.1 支持度速查（2026 现状）

| 特性 | Chrome | Safari | Firefox | 全球覆盖 | 结论 |
|---|---|---|---|---|---|
| `:has()` | 105+ | 15.4+ | 121+ | **100%** | ✅ 随便用 |
| `@container` | 105+ | 16+ | 110+ | 95% | ✅ 随便用 |
| `oklch()` | 111+ | 15.4+ | 113+ | 93% | ✅ 随便用 |
| `color-mix()` | 111+ | 16.2+ | 113+ | 92% | ✅ 随便用 |
| CSS 嵌套 | 120+ | 17.2+ | 117+ | 92% | ✅ 随便用 |
| `subgrid` | 117+ | 16+ | 71+ | 93% | ✅ 随便用 |
| `light-dark()` | 123+ | 17.5+ | 120+ | ~90% | ✅ 可用 |
| `@property` | 85+ | 16.4+ | 128+ | ~90% | ✅ 可用 |
| `@starting-style` | 117+ | 17.5+ | 129+ | ~88% | ⚠️ 渐进增强 |
| `animation-timeline` | 115+ | 18+ | 134+ | 85% | ⚠️ 渐进增强 |
| View Transitions | 111+ | 18+ | 130+ | 83% | ⚠️ 渐进增强 |
| Anchor positioning | 125+ | 18+ | 131+ | 78% | ⚠️ 必须 `@supports` 兜底 |

**结论**：前 8 项可以今天就上；后 4 项用 `@supports` 包裹做渐进增强。

### 7.2 `:has()` —— 干掉一半状态 JS

**你的 `AppShell` 有 4 个 `useState`**（collapsed / drawer / paletteOpen / dark）。其中至少 1 个可以用 `:has()` 干掉：

```css
/* 侧栏折叠：不需要 JS 记录状态，用 :has() 读 DOM */
.shell:has(.sidebar:hover) { --sidebar-w: 264px; }
.shell:not(:has(.sidebar:hover)) { --sidebar-w: 56px; }
```

**更实用的两个场景**：

```css
/* 1. 表单有错误时，整块变红（不用监听输入）*/
.field:has(input:invalid:not(:placeholder-shown)) {
	border-color: var(--color-danger);
}
.field:has(input:invalid:not(:placeholder-shown)) .hint {
	display: block;
}

/* 2. 卡片内有图片时，自动加内边距（不用判断数据）*/
.archive-card:has(img) { padding-top: 0; }
.archive-card:has(img) .cover { margin: -20px -20px 16px; }
```

### 7.3 `@container` —— 组件级响应式

**你的卡片现在依赖视口断点**（`lg:grid-cols-3`）。但如果卡片被放进侧栏或模态，视口宽度就没意义了。

```css
.archive-card { container-type: inline-size; }

@container (min-width: 320px) {
	.archive-card__title { font-size: 1rem; }
	.archive-card__meta  { display: flex; }
}
@container (max-width: 240px) {
	.archive-card__desc { display: none; }   /* 窄卡片自动省略摘要 */
}
```

**收益**：同一张卡片在列表页（宽）和侧栏（窄）自动呈现不同密度，**不用写两套**。

### 7.4 `animation-timeline` —— 零 JS 的滚动驱动

**替代 `IntersectionObserver` + `rAF`**：

```css
/* 阅读进度条：纯 CSS，零 JS */
@supports (animation-timeline: scroll()) {
	.reading-progress {
		animation: grow linear;
		animation-timeline: scroll(root block);
	}
	@keyframes grow {
		from { width: 0%; }
		to   { width: 100%; }
	}
}
```

```css
/* 区块揭示：进入视口时淡入，离开时反过来（可逆）*/
@supports (animation-timeline: view()) {
	.reveal {
		animation: rise linear both;
		animation-timeline: view();
		animation-range: entry 10% cover 35%;
	}
	@keyframes rise {
		from { opacity: 0; translate: 0 16px; }
		to   { opacity: 1; translate: 0 0; }
	}
}
```

**关键优势**：跑在**合成器线程**，不阻塞主线程，滚动时不掉帧。这是 `IntersectionObserver` 做不到的。

> **渐进增强的写法**：默认用现有的 `Reveal`（opacity 从 1 开始，内容永远可见）；`@supports` 成立时才启用 `animation-timeline` 版。不要反过来。

### 7.5 `@starting-style` —— 干掉"双 rAF hack"

**问题**：给 `display: none → block` 的元素加过渡，必须先等一帧。

```js
// 旧写法（hack）
el.style.display = "block";
requestAnimationFrame(() => requestAnimationFrame(() => {
	el.style.opacity = "1";
}));
```

```css
/* 新写法 */
.dialog {
	opacity: 0;
	transform: scale(0.96);
	transition: opacity 160ms var(--ease-out), transform 160ms var(--ease-out);
}
.dialog[open] {
	opacity: 1;
	transform: scale(1);
	@starting-style {
		opacity: 0;
		transform: scale(0.96);
	}
}
```

**用在**：命令面板（⌘K）、移动端抽屉、Toast。

### 7.6 `oklch` + `color-mix` 派生体系

见 4.4。补充一个实用技巧：

```css
/* 自动生成"可读"的文字色（对比度安全）*/
.auto-readable {
	color: color-mix(in oklch, currentColor 85%, var(--color-bg));
}
```

### 7.7 CSS 三角函数（圆周布局，零 JS）

```css
/* 8 个点围成一圈 —— 不需要 JS 算 sin/cos */
.dial { position: relative; width: 200px; aspect-ratio: 1; }
.dial > i {
	position: absolute;
	--angle: calc(var(--i) * (360deg / 8));
	--radius: 80px;
	top:  calc(50% + sin(var(--angle)) * var(--radius));
	left: calc(50% + cos(var(--angle)) * var(--radius));
	translate: -50% -50%;
	width: 8px; height: 8px;
	background: var(--color-line-strong);
}
```
```html
<div class="dial">
	<i style="--i:0"></i><i style="--i:1"></i>…<i style="--i:7"></i>
</div>
```

**用在哪**：加载指示器、装饰刻度盘、"档案已扫描 8 个区域"的仪式感图形。

### 7.8 `@property` 让自定义属性可插值

**问题**：`--p: 0` → `--p: 100` 的过渡会"跳"而不是"补间"，因为 CSS 把它当字符串。

```css
@property --p {
	syntax: "<number>";
	inherits: false;
	initial-value: 0;
}

.gauge {
	--p: 0;
	background: conic-gradient(var(--color-signal) calc(var(--p) * 1%), transparent 0);
	transition: --p 600ms var(--ease-out);
}
.gauge:hover { --p: 72; }
```

**这是"零 JS 的仪表盘动画"**。用在：统计数字的环形进度、加载态、音量/进度指示。

### 7.9 View Transitions（页面转场）

**Next.js 15 + `view-transition-name`**，不需要 framer-motion：

```tsx
// app/layout.tsx 或模板
export default function Template({ children }: { children: React.ReactNode }) {
	return <div style={{ viewTransitionName: "page" }}>{children}</div>;
}
```
```css
@supports (view-transition-name: none) {
	::view-transition-old(page) { animation: fade-out 180ms var(--ease-out); }
	::view-transition-new(page) { animation: fade-in 260ms var(--ease-out); }
}
```

**注意**：`view-transition-name` 同一时刻必须唯一。全局用 `page` 一个就够。

> 这条与 v3 的 `anime.js 上浮淡入` 二选一。**View Transitions 更省（零 JS），anime 更可控**。建议先试 View Transitions。

---

## 8. 组件细节清单（50 条，可直接改）

### 8.1 导航（Sidebar / Header）

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 1 | `.nav-item` hover 只是 `bg-panel-2` | 左侧 2px `--color-data` 条 + 文字变亮 | 反馈可见，但不改变底色 |
| 2 | `.nav-item.is-active` 紫底胶囊 | 左侧 2px 条 + `font-weight: 600` + 无底色 | 方舟不用"填充胶囊"表示 active |
| 3 | 侧栏 Logo 是紫蓝渐变方块 | 纯 `--color-ink` 方块 + 白字 + 右上角 2px 信号色角标 | 渐变 Logo 是最典型的 AI 味 |
| 4 | `RECENT ARCHIVES` 之后 380px 空白 | 见 v3 的 B4-5（MODULES 宫格） | 空白不是留白，是"没设计" |
| 5 | 顶栏只有 3 组信息 | 左路径 / 中状态灯组 / 右操作 | 三段式才有"仪表盘"感 |
| 6 | 折叠按钮是 `◂ ▸` 字符 | 用 1px 竖线 + 6px 斜角（`clip-path`） | 字符箭头是"通用图标" |
| 7 | 移动端顶条时钟挤压标题 | 小屏只显 `HH:MM` | — |

### 8.2 卡片（ArchiveCard）

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 8 | 3 列等宽等高的 Bento | 3 列但**高度参差**（第 2 张下沉 20px，第 3 张 10px） | 打破"AI 生成的完美网格" |
| 9 | 卡片四角 `rounded-xl` | `rounded-[14px]`（四档制） | — |
| 10 | hover 扫描光 600ms | 删掉，改为 `translateY(-3px)` 260ms + 阴影 | 微交互不该 600ms |
| 11 | `OPEN ▸` 只在 hover 出现 | 常驻 `opacity-40`，hover 到 100% + 位移 2px | 触屏永远看不到 hover |
| 12 | 编号 `DOC.xxx` 和标题字重接近 | 编号 `text-[10px] tracking-[0.18em] opacity-60`，标题 `text-[17px] font-semibold` | "悬崖式"层级 |
| 13 | 摘要和标题色只差一档 | 摘要 `text-[13px] text-ink-soft/75` | 拉大差距 |
| 14 | tag chip 是无圆角小方块 | `rounded-[4px]` + 左侧 2px 信号条 | 见 8.4 |
| 15 | 卡片无顶部封面 | 加 16:9 `CoverArt` 顶部条（已有组件） | 见 v3 的 P1-06 |

### 8.3 列表 / 归档

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 16 | 年份分隔 `2026` 只有 16px | `font-serif text-4xl tracking-[-0.02em]` + 右侧 `flex-1` 刻度线 | 年份是"章节"，不是"标签" |
| 17 | 列表项之间只有间距 | 加 0.5px 分隔线（`color-mix` alpha） | 方舟用线分隔 |
| 18 | 列表无"序号" | 每项左侧加 `01 / 02 / 03`（mono, 9px, opacity-40） | 档案必须有编号 |
| 19 | 空状态只有一行字 | 见 v3 的 B4-1 占位卡 | — |

### 8.4 标签 / 徽章 / 状态

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 20 | tag 是 `rounded border px-1.5 py-0.5` | `rounded-[4px]` + 左侧 2px 信号条 + `tracking-[0.08em]` | 第 9 号 AI 味"状态药丸" |
| 21 | 分类徽标和 tag 长得一样 | 分类用"实底 + 反白"，tag 用"描边" | 层级必须可辨 |
| 22 | 无"状态"概念 | 加 `SYNCED / DRAFT / SEALED` 三态徽标（左侧色条 2px） | 方舟的"状态标记" |
| 23 | 无在线指示 | 顶栏加 `● SYS.ONLINE`（1.5px 圆 + 呼吸） | 见 6.5 |

### 8.5 按钮

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 24 | 主按钮是渐变底 | 纯 `--color-signal` 底 + `#0b0d11` 字 | 渐变按钮 = AI 味第 1 号 |
| 25 | 所有按钮 `rounded-full` | 主按钮 `rounded-[999px]`，次按钮 `rounded-[10px]` | 同档位不混用 |
| 26 | 无按下态 | `:active { transform: scale(0.985) }` | Claude 的细节 |
| 27 | 无 focus 态 | `:focus-visible { outline: 2px solid var(--color-data); outline-offset: 2px }` | 键盘可达性 |
| 28 | 无 loading 态 | 文字替换为 3 个跳动方块（mono 字符 `▮▯▯`） | 不用 spinner |

### 8.6 表单 / 命令面板

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 29 | ⌘K 面板是 `rounded-xl` 玻璃卡 | `rounded-[14px]` + 顶部 1px 信号色细线 | 玻璃要在有"背后内容"时用 |
| 30 | 输入框无边框 | 只有底边 1px（"下划线式"） | 方舟的表单是"填写"，不是"框住" |
| 31 | 结果列表无分组 | 按 `ARCHIVE / PAGE / ACTION` 分三组，组间 0.5px 线 | 见 Claude 的命令面板 |
| 32 | 无快捷键提示 | 每行右侧 `kbd`（`⌘↵`） | — |
| 33 | 空结果只有 `NO RECORD FOUND` | 加一行 `按 ESC 退出，或换个关键词` | 空状态要有出路 |

### 8.7 文章页

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 34 | h1 无衬线 | `font-serif` + `tracking-[-0.02em]` | 见 5.1 |
| 35 | `prose-os h2` 左边 3px 紫线 | 2px `--color-line-strong` + 左侧 2.2rem 处 `01` 编号 | 第 13 号 AI 味"左侧彩条" |
| 36 | 正文 15px / line-height 1.85 | 16px / 1.9 / `letter-spacing: 0.01em` | 长文可读性 |
| 37 | 代码块是 `#0c0e15` 圆角 8px | 保持深色（"One Dark 孤岛"）+ 内部扫描线 + 顶部 1px 信号条 | Claude 的做法 |
| 38 | 无目录 | 见 v3 的 B3-3 | — |
| 39 | 上一篇/下一篇是普通卡 | 改成"档案交接"：`◂ PREV / DOC.xxx` + `NEXT ▸`，边框 0.5px | — |
| 40 | 阅读进度是渐变 2px | 纯 `--color-signal` 3px + 底衬刻度 | 见 3.6 |

### 8.8 页脚

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 41 | 大字 `Leersxie.` 无衬线 | `font-serif` + `tracking-[-0.045em]` + `feDisplacementMap` | 见 2.2 |
| 42 | 三列链接等权重 | 第一列 `NAVIGATE` 12px 字，其余 14px | 层级 |
| 43 | 版权行 `© 2026 ...` | 左侧 `©` 用 `--color-muted`，年份用 `tabular-nums` | — |
| 44 | 无"回到顶部" | 加一个 `↑` + `SCROLL TO TOP`（mono, 10px），固定在右下，滚动 400px 后出现 | — |
| 45 | 页脚顶部是普通 `border-t` | 改成胶片齿孔（`repeating-linear-gradient` 造矩形孔） | 见 9.5 |

### 8.9 空态 / 错误 / 加载

| # | 现状 | 改成 | 为什么 |
|---|---|---|---|
| 46 | 404 是居中大数字 | 改成"档案卡被撕开"（`clip-path` 锯齿）+ 缺口露出点阵 | 见 9.6 |
| 47 | 无加载态 | `BootSequence` 已有；但页面级切换无指示 | 加 3px 顶部进度条（`animation-timeline`） |
| 48 | 图片无占位 | `CoverArt` 生成中显示扫描线加载态（v4 已给代码） | 避免 CLS |
| 49 | 无错误边界 | 加 `error.tsx`，文案用系统口吻 | — |
| 50 | 无"回到上一页" | 404 加次级按钮 | — |

---

## 9. 突破性方案（5 个没人这么做过的）

> 前面 50 条是"改好"，这 5 条是"记住"。每条都给实现路径，都不需要新依赖。

### 9.1 档案卡的"实体厚度"

**想法**：卡片不是"浮在背景上的矩形"，而是**一叠纸里的最上面一张**。hover 时不是"抬起"，而是"被抽出 1/4"。

**实现**：

```css
.stack-card {
	position: relative;
	background: var(--color-panel);
	border: 0.5px solid color-mix(in srgb, var(--color-ink) 14%, transparent);
	box-shadow:
		0 1px 0 0 var(--color-panel-2),          /* 纸边高光 */
		0 2px 0 -0.5px var(--color-line),         /* 第二张纸的边 */
		0 3px 0 -1px var(--color-line);           /* 第三张纸的边 */
	transition: transform 260ms var(--ease-hover), box-shadow 260ms var(--ease-hover);
}
.stack-card:hover {
	transform: translateY(-3px) rotate(-0.35deg);
	box-shadow:
		0 1px 0 0 var(--color-panel-2),
		0 3px 0 -0.5px var(--color-line),
		0 5px 0 -1px var(--color-line),
		0 14px 26px rgb(0 0 0 / 0.4);
}
```

**关键**：三组 `box-shadow` 偏移 1px/2px/3px，形成"三张纸叠着"的侧边。`rotate(-0.35deg)` 是"手抽纸时的自然歪斜"。

**为什么这是突破**：所有卡片库都在做"抬起 + 阴影"，没人做"**厚度**"。而"厚度"恰恰是纸质档案的核心质感。

### 9.2 编号的"打孔"

**想法**：`DOC.261005-GUESTB` 旁边加一个 `clip-path` 打的圆孔 + 一条凹槽，像档案被装订过。

```css
.punched {
	position: relative;
	padding-left: 22px;
}
.punched::before {
	content: "";
	position: absolute;
	left: 0; top: 50%;
	translate: 0 -50%;
	width: 8px; height: 8px;
	border-radius: 50%;
	background: var(--color-bg);
	box-shadow:
		inset 0 1px 2px rgb(0 0 0 / 0.6),      /* 孔的内阴影 */
		0 0 0 1px var(--color-line);            /* 孔的边 */
}
```

**为什么这是突破**：一个 8px 的圆孔，把"编号"从"文字"变成了"**物理对象**"。成本 8 行 CSS。

### 9.3 光标处的"显影"（不是透镜）

**想法**：v4 建议的 Dot Field 是"透镜放大"。但方舟的隐喻不该是"放大镜"，而该是"**显影**"——光标经过的地方，网点从 10% 升到 40%，像感光材料被曝光。

**实现（纯 CSS，不用 Dot Field）**：

```css
.develop {
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 0;
	background-image: radial-gradient(circle, var(--color-ink) 1.1px, transparent 1.4px);
	background-size: 28px 28px;
	opacity: 0.38;
	/* 关键：用光标位置做 mask 的圆心 */
	-webkit-mask-image: radial-gradient(
		circle 260px at var(--mx, 50%) var(--my, 50%),
		black 0%,
		rgb(0 0 0 / 0.55) 40%,
		transparent 100%
	);
	mask-image: radial-gradient(
		circle 260px at var(--mx, 50%) var(--my, 50%),
		black 0%,
		rgb(0 0 0 / 0.55) 40%,
		transparent 100%
	);
}
```
```js
// 10 行 JS，rAF 节流
const el = document.querySelector(".develop");
let x = 50, y = 50, tx = 50, ty = 50;
addEventListener("pointermove", (e) => {
	tx = (e.clientX / innerWidth) * 100;
	ty = (e.clientY / innerHeight) * 100;
});
(function loop() {
	x += (tx - x) * 0.08;
	y += (ty - y) * 0.08;
	el.style.setProperty("--mx", x + "%");
	el.style.setProperty("--my", y + "%");
	requestAnimationFrame(loop);
})();
```

**为什么这是突破**：Dot Field 是"光学"（透镜），这个是"**化学**"（显影）。前者是"看"，后者是"**发生**"。方舟的世界观（源石、感染、结晶化）更接近后者。

**而且成本低**：10 行 JS + 一段 CSS，没有 canvas，没有 24 个 props。

### 9.4 标题的"活字微扰"

已在 2.2 详述。**这是"去 AI 味"最隐蔽的一招**——AI 生成的文字边缘永远矢量般完美，而这招让它有"压印的不均匀"。

**扩展用法**：给**整站标题**用，但 `scale` 分级：

```
h1      scale="3.5"   最明显，一眼看出"印的"
h2      scale="2.2"   轻微
正文    不用          会晕
```

### 9.5 页脚的"胶片齿孔"

**想法**：页脚顶部不是一条线，而是一排 35mm 胶片的齿孔。

```css
.film-perf {
	height: 10px;
	background-image:
		repeating-linear-gradient(
			90deg,
			transparent 0 6px,
			var(--color-line) 6px 14px,
			transparent 14px 20px
		),
		repeating-linear-gradient(
			90deg,
			transparent 0 6px,
			var(--color-bg) 6px 14px,
			transparent 14px 20px
		);
	background-size: 20px 100%, 20px 100%;
	background-color: var(--color-panel-2);
	/* 齿孔是"挖空"的，所以用 bg 色填充 */
	border-radius: 1px;
}
```

**为什么**：胶片齿孔是"**被记录过的证据**"——它在暗示"这一段内容值得被拍下来"。比任何"← back to top"都更有叙事性。

### 9.6 404：被撕开的档案

**想法**：不是"404"，而是一张档案卡从中间被撕开，缺口露出底层的点阵。

```tsx
<div className="relative mx-auto max-w-2xl">
	<div className="grain-paper absolute inset-0" aria-hidden />
	<div className="relative rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel)] p-10">
		<p className="mono-tag mb-3">ERROR / 0x194</p>
		<h1 className="font-serif text-4xl tracking-[-0.02em]">档案缺失</h1>
		<p className="mt-4 text-sm text-[var(--color-ink-soft)]">
			请求的编号不存在，或已在一次重构中被移入深海。
		</p>
	</div>
	{/* 撕口：用 clip-path 作锯齿遮住卡片下半 */}
	<div
		className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[var(--color-bg)]"
		style={{
			clipPath:
				"polygon(0 100%, 0 42%, 4% 58%, 9% 30%, 14% 62%, 19% 24%, 25% 55%, 31% 18%, 38% 60%, 44% 34%, 51% 66%, 58% 28%, 64% 58%, 71% 22%, 78% 56%, 85% 32%, 91% 62%, 96% 40%, 100% 55%, 100% 100%)",
		}}
		aria-hidden
	/>
</div>
```

**为什么**：`404` 是"系统错误码"，"档案缺失"是"世界观事件"。**同样的信息，后者让人记住。**

---

## 10. 参考项目与资源

### 10.1 方舟系（直接可看的代码）

| 项目 | 地址 | 拿什么 |
|---|---|---|
| **ak-ui** ⭐⭐⭐⭐⭐ | https://github.com/YunYouJun/ak-ui<br>文档 https://ak-ui.yyj.moe | 语义 token 契约（`--ak-color-*` / geometry / hierarchy / motion / states）。**不追求像素复刻，把"工业几何+战术信息语言"提炼成约束** |
| **ReEnd-Components** ⭐⭐⭐⭐ | https://github.com/luosky/ReEnd-Components | 终末地风 React + Tailwind。签名件：`TacticalPanel` / `HoloCard` / `ScanDivider` / `HUDOverlay` / `DataStream` |
| **ArknightsGameResource** ⭐⭐⭐⭐ | https://gitcode.com/gh_mirrors/ar/ArknightsGameResource | **1.3 万张官方素材**：`skin/`(1378) `portrait/`(1225) `avatar/`(2200, 180×180) `skill/`(1668) `item/`(1306) `enemy/`(1748) `map/`(3055) + `item_rarity_img/`（r1–r6 稀有度色标）。**只用于学习色彩与构图，不要直接用于线上** |
| **ArknightsUI-React-Template** ⭐⭐⭐ | https://github.com/Cromemadnd/ArknightsUI-React-Template | React 19 + Tailwind。鼠标重力感应 3D 变换的实现 |
| **mashirozx/arknights-ui** ⭐⭐ | https://github.com/mashirozx/arknights-ui | 纯 CSS 布局的经典复刻（346★） |

### 10.2 Claude / GPT 类开发站（学"克制的实力"）

| 项目 | 地址 | 拿什么 |
|---|---|---|
| **Claude Design System** ⭐⭐⭐⭐⭐ | https://github.com/5j54d93/Claude-Design-System | **逆向 claude.ai + claude.com 的完整 token**。"10 Keys to the Claude Look"：暖象牙底 `#faf9f5`、0.5px 发丝线、暗色降字重 600→530、按钮 `scale(0.985)`、蓝=交互/陶土橙=品牌、圆角 8/16/24、代码块永远 One Dark 孤岛、模态 fade+zoom(.95) |
| **fixmyslop / dev-tools.md** ⭐⭐⭐⭐⭐ | https://github.com/bihanikeshav/fixmyslop/blob/main/docs/design-research/distinctiveness/dev-tools.md | **每个站的"签名技法 + 可迁移技法 + 不要抄什么"**。Linear 的"精度即身份"、Vercel 的"以排除塑造品牌"、Raycast 的"一次性色彩预算"、Warp 的"冷暖并置"、Resend 的"科技里用衬线" |

### 10.3 优秀个人站（学"作者感"）

| 站点 | 地址 | 拿什么 |
|---|---|---|
| **Cali.so** | https://cali.so · https://github.com/CaliCastle/cali.so（1.9K★） | 交互与动效的"细节密度"。有完整部署文档 + B 站教程 |
| **onur.dev** | https://onur.dev · https://github.com/suyalcinkaya/onur.dev（2.3K★） | 极简但信息架构极完整（博客/时间轴/书签） |
| **ThoughtLite** | https://ttio.cc · https://github.com/tuyuritio/astro-theme-thought-lite | 轻量博客的"刚好够"标准 |
| **Grain & Grit** | https://chrislemke.github.io/website_designs/designs/Grain_and_Grit.html | 颗粒材质的实现清单（`stitchTiles` / `baseFrequency` 0.5–0.8 / opacity 0.03–0.15 / 移动端降 30–40%） |
| **Grunge Revival** | https://chrislemke.github.io/website_designs/designs/Grunge_Revival.html | "受控的混乱"：结构干净、表面有伤 |

### 10.4 技法文献（理解"为什么"）

| 文章 | 地址 | 核心 |
|---|---|---|
| **Generative design in the browser** | https://www.carmenansio.com/articles/generative-design-browser | `feTurbulence` 是参数空间（baseFrequency=zoom，numOctaves=detail）；动画 baseFrequency 让噪点"呼吸"；`feDisplacementMap scale=4` 让字像活字印刷；CSS 三角函数零 JS 做圆周 |
| **Anti-Slop Checklist** | https://lobehub.com/skills/iankiku-forwward-teams-design | 14 条 AI 味信号 + 具体修法 + 字号/色彩/间距的硬上限 |
| **AI-Generated UI Anti-Patterns** | https://docs.bswen.com/blog/2026-03-20-ai-generated-ui-anti-patterns/ | "Inter 是 AI 的 Comic Sans"；负面约束（明确写 DON'T）比正面描述有效 |
| **10 Tells of Slop UI** | https://www.machucavalley.tech/blog/spot-the-ai-slop-ui | AI 紫 `#7c3aed→#6366f1` 的具体色值；"打磨过的平庸"最危险 |
| **Modern CSS 2026** | https://calmops.com/web/modern-css-features | 11 个生产可用特性的浏览器支持表 |

---

## 11. 优先级（按"性价比"排序）

| 优先级 | 事项 | 章节 | 工时 | 收益 | 风险 |
|---|---|---|---|---|---|
| **P0** | 加全站一层噪点 | 2.1 | 20 min | ★★★★★ | 极低 |
| **P0** | 裁掉渐变文字 + 渐变按钮 + 紫边 | 4.5 | 40 min | ★★★★★ | 低 |
| **P0** | 圆角四档 + 0.5px 发丝线 | 3.1 / 3.2 | 1.5 h | ★★★★ | 低 |
| **P0** | 动画预算（删扫描光、stagger 改 110ms） | 6.6 | 30 min | ★★★★ | 极低 |
| **P1** | 标题 `feDisplacementMap` 微扰 | 2.2 | 40 min | ★★★★★ | 低（只用于 h1） |
| **P1** | 思源宋体做标题 | 5.1 | 1 h | ★★★★ | 低 |
| **P1** | 卡片"实体厚度" | 9.1 | 30 min | ★★★★ | 极低 |
| **P1** | 数字改"仪表读数" | 5.5 | 20 min | ★★★ | 极低 |
| **P1** | 状态色分工（brand/signal/data 拆开） | 4.2 | 1 h | ★★★★ | 中 |
| **P2** | 编号打孔 | 9.2 | 15 min | ★★★ | 极低 |
| **P2** | 光标"显影" | 9.3 | 40 min | ★★★★ | 低 |
| **P2** | 404 撕开档案 | 9.6 | 40 min | ★★★ | 低 |
| **P2** | 页脚胶片齿孔 | 9.5 | 15 min | ★★ | 极低 |
| **P2** | `:has()` 干掉状态 JS | 7.2 | 1 h | ★★★ | 低 |
| **P3** | `animation-timeline` 滚动驱动 | 7.4 | 1.5 h | ★★★ | 中（渐进增强） |
| **P3** | `@starting-style` 替代双 rAF | 7.5 | 1 h | ★★ | 低 |
| **P3** | View Transitions 页面转场 | 7.9 | 1 h | ★★★ | 中 |
| **P3** | `oklch` 色彩系统迁移 | 4.4 | 2 h | ★★ | 中 |

**最小可行（3 小时）**：P0 四项 + 9.1 卡片厚度。做完你会看到"质感"出现。

**完整改造（约 15 小时）**：P0 + P1 + 半个 P2。

---

## 12. 最终验收：去 AI 味的四个测试

### 测试 1 · 盲测
把截图发给一个人，说"这是 AI 做的"。
- 他立刻相信 → **不合格**
- 他犹豫 / 说"看着像人做的" → **合格**

### 测试 2 · 删色测试
把截图转成灰度。
- 如果变得"更好看"或"没差别" → 说明**色彩在替结构说话**，不合格
- 如果变难看 → 说明装饰是必要的（也可能不合格——**结构本身应该撑得住**）
- **理想**：灰度后依然有清晰层级，彩色只是"加分"

### 测试 3 · 三秒测试
打开首页，3 秒内：
- 能说出"这是干什么的" → 合格
- 注意力被某个特效吸引 → 不合格（**特效抢了内容**）

### 测试 4 · 细节测试
把页面放大到 400%，看：
- 边框、圆角、基线是否依然干净 → 合格
- 有没有"1px 错位""阴影断层""圆角不一致" → 不合格

> **四个测试里，测试 2 最难通过。** 因为它逼你承认：你的设计是不是靠颜色撑着的。

---

## 13. 实测验证记录

本文档的核心技法不是抄来的，是**做了对照实验**的。这一节记录什么被验证了、什么被修正了。

### 13.1 实验设置

同一个页面并排渲染两版，用同一份文案与同一套暗色底：

| | A 组（Before） | B 组（After） |
|---|---|---|
| 标题 | 紫蓝渐变无衬线（`bg-clip-text`） | 衬线 + `feDisplacementMap scale=3.4` + 信号色句点 |
| 卡片 | `1px solid #23262e` + `rounded-12px` | `0.5px rgba(233,234,238,.16)` + `rounded-8px` + 三层纸边 |
| 按钮 | 紫蓝渐变胶囊 | 纯 `#f1c644` 胶囊 |
| 纹理 | 无 | `feTurbulence baseFrequency=0.62` + `opacity .055` + `overlay` |
| 分隔 | `1px` 实线 | 刻度（`repeating-linear-gradient`） |
| 标签 | `rounded` + `1px` 边框 | `rounded-4px` + 左侧 2px 信号条 |

截图 1400×760（整体）与 1200×340（细节放大）。

### 13.2 验证结果

| 技法 | 生效 | 备注 |
|---|---|---|
| **衬线标题替代渐变字** | ✅ **差异最大** | 一眼从"模板"变成"编辑物"。这是单点收益最高的一改 |
| **`feDisplacementMap scale=3.4`** | ✅ 生效 | 字母边缘出现极轻微不规则。**放大到 2x 才看得出来，这正是想要的效果** |
| **`feTurbulence` 噪点 0.055** | ✅ 生效 | 背景从"塑料"变"纸"。在 1x 下几乎是"感觉"而非"看见" |
| **0.5px 发丝线 + alpha** | ✅ 生效 | 边框从"画上去的"变成"融进去的" |
| **三层纸边阴影** | ⚠️ **需调参** | 见 13.3 |
| **刻度分隔替代实线** | ✅ 生效 | 从"分隔"变"标尺" |
| **chip 左信号条** | ✅ 生效 | 比纯色 pill 干净得多 |
| **CSS 三角函数圆周布局** | ✅ 生效 | 8 个点零 JS 排成圆，语法 `sin(calc(var(--i) * 45deg))` 可用 |

### 13.3 参数修正（实测后必须改的）

#### ① 深色底上"纸边"要提亮

```css
/* ❌ 原方案：边缘色太接近面板色，看不见 */
box-shadow:
	0 1px 0 0 var(--color-panel-2),      /* #191c23 */
	0 2px 0 -0.5px var(--color-line),    /* #23262e */
	0 3px 0 -1px var(--color-line);

/* ✅ 实测修正：边缘比面板亮两档 */
box-shadow:
	0 1px 0 0 #1f232c,        /* 刚好比面板亮一点 */
	0 2px 0 -0.5px #2c3140,   /* 第二张纸 */
	0 3px 0 -1px #2c3140;     /* 第三张纸 */
```

**规律**：暗色模式下，"厚度"靠**亮**而不是靠**暗**。因为暗色底上加暗 = 看不见。亮色模式反过来（靠暗）。

#### ② 噪点 opacity 的舒适区

| opacity | 观感 |
|---|---|
| 0.03 | 几乎无感，安全但可能白做 |
| **0.055** | **推荐**。能感到"表面"但不干扰阅读 |
| 0.075 | 明显，适合 hero 这种大面积区块 |
| 0.12+ | 开始像"故障"，只适合小面积装饰 |

#### ③ `feDisplacementMap` 的三档

| scale | 观感 | 用哪 |
|---|---|---|
| 2.0 | 几乎看不出，但"不完美"了 | 正文标题 h2 |
| **3.0–4.0** | **"铅字压印"** | h1、页脚大字 |
| 5.5+ | 开始"融化"，有液体感 | ❌ 不用 |

### 13.4 一个被证伪的想法

**"给所有元素加 filter 做统一材质"** —— ❌ 不可行。

`filter` 会创建新的**渲染上下文**（包含层），导致：
- `position: fixed` 的子元素失效（变成相对该元素定位）
- `backdrop-filter` 失效（玻璃变实心）
- 文字抗锯齿变差（尤其小字号）

**结论**：`feDisplacementMap` 只能加在**叶子节点**（h1、页脚大字、404 数字），不能加在容器上。

---



## 附录 · 十条备忘

1. **先删再加。** 你的站命中 8/14 条 AI 味，删掉 4 条比加 4 个特效有用。
2. **材质是最高性价比。** 一层噪点 20 分钟，效果超过一个组件库。
3. **`feDisplacementMap scale=4`** 让文字变成"印上去的"。这是最隐蔽的一招。
4. **一页一个饱和瞬间。** 其余 95% 保持中性，那个饱和才成为"事件"。
5. **色要分工。** 品牌色、信号色、交互色各管一件事，不许串岗。
6. **大字负字距，小字正字距。** 这一条单独就能提升 30% 的设计感。
7. **微交互 100–200ms。** 600ms 的 hover 是"迟钝"，不是"优雅"。
8. **按钮按下 `scale(0.985)`。** 一个数字，胜过十个特效。
9. **别用 `rounded-full` 装扮大元素。** 过度圆角是第 4 号 AI 味。
10. **灰度测试。** 转成黑白还成立，才算真成立。

---

*文档结束 · 14 项自查 → 6 层技法 → 50 条组件 → 5 个突破方案 · 与 v3/v4 互补*

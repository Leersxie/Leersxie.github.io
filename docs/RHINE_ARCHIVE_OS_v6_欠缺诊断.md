# RHINE ARCHIVE OS · 欠缺诊断（v6）

> **诊断时间**：2026-10-25
> **诊断对象**：`H:\Zcode cangku\Leersxie.github.io` @ `ee520e9`（v5 P0+P1 完成后）
> **方法**：1440×1000 / 1440×2400 / 390×844 三档截图 + 源码逐点核对（`AppShell` / `page` / `ArchiveArrayGL` / `globals.css` / `friends` / `archive` / `guestbook` / 404）
> **结论**：v3→v5 的**表面层基本落地**，但暴露出 3 个结构性问题、7 个体验缺口，其中一个是**之前所有文档都没预料到的**——紫色从 CSS 跑进了 WebGL。

---

## 0. 先说改对了什么（12 项，客观记录）

不列这段就无法判断"还剩多少"。以下均已核实生效：

| # | 改动 | 证据 |
|---|---|---|
| 1 | 三层骨架色 token（brand / signal / data）+ 四档圆角 | `globals.css` `@theme` |
| 2 | 渐变文字已删，改为衬线 + 信号黄句点 | `page.tsx:98-101` |
| 3 | 标题"活字压印"（`feDisplacementMap`） | `.type-pressed` 生效，截图可见边缘不规则 |
| 4 | 衬线标题（思源宋体） | 首页 / 归档 / 文章 / 404 都是衬线 |
| 5 | 全站噪点材质 | 截图可见细微颗粒 |
| 6 | 卡片"纸叠厚度"（三层 box-shadow） | 卡片底边有亮线 |
| 7 | 仪表读数替代巨型数字 | `ARCH 01 / WORD 352 / CATG 01` |
| 8 | 侧栏 MODULES 宫格（填补 380px 空白） | 侧栏下半部有 5 个方块 |
| 9 | 顶栏三段式 + 状态灯组 | 左路径 / 中 SYS·ARCHIVE·GISCUS / 右时钟 |
| 10 | 占位卡（解决"看着像坏了"） | 6 张 `DOC.——-PENDING` |
| 11 | 子页双栏头部 + 右侧统计 | 归档页 `1 RECORDS / 352 WORDS / 2026 SPAN` |
| 12 | 翻牌组件（`FlipText.tsx`） | 已建，用在 `/posts/[slug]` |

**评分变化**：AI 味自查从 **8/14 → 4/14**。剩下的 4 条见 §4。

---

## 1. S 级：结构性问题（三个，都影响全站）

### S1 · 全站"上满下空"——内容占 15~30%，其余是空白

**这是当前最刺眼的问题。**

实测（1440 宽）：

| 页面 | 视口高 | 内容实际高度 | 空白占比 |
|---|---|---|---|
| `/` | 2400px | 约 380px（hero 340 + 阵列 180） | **≈ 78%** |
| `/archive/` | 1000px | 约 250px（头部 150 + 1 行列表 40） | **≈ 72%** |
| `/friends/` | 1000px | 约 320px（头部 150 + 2 行卡片 170） | **≈ 65%** |
| `/about/` | 1000px | 约 350px | **≈ 62%** |
| `/guestbook/` | 1500px | 约 700px | **≈ 50%** |
| `/404` | 900px | 约 200px | **≈ 75%** |

**根因不是"内容少"，是三件事叠加**：

```tsx
// ① AppShell.tsx:481 —— main 强制撑满视口，footer 被推到首屏外
<main ref={mainRef} className="min-h-[calc(100dvh-8rem)]">{children}</main>
```
```css
/* ② 每个页面都是"单列居中 + 上方对齐"，下方没有任何"收尾结构" */
```
```tsx
/* ③ 占位卡只填了 2 行（6 张），下面没有承接 */
```

**为什么这条是 S 级**：它让"设计做得好"完全看不出来。用户滚动到第 2 屏看到的是 1600px 纯色，第一反应是"页面没加载完"。

**修法（三步，从轻到重）**：

**Step 1 · 让 footer 上移**（改一行，立刻改善所有页面）
```tsx
// AppShell.tsx:481
// 旧：min-h 撑满，footer 永远在首屏外
<main ref={mainRef} className="min-h-[calc(100dvh-8rem)]">

// 新：只保证"内容区不至于太矮"，footer 自然跟在后面
<main ref={mainRef} className="min-h-[60dvh]">
```
> 副作用：极短页面（404）footer 会紧贴内容。但这比 800px 空白好。

**Step 2 · 加"页面收尾结构"**（每个子页底部加一块，填掉空白）

推荐三种，按页面选：

| 收尾块 | 用在哪 | 内容 |
|---|---|---|
| **NEXT / PREV 导航** | `/archive/`、`/friends/` | "继续浏览 → 关于本站" 的大号链接 + 刻度线 |
| **RSS / 留言 CTA** | 所有子页 | 双按钮 + 一行"订阅或留言" |
| **系统状态块** | `/about/` | 版本 / 构建时间 / 字数 / 分类，四栏仪表 |

```tsx
// components/PageFooterBlock.tsx
export default function PageFooterBlock({
	next,
}: {
	next?: { href: string; label: string; tag: string };
}) {
	return (
		<section className="mx-auto mt-24 max-w-6xl px-6 pb-16">
			<div className="mb-6 flex items-center gap-4">
				<span className="font-mono text-[9px] tracking-[0.2em] text-[var(--color-muted)]">+</span>
				<div className="h-px flex-1 [background:repeating-linear-gradient(90deg,var(--color-line-strong)_0_1px,transparent_1px_8px)]" />
			</div>
			<div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
				<div>
					<p className="mono-tag mb-2">// CONTINUE</p>
					{next ? (
						<a href={next.href} className="group inline-flex items-baseline gap-3">
							<span className="font-serif text-2xl tracking-[-0.02em] transition-colors group-hover:text-[var(--color-signal)]">
								{next.label}
							</span>
							<span className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)]">
								{next.tag}
							</span>
							<span className="font-mono text-sm text-[var(--color-signal)] transition-transform group-hover:translate-x-1">▸</span>
						</a>
					) : (
						<p className="font-mono text-sm text-[var(--color-muted)]">已到最后一页。</p>
					)}
				</div>
				<div className="flex gap-2">
					<a href="/rss.xml" className="rounded-[var(--radius-pill)] border border-[var(--color-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]">RSS</a>
					<a href="/guestbook/" className="rounded-[var(--radius-pill)] border border-[var(--color-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]">留言</a>
				</div>
			</div>
		</section>
	);
}
```

**Step 3 · 首页阵列补满 2 行**（内容问题，但可用占位卡解决）

现在 1 真 + 5 占位 = 6 张，4 列下是 1.5 行。改成 **1 真 + 7 占位 = 8 张**，正好 2 行，视觉完整。

```tsx
// page.tsx
{Array.from({ length: Math.max(0, 8 - posts.length) })...
```

---

### S2 · 紫色没删干净，跑进了 WebGL 层 ⚠️ **本次最重要发现**

**现象**：hero 区现在是一堆**紫色半透明玻璃板**，比改造前的 CSS 渐变更抢眼。截图里它们是明确的紫色块，占据 60% 的 hero 面积。

**我一开始以为是 Dot Field 或阵列卡片，查了三层才找到真凶**：

```tsx
// components/ArchiveArrayGL.tsx
line 66:  const violet = new THREE.PointLight(0x7c5cff, dark ? 26 : 14, 18);
                              //  ↑ 紫色点光源，强度 26（默认值通常 1~2）
line 71:  const grid = new THREE.GridHelper(60, 44, 0x7c5cff, 0x7c5cff);
                              //  ↑ 紫色网格线
line 119: color: dark ? 0x9b85ff : 0xffffff,
                              //  ↑ 玻璃板紫色自发光
```

**这意味着什么**：

> v3/v5 的"删掉紫蓝"只做在 **CSS 层**（token / 渐变 / 文字）。
> 但 `HeroVisual` 在 600ms 后会用 `ArchiveArrayGL`（three.js）接管，而**那个场景里全是硬编码的紫色**。
> 也就是说：**你删掉的紫色，从 CSS 搬到了 WebGL。**

而且 `0x7c5cff` 正是 `--color-brand` 的值——它绕过了 token 系统，直接写死在 TS 里。这是"设计令牌失效"的典型场景：**WebGL 场景无法读 CSS 变量**。

**修法**（三步）：

```tsx
// ① 把颜色从硬编码改成"从 CSS 变量读"
// components/ArchiveArrayGL.tsx 顶部
function cssVar(name: string, fallback: string) {
	if (typeof window === "undefined") return fallback;
	const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return v || fallback;
}
```
```tsx
// ② 光源降强度 + 换中性色
// line 66
const accentHex = new THREE.Color(cssVar("--color-signal", "#f1c644"));
const violet = new THREE.PointLight(accentHex, dark ? 6 : 4, 18);
//  ↑ 26 → 6。26 是"霓虹灯"，6 是"有一束光照过来"

// ③ 网格线改极暗中性色，材质去自发光
// line 71
const grid = new THREE.GridHelper(60, 44, 0x2c3140, 0x2c3140);
// line 119
color: dark ? 0x2a2f3d : 0xffffff,   // 不再用品牌紫
emissive: 0x000000,                    // 如果材质有 emissive，归零
```

**验证标准**：截图后 hero 区**不应出现任何成片的紫色**。点光源颜色只在玻璃板边缘形成一圈极淡的暖色反光。

#### 🔬 对照实验（已做，结论比预想的更激进）

用 `--force-prefers-reduced-motion` 让 `HeroVisual` 跳过能力检测、不加载 GL 场景，再截同一张图。

**结果**：

| | GL 版（动效允许） | CSS 版（禁用动效） |
|---|---|---|
| 视觉效果 | 一堆紫色半透明玻璃板，占 hero 约 60% 面积 | 几乎不可见的细线网格 + 极淡色块 |
| 标题可读性 | 被紫色块干扰 | 干净 |
| 整体气质 | 像"三维产品演示" | 像"档案终端的底纹" |
| 依赖 | +约 1MB three.js | 0 |

**结论：`ArchiveArrayGL` 不只是"带来紫色"，它本身就是视觉噪音的主要来源。**

而 `HeroVisual.tsx` 的编排逻辑恰好证明了它是**可选装饰**：

```tsx
const ok = window.matchMedia("(pointer: fine)").matches &&
           window.innerWidth >= 768 &&
           !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//                                                                  ↑
// 减少动态的用户根本看不到 GL —— 说明 CSS 版才是保底方案。
// 而保底方案在视觉上反而更好，这是危险信号。
```

#### 因此 S2 的修法升级为两个方案

| 方案 | 做法 | 收益 | 代价 | 推荐度 |
|---|---|---|---|---|
| **A（推荐）** | **删掉 `ArchiveArrayGL`**，`HeroVisual` 只保留 CSS 版 | 紫色消失、噪音消失、减包约 1MB、`three` 可移除 | 失去"三维纵深"，但 CSS 版有 `rotateX(58deg)` 伪 3D 视差，观感够用 | ★★★★★ |
| B | 保留 GL，按上面三步调色 + 降光源 | 保留三维感 | 仍需约 1MB 依赖；即使调成中性色，"玻璃板块状感"依然抢标题 | ★★★ |

**方案 A 的具体动作**：

```tsx
// components/HeroVisual.tsx —— 整体简化
import ArchiveArray from "@/components/ArchiveArray";

export default function HeroVisual({ labels }: { labels: string[]; forceDark?: boolean }) {
	return <ArchiveArray labels={labels} />;
}
```
```bash
pnpm remove three @types/three
rm components/ArchiveArrayGL.tsx
```

> **删掉后必须复查**：`ArchiveArray` 现在 `opacity 0.25`，原本是为了给 GL 让位。改成 **0.35**，并确认 `rotateX(58deg)` 透视仍在工作——从禁用动效那张截图看，细线网格是有的，说明 CSS 版本身就在正常渲染。

> **顺带**：`HeroVisual` 现在叠了 **3 层背景**——CSS 阵列 + GL 阵列 + Dot Field。v4 的"一屏一个动背景"纪律被违反了。
> 方案 A 落地后变成 2 层（CSS 阵列 + Dot Field），仍超编 1 层。建议 Dot Field 降到 `opacity 0.5`，或等 CSS 阵列验证后再决定留哪个。

---

### S3 · 移动端横向溢出**未修完**

**现象**（390×844 实测）：

| 元素 | 状况 |
|---|---|
| 顶栏时钟 `09:` | 右侧被裁 |
| `ARCHIVE / HOME` | 右侧被裁 |
| `ARRAY.ACTIVE · 1 UNITS` | 溢出屏幕 |
| 卡片 `DOC.261005-GUESTB` | 右侧 `26` 被裁 |
| 卡片右边缘 | 超出屏幕 |

**根因**：v3 的 P0-01 只修了 **h1 的字号**（改 `clamp`），但没修**容器宽度**。

```tsx
// ① 顶栏：左右两组内容都不可收缩
// AppShell.tsx 移动端顶条
<div className="sticky top-0 z-40 flex items-center justify-between ... px-4 py-2.5 md:hidden">
	<div className="flex items-center gap-2">      {/* ← 没有 min-w-0 */}
		...
		<span className="font-display text-sm font-semibold">{SITE.name}</span>
	</div>
	<div className="flex items-center gap-3">      {/* ← 没有 shrink-0 */}
		<Clock />
		<button ...>菜单</button>
	</div>
</div>
```
```tsx
// ② 阵列底部的刻度行：三段固定文本 + flex-1，小屏装不下
<div className="relative mx-auto flex max-w-6xl items-center gap-4 px-6 pb-6">
	<span>+</span>
	<div className="h-px flex-1 ..." />
	<span className="font-mono text-[9px] ...">ARRAY.ACTIVE · {posts.length} UNITS</span>
	...
</div>
```
```tsx
// ③ 卡片：grid 子项默认 min-width:auto，长内容会撑破
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	<Link className="archive-card ...">   {/* ← 没有 min-w-0 */}
```

**修法**：

```tsx
// ① 顶栏
<div className="flex min-w-0 items-center gap-2">
	...
	<span className="truncate font-display text-sm font-semibold">{SITE.name}</span>
</div>
<div className="flex shrink-0 items-center gap-3">
	<span className="hidden xs:inline"><Clock /></span>   {/* 或只显示 HH:MM */}
	<button ...>
</div>
```
```tsx
// ② 刻度行：小屏隐藏中间文本，只留两端
<span className="hidden font-mono text-[9px] tracking-[0.2em] text-white/25 sm:inline">
	ARRAY.ACTIVE · {posts.length} UNITS
</span>
```
```tsx
// ③ 卡片
<Link className="archive-card group flex h-full min-w-0 flex-col p-5">
```
```tsx
// ④ 全局兜底（globals.css）
body { overflow-x: clip; }
.archive-card { min-width: 0; }
```

**验收**：390px 下执行 `document.documentElement.scrollWidth === 390`，且横向滚动条不出现。

---

## 2. A 级：体验缺口（七个）

### A1 · 文章页没有目录，版心仍 768px

**实测**：`/guestbook/` 正文区 768px（`max-w-3xl`），1440 视口下右侧空 400px。

v3 的 B3-3（右侧 sticky TOC）**没有实现**。

**修法**：见 v3 的 B3-3 代码，直接落地。补充一条——TOC 的入口条件应该是 `h2 ≥ 2` 个（现在 `> 2` 太严，留言板有 3 个 h2 才勉强触发）。

---

### A2 · 顶栏路径在非导航页 fallback 成 `OS`

**现象**：`/guestbook/`、`/404`、`/posts/*` 的顶栏显示 `RHINE ARCHIVE OS / OS`。

**根因**：
```tsx
// AppShell.tsx
<p className="mono-tag">
	{SITE.osName} // {NAV_ITEMS.find((n) => isActive(n.href))?.tag ?? "OS"}
</p>
```
`guestbook` 不在 `NAV_ITEMS` 里 → `find` 返回 `undefined` → fallback 到字符串 `"OS"`。

**修法**：加一层"文章页"判断：

```tsx
const crumb = (() => {
	const nav = NAV_ITEMS.find((n) => isActive(n.href));
	if (nav) return nav.tag;
	if (pathname.startsWith("/posts/") || pathname.startsWith("/guestbook")) return "READING";
	return "NODE";
})();
```
> 顺便：`guestbook` 应该视为 `/archive/` 的子项，面包屑显示 `ARCHIVE / READING` 更准确。

---

### A3 · 翻牌只在 `/posts/[slug]`，留言板没有

**核实**：`FlipText.tsx` 存在，但只被 `app/posts/[slug]/page.tsx` 引用。留言板是独立路由（permalink），所以**它没有翻牌**——而留言板恰好是当前唯一有内容的页面。

**修法**：把 `FlipText` 提到共享位置，`app/guestbook/page.tsx` 也接入。

```tsx
// app/guestbook/page.tsx 顶部
<FlipText text={DOC_ID} duration={0.7} />
```

---

### A4 · 各页 h1 字号不一致

实测：

| 页面 | h1 字号 | 类名 |
|---|---|---|
| `/` | `clamp(2rem,7vw,4.5rem)` | 最大 |
| `/archive/` | 32px | `text-[clamp(2rem,4vw,3.25rem)]` |
| `/friends/` | 26px | 猜 `text-2xl` |
| `/about/` | 26px | 同上 |
| `/404` | 巨型数字，无 h1 | — |

**问题**：`/archive/` 是 32px，`/friends/` 是 26px——**同一层级的页面，标题不一样大**。

**修法**：定义一个 utility，全站子页 h1 统一：

```css
/* globals.css */
@utility page-title {
	font-family: var(--font-serif);
	font-size: clamp(1.75rem, 3.2vw, 2.75rem);
	font-weight: 600;
	line-height: 1.1;
	letter-spacing: -0.02em;
}
```
```tsx
<h1 className="page-title">友链</h1>   // 所有子页统一
```

---

### A5 · 占位卡太"真"，反而强调"只有 1 篇"

**现象**：6 张 `DOC.——-PENDING / NO RECORD / 该档案位尚未写入` 卡，有虚线框 + 两个虚线小方块。视觉重量接近真卡。

**问题**：用户第一眼会想"这些是什么？坏了？"而不是"这里还没写"。

**修法**：**占位卡必须明显"不像卡"**：

```tsx
{/* 改成"档案格"——只有编号 + 一条扫描线，没有卡片形状 */}
<div
	key={`ph-${i}`}
	className="group relative flex min-h-[132px] flex-col justify-end rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)]/60 p-4"
	aria-hidden
>
	<span className="absolute left-4 top-4 font-mono text-[9px] tracking-[0.18em] text-[var(--color-muted)]/40">
		{String(posts.length + i + 1).padStart(2, "0")}
	</span>
	<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]/30">
		PENDING
	</span>
	<div className="mt-2 h-px w-full [background:repeating-linear-gradient(90deg,var(--color-line-strong)_0_1px,transparent_1px_6px)] opacity-40" />
</div>
```

**三个变化**：
1. **删掉 `DOC.——-PENDING` / `NO RECORD` / 中文说明**——全删。只留一个 `PENDING`
2. 只留编号 + 一条刻度线
3. opacity 全降到 30–40%

**效果**：从"6 张假卡片"变成"6 个空格子"。空格子暗示"待填"，假卡片暗示"出错"。

---

### A6 · 色彩分工没有真正落地

**核实**：v5 的 4.2 说"蓝=交互 / 金=状态 / 紫=仅品牌"，但实际：

| 位置 | 现在用的色 | 违反 |
|---|---|---|
| 侧栏 `.nav-item.is-active` | 紫色底 `bg-[var(--accent-dim)]` | ❌ 品牌紫用于交互状态 |
| 友链头像装饰 | `bg-[var(--color-brand)]/25` + `/60` | ❌ 品牌紫用于装饰 |
| 阵列 GL | `0x7c5cff` / `0x9b85ff` | ❌ 见 S2 |
| 顶栏状态灯 | 三个都是 `--color-signal` | ⚠️ 应该区分 ok/idle |
| 404 的 `4` | 紫蓝渐变 | ❌ **第 1 号 AI 味仍在** |

**修法**（逐个）：

```css
/* ① 侧栏 active：移除紫底，改成左侧 data 蓝条 */
.nav-item.is-active {
	background: transparent;                              /* 删掉紫底 */
	color: var(--color-ink);
	font-weight: 600;
	box-shadow: inset 2px 0 0 var(--color-data);          /* 交互色 = data 蓝 */
}
```

```tsx
// ② 友链头像：装饰改中性
<span className="absolute -bottom-2.5 -right-2.5 h-4 w-4 rotate-45 bg-[var(--color-line-strong)]/30" />
<span className="absolute left-0 top-0 h-[2px] w-4 bg-[var(--color-line-strong)]" />
```

```tsx
// ③ 404 的 4：去掉渐变，改纯信号色
<span className="text-[var(--color-signal)]">4</span>
```

```tsx
// ④ 状态灯：ok = signal，idle = muted
<StatusDot label="GISCUS" state={giscusReady ? "ok" : "idle"} />
```

---

### A7 · Hero 雾化带的颜色与面板不一致

**现象**：hero 底部的雾化带用了硬编码 `#141227`，但 `.hero-panel` 的 `background` 已经是 `var(--color-panel)` = `#191b2e`。

```
#141227 = rgb(20, 18, 39)   ← 雾化带
#191b2e = rgb(25, 27, 46)   ← 面板
```

两者差 5 个亮度值，形成一条**比面板更暗的横带**。

**修法**：

```tsx
// page.tsx —— 用与面板一致的颜色
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(to_top,var(--color-panel)_12%,color-mix(in_srgb,var(--color-panel)_86%,transparent)_46%,transparent_100%)]" />
```

> 更好：**直接删掉这个雾化带**。它是为了在 3D 阵列上保护标题可读性，但 S2 修完后（阵列降亮），标题本身就够清楚了。

---

## 3. B 级：打磨（八条）

| # | 问题 | 位置 | 修法 |
|---|---|---|---|
| B1 | 归档页标题 `归档  ·  作战记录` 中间空隙过大 | `archive/page.tsx` | 把 `·` 前后的空格去掉，用 `gap-3` 控制：`<span className="text-[var(--color-line-strong)]">·</span>` 包在 flex 里 |
| B2 | 三个状态灯视觉无差别 | `AppShell.tsx` | `ok` 用 signal + `shadow-[0_0_5px]`，`idle` 用 `bg-muted/40` 且无阴影 |
| B3 | 侧栏 MODULES 5 项排 2 列，第 5 个成孤儿 | `AppShell.tsx` | 改 `grid-cols-2` → 前 4 个一组，第 5 个跨 2 列（`col-span-2`），或直接改成 1 列 5 行 |
| B4 | Giscus 加载中只有 spinner + 文字 | `Giscus.tsx` | 加骨架：3 行灰色圆角条 + 头像圆，`animate-pulse` |
| B5 | 归档页无筛选 / 无三视图 | `archive/page.tsx` | 见 v4 的 2.6（分类胶囊 + grid/list/timeline 切换）。**优先级低**（只有 1 篇） |
| B6 | 关于页信息量不足以撑一页 | `about/page.tsx` | 补三块：技术栈宫格 / 本站数据（构建时间、字数、分类）/ 时间线。见 v4 的 3.5 |
| B7 | 统计 `ARCH 01` 里 `ARCH` 与 `01` 对比过弱 | `page.tsx` | `ARCH` 用 `text-[9px] text-muted/70`，`01` 用 `text-sm text-ink-soft`，拉开字重 |
| B8 | 无"回到顶部" | 全局 | 滚动 400px 后右下出现 `↑ SCROLL TO TOP`（mono 10px），点击平滑回顶 |

---

## 4. AI 味复查：从 8/14 降到 4/14

按 v5 的 14 项清单重测：

| # | 信号 | 状态 | 备注 |
|---|---|---|---|
| 1 | 紫蓝渐变 | **❌ 仍命中** | CSS 删了，但 **WebGL 里有**（S2）+ 404 的 `4` 还是渐变 |
| 2 | 默认字体 | ✅ 已修 | 衬线 + Jost + JetBrains Mono，都有主动选择 |
| 3 | Bento 六宫格 | ⚠️ 部分 | 4 列卡片仍是等权重，但高度有参差（已改善） |
| 4 | 过度圆角 | ✅ 已修 | 四档制落地 |
| 5 | 无理由玻璃拟态 | ✅ 已修 | 只用在顶栏 |
| 6 | 强调色过载 | **❌ 仍命中** | 见 A6，紫还在做交互/装饰 |
| 7 | 渐变文字 | **❌ 仍命中** | 404 的 `4`（hero 已修） |
| 8 | 动画疲劳 | ✅ 已修 | 扫描光删除，stagger 110ms |
| 9 | 状态药丸 | ✅ 已修 | tag 改 4px 圆角 + 左信号条 |
| 10 | 居中堆叠 | **❌ 仍命中** | 404 完全居中；about 居左但无编排 |
| 11 | 巨型数字 | ✅ 已修 | 改了仪表读数 |
| 12 | 图标顶置 | ✅ 未命中 | — |
| 13 | 左侧彩条 | ⚠️ 部分 | `.prose-os h2` 的 2px 竖线，但**没有编号**（v5 的 A.3 建议 `01`） |
| 14 | 模板脸 | ✅ 已修 | 辨识度明显提升 |

**剩下的 4 条**：#1（WebGL + 404）、#6（色彩分工）、#7（404）、#10（404 居中）。

**注意**：**4 条里有 3 条集中在 404 页**。也就是说，404 是全站唯一的"A 味重灾区"——它没参与改造。

---

## 5. 修复优先级

| 顺序 | 事项 | 章节 | 工时 | 收益 | 风险 |
|---|---|---|---|---|---|
| **1** | 处理 GL 场景（删 或 改 3 个数） | S2 | 20 min | ★★★★★ | 低 |
| **2** | `min-h` 改 60dvh + 加收尾块 | S1 Step 1-2 | 1.5 h | ★★★★★ | 低 |
| **3** | 移动端溢出四处 `min-w-0`/`shrink-0` | S3 | 40 min | ★★★★★ | 极低 |
| **4** | 占位卡简化成"空格子" | A5 | 20 min | ★★★★ | 极低 |
| **5** | 404 页重做（去渐变 + 去居中） | §4 | 1 h | ★★★★ | 低 |
| **6** | 色彩分工落地（四处） | A6 | 40 min | ★★★★ | 低 |
| **7** | 文章页加 TOC | A1 | 1.5 h | ★★★★ | 低 |
| **8** | 顶栏面包屑 fallback | A2 | 10 min | ★★★ | 极低 |
| **9** | 子页 h1 统一 utility | A4 | 20 min | ★★★ | 极低 |
| **10** | 删/修 hero 雾化带 | A7 | 10 min | ★★★ | 极低 |
| **11** | 翻牌覆盖留言板 | A3 | 15 min | ★★ | 极低 |
| **12** | B 级八条 | §3 | 2 h | ★★ | 极低 |

**最小可行（约 1 小时）**：第 1 + 3 + 4 项。

**为什么第 1 项排最前**：它 20 分钟，改 3 个数字，但影响的是**首屏最大面积**。而且这是"紫色从 CSS 逃到 WebGL"这个认知盲区——修完它，才算是真的把紫色删了。

---

## 6. 一个方法论教训

这次检查暴露出一个值得记下的问题：

> **设计令牌（CSS 变量）在 WebGL / Canvas / 内联样式里会失效。**
> 任何"改 token 就全站生效"的假设，在 three.js 场景、`<canvas>`、以及硬编码的 `0xRRGGBB` 面前都不成立。

v3→v5 三份文档都在 CSS 层做设计治理，**没有一份提到要扫 WebGL 层**。结果是：CSS 干净了，视觉上紫色反而更浓。

**给后续改造的检查清单**：

```bash
# 每次改配色后跑一遍，确认没有硬编码颜色漏网
grep -rn "0x[0-9a-fA-F]\{6\}" components/ app/ | grep -v "0x000000\|0xffffff"
grep -rn "#[0-9a-fA-F]\{6\}" components/ app/ | grep -v "globals.css"
```

---

## 附录 · 三张截图对应的问题速查

| 截图 | 一眼能看到的 | 对应章节 |
|---|---|---|
| `n_home` 1440×1000 | 紫色玻璃板堆、hero 偏矮 | S2 |
| `n_full` 1440×2400 | **1600px 纯空白** | S1 |
| `n_mobile` 390×844 | 时钟被裁、卡片右裁 | S3 |
| `n_archive` | 列表只有 1 行、下方空白 | S1 / B1 |
| `n_guest` | 无 TOC、版心偏窄、`/ OS` | A1 / A2 / A3 |
| `n_fr` | 头像紫装饰、下方空白 | A6 / S1 |
| `n_ab` | 信息量不足撑一页 | B6 |
| `n_404` | 紫蓝渐变 `4`、居中堆叠 | §4 |
| `n_noGL` | **禁用 GL 后的 hero**：紫色消失、网格细线、标题干净 | S2 对照实验 |

---

*诊断结束 · 3 个 S 级 / 7 个 A 级 / 8 个 B 级 · 最小可行 1 小时*

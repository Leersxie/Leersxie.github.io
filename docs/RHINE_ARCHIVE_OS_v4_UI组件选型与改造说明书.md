# RHINE ARCHIVE OS · UI 组件选型与改造说明书

> **文档性质**：`RHINE_ARCHIVE_OS_v3_设计升级规格书.md`（下称 v3）的**续篇**。v3 解决"该长什么样"，本文档解决"用什么现成件来实现、怎么改造才不变味"。
> **目标仓库**：`H:\Zcode cangku\Leersxie.github.io`
> **技术栈实测**：Next.js 15.5.28 · React 19 · **Tailwind v4.0.9** · `motion@11.18.2` · `animejs@4.5.0` · `three@0.186.1` · `output: "export"` · `trailingSlash: true` · 无 `components.json`
> **编写日期**：2026-10-24

---

## 0. 先读这一节

### 0.1 这 6 个站不是平级的

你拿到的那份清单把它们并列成"6 个宝藏网站"，但实际能力差三个量级。按**能直接变成本项目代码**的比例排序：

| 级别 | 站点 | 能给你的 | 落到本项目的比例 |
|---|---|---|---|
| **A · 出代码** | React Bits | 217 个 React 组件，含 TS+Tailwind 变体，源码可复制 | 约 35% 可用 |
| **A · 出代码** | Aceternity UI | 118 个免费组件 + 基于 Motion，与 `motion@11` 同源 | 约 30% 可用 |
| **A · 出代码** | Uiverse | 纯 HTML/CSS 微件，无框架依赖 | 约 15% 可用 |
| **B · 出能力** | Anime.js | 项目已在用，但只用了 15% 的能力 | 全部可用 |
| **C · 出灵感** | MotionSites | AI 生成的 section 案例 + 提示词 | **不建议抄视觉** |
| **C · 出灵感** | Showreel.design | **动效师视频作品集**，不是网页站 | 只抄节奏 |

**结论**：真正要花时间的是前 4 个。后 2 个各给你一样东西就够——一个"section 类型清单"，一个"节奏感"。

### 0.2 两处必须先纠正的认知

#### 纠正 1 · Showreel.design 不是网页 UI 站

清单写的是「全球顶尖设计工作室作品，快速提取网站视觉风格」。**实际是 motion design 行业的人才 showreel 托管站**，首页全是动画师个人作品视频。

实测页面结构：
```
分类标签：Entertainment & Media / Advertising & Commercial / Tech & SaaS
风格标签：Hand-drawn / 3D-CGI / Bold-Vibrant / Minimal-Clean / Sound-Design-Focused
音乐标签：Hip-hop-Urban / Rock-Energetic / Electronic-Synth / Orchestral-Classical / Jazz-Acoustic
内容：Billy Mpetha 2D Animation Reel / Cub Studio Showreel / Animade Reel 2026 / ...
```

它**不能**给你网站视觉风格，但能给你一件东西：**motion designer 的节奏**。动画师对"何时快、何时停、何时切"的直觉，比 UI 开发者强一个量级。

**用法**：只看 `Minimal / Clean` 标签下的 reel，观察三件事——① 一个动作从静止到终态用几帧；② 两个动作之间留多久空白；③ 缓入缓出谁长谁短。这三件事直接对应 v3 里的 `--ease-os` / `--dur-base` / `stagger` 参数。

#### 纠正 2 · MotionSites 的审美恰恰是你要避免的

清单写的是「AI 网页灵感合集，热门案例和提示词直接参考」。

实测它的案例命名：`EMBER.dsgn` / `RIVR` / `Nodus Agent` / `NOVA Space Systems` / `Finlytic AI Agent` / `Aetheris Voyage`——清一色 SaaS/AI 产品落地页，视觉特征是：**超大标题 + 紫蓝渐变 + 光晕球 + 玻璃卡片 + 滚动视差**。

**这正是 v3 诊断出你博客当前的问题**（饱和色过多、渐变滥用、视觉重心涣散）。照它抄，等于把病加重。

**它唯一可用的价值**：`section` 类型清单。它把落地页拆成 `Hero / Features / Pricing / CTA / Testimonials / Logo Cloud / Footer / Backgrounds`，这份拆法是成熟的。**用在信息架构上，不用在视觉上。**

### 0.3 三个技术硬约束（决定"怎么接"）

实测项目配置后，有三个约束会直接影响组件接入方式，**先记住，后面所有安装命令都基于它**：

| 约束 | 实测 | 后果 |
|---|---|---|
| **无 `components.json`** | `ls components.json` → 不存在 | `npx shadcn add` 跑不了。**不要跑 `npx shadcn init`**——它会往 `globals.css` 注入整套 shadcn 变量，和你的 `@theme` 体系打架。**改为手动复制源码**（见 6.4） |
| **Tailwind v4.0.9** | `"tailwindcss": "^4.0.9"` | 这两个库的 Tailwind 变体大量使用 v3 类名。粘贴后必须做类名转换（映射表见 6.1） |
| **`output: "export"`** | `next.config.mjs:4` | 纯静态导出。组件不能含 API route / Server Action / `next/headers`。Aceternity 部分组件用了 `next/image`，本项目已设 `images.unoptimized`，需手动改回 `<img>` |

**已具备的依赖**（好消息，三个库的底层都不缺）：
```
motion@11.18.2   → Aceternity 的动画内核，已装
animejs@4.5.0    → v4 语法，已装
three@0.186.1    → React Bits 的 3D 组件可用，已装
```

---

## 1. 六个站的真实定位

| 站点 | 地址 | 实际是什么 | 给你的具体东西 | 优先级 |
|---|---|---|---|---|
| **Anime.js** | https://animejs.com | 全功能 JS 动画引擎 v4 | `onScroll` / `createDrawable` / `createScope` / `createSpring` / `createMotionPath` / `createDraggable`，且**模块化按需引入** | ★★★★★ |
| **React Bits** | https://reactbits.dev | 217 个 React 动画组件 + 5 个可视化工具 | `Dot Field`（24 props）、`Line Waves`、`Text Animations`、`Grainient`、`Beams`、`Radar` | ★★★★★ |
| **Aceternity UI** | https://ui.aceternity.com | 118 免费组件 + 183 blocks，React + Tailwind + Motion | `Text Flipping Board`（翻牌）、`3D Card Effect`、`Wobble Card`、`Background Beams`、`Liquid Glass` | ★★★★ |
| **Uiverse** | https://uiverse.io | 社区 UI 微件库，HTML/CSS/Tailwind/React/Figma 五种导出 | Loader、Toggle、Tooltip、Input、Background Patterns | ★★★ |
| **MotionSites** | https://motionsites.ai | AI 生成落地页 section 案例 + 提示词（付费） | **只取 section 类型清单**，视觉不要抄 | ★★ |
| **Showreel.design** | https://showreel.design | 动效师视频作品集托管站 | **只取节奏感**，看 `Minimal/Clean` 标签 | ★★ |

### 1.1 延伸：清单没提但同样对口的两个

既然你已经在这条线上，补两个**比清单里后两个更该收藏**的：

| 站点 | 地址 | 为什么更值得 |
|---|---|---|
| **Motion Primitives** | https://motion-primitives.com | 专注 motion 的 React 组件库，风格比 Aceternity 克制，更接近"工具感"而非"营销感" |
| **21st.dev** | https://21st.dev | 组件聚合 + 社区，可对比同一组件的多种实现，适合挑"最不油"的那版 |

---

## 2. 准入规则（这一节最重要）

**为什么先立规矩**：这三个库的共同特征是"每一个组件单独看都很漂亮"，堆在一起就是灾难。你的项目已经因为"饱和点太多"被诊断过一轮，再来一堆炫技组件，等于白改。

### 2.1 五条准入标准

一个组件要进你的项目，必须同时满足：

| # | 标准 | 检验方式 |
|---|---|---|
| 1 | **能降到"几乎看不见"** | 有一个参数能把它压到 opacity ≤ 0.2 或 scale ≤ 0.05 而不崩。压不下去的组件，说明它靠"强度"撑起审美，不适合做背景 |
| 2 | **不引入新的饱和色** | 组件的默认色必须是可覆盖的 prop。若硬编码紫色渐变且不可改，弃用 |
| 3 | **静态时也成立** | 关掉动画后（`prefers-reduced-motion`），视觉不塌。靠动效才能看的一律弃用 |
| 4 | **零额外运行时** | 源码复制进项目，不新增 npm 依赖（`motion` / `three` / `animejs` 已有的除外） |
| 5 | **移动端可关闭** | 有 `interactive` 或类似开关。触屏上不能触发的，必须能降级为静态 |

### 2.2 禁用清单（明确写出来，防止 GLM 发挥）

以下类型的组件**一律不进本项目**，无论多好看：

```
❌ Cursor 跟随类：Blob Cursor / Splash Cursor / 自定义光标
   理由：v3 已判定"自定义光标"是 ignoredone 的一个过度设计，你的项目有 6 个页面需要精确点击，
        换成圆形光标会降低可用性。且触屏完全无意义。

❌ 粒子 / 球池 / 光晕球：Ballpit / Antigravity / Magic Rings / 大型光晕
   理由：与"档案系统"的冷峻人设冲突。方舟从不使用粒子球。

❌ 3D 倾斜卡片（原版）：3D Card Effect / Wobble Card 的默认强度
   理由：方舟的卡片是平面矩形 + 1px 描边。3D 倾斜是"产品发布会"语言。
        可改造为 ±1.5deg 的微倾（见 3.3.2），但不能用默认的 10deg+。

❌ Neumorphism / 3D Buttons / Glow Buttons（Uiverse）
   理由：新拟物与方舟的"硬边 + 平涂"完全相反。

❌ 全屏视差多层滚动
   理由：CLS 与性能杀手，且与"档案阵列"已有的视差重复。

❌ 任何"渐变文字 + 发光"的标题组合
   理由：v3 已指出 Hero 标题的渐变是唯一允许的渐变，不能再加第二处。
```

### 2.3 一条数量纪律

> **同一屏内，最多 1 个"会动的背景层" + 1 个"会动的强调元素"。**

现有一屏已经有的动效：
- Hero：`ArchiveArray` 5 列滚动 + 指针视差 + `blob-morph` 呼吸
- 卡片：`::before` 扫描光 + hover 位移
- 全局：`os-grid` 静态网格

**这已经超编了。** 所以引入 Dot Field 时，**必须同时删掉 `ArchiveArray` 或 `os-grid` 中的一个**，否则又是一轮视觉噪音。

具体取舍见 4.2。

---

## 3. 逐站提取

### 3.1 Anime.js —— 项目只用了 15% 的能力

#### 现状盘点

`grep` 项目实际用法：
```
components/AppShell.tsx:  import("animejs").then(({ animate }) => ...)   → animate
components/BootSequence.tsx: import("animejs").then(({ animate, stagger })) → animate + stagger
```

**用到 2 个 API，实际有 11 个模块。**

#### 官方模块与体积（实测自首页）

| 模块 | 增量体积 | 用途 | 你用了吗 |
|---|---|---|---|
| `Timer` | 5.60 KB | 时间轴基础 | ✅ 隐含 |
| `Animation` | +5.20 KB | `animate()` | ✅ |
| `Timeline` | +0.55 KB | `createTimeline()` 编排 | ❌ |
| `Animatable` | +0.40 KB | 可中断动画对象 | ❌ |
| `Draggable` | +6.41 KB | 拖拽 + 弹簧吸附 | ❌ |
| `Scroll` | +4.30 KB | `onScroll()` 滚动联动 | ❌ **最该补** |
| `Scope` | +0.22 KB | 响应式 + 作用域 | ❌ **该补** |
| `SVG` | +0.35 KB | `createDrawable` / `morphTo` / `createMotionPath` | ❌ **该补** |
| `Stagger` | +0.48 KB | `stagger()` | ✅ |
| `Spring` | +0.52 KB | `createSpring()` | ❌ |
| `WAAPI` | +3.50 KB | Web Animations API 桥接 | 不需要 |

**关键洞察**：`Scope` 只加 0.22KB、`SVG` 只加 0.35KB、`Stagger` 0.48KB——**这三个加起来不到 1.1KB，却能换掉现有的两套手写逻辑**。

#### 3.1.1 用 `onScroll` 替换 `IntersectionObserver`（省代码、更准）

现状：`components/Reveal.tsx`（52 行）用 `IntersectionObserver` 做滚动入场。

**先看清它现在的设计意图**（源码注释原文）：

```tsx
/**
 * 滚动显现：进入视口后 anime.js outExpo 上浮淡入。
 * SSR 默认可见（无 JS 不丢内容）；JS 可用时先隐藏再动画。
 */
```
```tsx
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
el.style.opacity = "0";        // ← 只有 JS 跑到了这里，才会隐藏
```

**这个"先证明 JS 可用，再隐藏"的写法是正确的渐进增强，改造时必须保留。** 任何写成 `style={{ opacity: 0 }}` 的版本都是错的——JS 失败时内容永久不可见。

Anime.js v4 的 `onScroll()` 是一个 **ScrollObserver**，作为 `autoplay` 传入：

```js
import { animate, onScroll, stagger } from "animejs";

animate(".reveal-item", {
	opacity: [0, 1],
	y: [16, 0],
	duration: 520,
	ease: "outExpo",
	delay: stagger(60),
	autoplay: onScroll({
		enter: "bottom 90%",   // 元素顶边到达视口 90% 处时触发
		sync: false,           // true = 进度绑定滚动位置；false = 一次性播放
	}),
});
```

**两种模式，各自对应一个场景**：

| 模式 | `sync` | 效果 | 用在哪 |
|---|---|---|---|
| **一次性** | `false` | 进入视口播完就停 | 卡片入场、标题淡入 |
| **进度绑定** | `true` | 滚动多少、动画走多少 | 阅读进度条、章节标题视差、Hero 缩放 |

**改造后的 `Reveal.tsx`（保留渐进增强）**：

```tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * 滚动显现：用 anime.js v4 的 ScrollObserver 替代手写 IntersectionObserver。
 * SSR 默认可见（无 JS 不丢内容）；JS 可用时先隐藏再动画。
 */
export default function Reveal({
	children,
	delay = 0,
	y = 18,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	y?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let cancelled = false;
		let kill: (() => void) | null = null;

		import("animejs").then(({ animate, onScroll }) => {
			if (cancelled || !ref.current) return;

			el.style.opacity = "0"; // 确认 JS 可用后才隐藏

			const animation = animate(el, {
				y: [y, 0],
				opacity: [0, 1],
				duration: 700,
				delay,
				ease: "outExpo",
				autoplay: onScroll({ enter: "bottom 92%" }),
			});

			kill = () => {
				animation?.revert?.();
				el.style.opacity = "";
			};
		});

		return () => {
			cancelled = true;
			kill?.();
		};
	}, [delay, y]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
```

> **⚠️ 实测要求（B5 必做）**：Anime.js v4 的 `onScroll()` 返回的 ScrollObserver 在组件卸载时是否需要显式清理，各小版本行为不一致。上面的 `animation?.revert?.()` 用了可选链兜底。
> **验证方法**：在 `/archive/` 页面反复切换路由 20 次，在 DevTools Performance 里看 `requestAnimationFrame` 回调数是否持续累积。若累积，说明需改用 `createScope` 包裹并 `scope.revert()`（见 3.1.3）。
> **如果 v4 的 onScroll 在你的版本上行为不稳，直接保留现有 IntersectionObserver 实现——它不是问题，收益有限，不要为了"用上新 API"引入风险。**

**诚实评估这次改造的收益**：
- ✅ 少一个 `{ threshold: 0.12 }` 的魔法数字，改用语义化的 `"bottom 92%"`
- ✅ 为后续 `sync: true` 的进度绑定铺路（章节标题视差、Hero 缩放这类场景用得上）
- ❌ **不是"40 行改 8 行"** —— 渐进增强 + 清理逻辑保留下来，行数几乎不变
- ❌ 不带来肉眼可见的视觉提升

**所以：这一项优先级低于 3.1.2 和 3.1.3。如果时间紧，跳过。**

#### 3.1.2 用 `createDrawable` 重写 BootSequence 的描线

现状：`BootSequence.tsx:65-70` 用 `strokeDashoffset: [100, 0]` + `pathLength={100}` 手动做 SVG 描线。

Anime.js 的 `createDrawable` 是**专用 API**，自动处理 `stroke-dasharray/offset` 与总长度，不需要手动归一化：

```js
import { animate, createDrawable, stagger } from "animejs";

animate(createDrawable(".boot-logo path"), {
	draw: ["0 0", "0 1"],       // 从 0% 画到 100%
	delay: stagger(160, { start: 420 }),
	duration: 640,
	ease: "outQuart",
});
```

**收益**：删掉 `pathLength={100}` / `strokeDasharray={100}` 两个 hack 属性，SVG 可以正常缩放而不影响描线长度。

#### 3.1.3 用 `createScope` 做响应式动画（替代 JS 里判断 `window.innerWidth`）

现状：`ArchiveArray.tsx:49` 用 `window.innerWidth >= 768` 判断是否启用 GL 版；`HeroVisual.tsx:48-50` 同样。

`createScope` 把媒体查询写进动画定义，**一个 API 管住"什么屏幕播什么动画"**：

```js
import { createScope, animate, stagger } from "animejs";

const scope = createScope({
	root: heroRef.current,
	mediaQueries: {
		mobile: "(max-width: 767px)",
		desktop: "(min-width: 768px)",
		reduced: "(prefers-reduced-motion: reduce)",
	},
}).add(({ matches }) => {
	if (matches.reduced) return;                  // 减少动态：什么都不做

	if (matches.mobile) {
		// 移动端：只做一次性淡入，不滚动
		animate(".array-col", { opacity: [0, 1], duration: 400 });
		return;
	}

	// 桌面端：保留视差与滚动
	animate(".array-col", {
		y: ["0%", "-50%"],
		duration: stagger(200),
		loop: true,
		ease: "linear",
	});
});

return () => scope.revert();   // 卸载时清理，比手写 removeEventListener 更彻底
```

**收益**：三个判断（移动端 / 桌面 / 减少动态）从"三处分散的 if"收敛成"一个 scope 配置"，且 `scope.revert()` 自动清理所有动画实例。

#### 3.1.4 三个"看情况用"的 API

| API | 用在哪 | 判断 |
|---|---|---|
| `createSpring()` | 命令面板开合、抽屉滑出 | **值得**。弹簧比 cubic-bezier 更"物理"，`{ stiffness: 120, damping: 18 }` 就够，别用官方 demo 的 `damping: 6`（太弹） |
| `createMotionPath()` | 未找到场景 | 弃用。你的 UI 没有"物体沿路径运动"的需求 |
| `createDraggable()` | 未找到场景 | 弃用。+6.41KB，且触屏拖拽与滚动冲突 |

---

### 3.2 React Bits —— 首选，但 217 个里最终只用 4 个

**规模**：217 个组件，50.1K stars，五个分类（Backgrounds / Text Animations / Animations / Components / Micro），每个组件提供 **4 种变体**：`JS+CSS` / `TS+CSS` / `JS+Tailwind` / `TS+Tailwind`。

**对你最重要的两个能力**：
1. **四种变体** → 你选 `TS+Tailwind`，直接就是 TypeScript + className，不需要改造
2. **零运行时** → 源码复制进项目，不 lock-in（官方原话："No wrapper library, no runtime dependency"）

#### 3.2.1 Dot Field —— 本文档最重要的一个组件

这是**你 hero 区缺的那块拼图**。

**它解决的问题**：v3 里我建议删掉 `os-grid`（48px 网格线）因为它和 `ArchiveArray` 打架；同时建议用 `mask-image` 开洞（ignoredone 的技法）来加"探照灯"隐喻。而 **Dot Field 一个组件同时满足这两件事**——它是"点阵 + 鼠标透镜"。

**官方描述**：`A gradient dot field seen through a lens that follows the cursor, magnifying, pinching or swirling the dots.`

**完整 props（24 个，实测自文档）**：

| prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `dotRadius` | number | `1.5` | 每个点的半径（px） |
| `dotSpacing` | number | `14` | 点间距（px） |
| `pattern` | `'grid' \| 'hex' \| 'spiral' \| 'scatter'` | `'grid'` | 排布方式 |
| `gradientFrom` | string | `'#5227FF'` | 渐变起始色 |
| `gradientTo` | string | `'#FF9FFC'` | 渐变结束色 |
| `gradientAngle` | number | `135` | 渐变角度（同 CSS linear-gradient） |
| `cursorRadius` | number | `240` | 跟随光标的透镜半径 |
| `bulgeStrength` | number | `0.6` | 透镜放大强度，-1~1，负值收缩 |
| `twist` | number | `0` | 光标周围旋涡角度 |
| `glowColor` | string | `'#ffffff'` | 透镜内点的发光色 |
| `glowRadius` | number | `160` | 发光半径，0 关闭 |
| `glowIntensity` | number | `0.8` | 发光强度 |
| `baseOpacity` | number | `0.55` | 透镜外的点透明度 |
| `waveAmplitude` | number | `0` | 缓慢波动幅度（px），0 = 完全静止 |
| `sparkle` | boolean | `false` | 少数点随机闪烁（星点） |
| `speed` | number | `1` | 波动与闪烁速度 |
| `interactive` | boolean | `true` | 是否跟随光标，`false` = 纯环境层 |
| `holdToZoom` | boolean | `true` | 长按加深透镜 |
| `intro` | boolean | `true` | 挂载时"拉入聚焦" |
| `lightMode` | boolean | `false` | 亮色模式（点作为墨色） |
| `opacity` | number | `1` | 整体透明度 |
| `maxDevicePixelRatio` | number | `2` | 最高像素比 |
| `className` | string | `''` | 容器类名 |
| `style` | CSSProperties | — | 内联样式 |

**渲染方式**：Canvas（非 DOM 点），`maxDevicePixelRatio: 2` 限制清晰度换取性能。

---

**方舟化配方（核心交付物）**

默认参数是"AI 产品落地页"味（紫到粉渐变、强发光、强放大）。要变成"档案终端"味，需要做五处改造：

```tsx
// components/DotFieldBackdrop.tsx
"use client";
import DotField from "@/components/reactbits/DotField";

export default function DotFieldBackdrop({ light = false }: { light?: boolean }) {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<DotField
				/* —— 几何：复刻 ignoredone 的 34px 网格 / 1.5px 点径 —— */
				dotRadius={1.15}
				dotSpacing={34}
				pattern="grid"

				/* —— 配色：去掉渐变，用单色 + 极低对比 —— */
				gradientFrom={light ? "rgba(17,19,24,0.10)" : "rgba(233,234,238,0.13)"}
				gradientTo={light ? "rgba(17,19,24,0.04)" : "rgba(233,234,238,0.05)"}
				gradientAngle={180}
				glowColor="#f1c644"        /* 信号黄，替代默认白光 */
				glowRadius={190}
				glowIntensity={0.30}       /* 0.8 → 0.30，只留一点点温度 */
				baseOpacity={0.34}

				/* —— 透镜：从"放大镜"降为"极轻的呼吸" —— */
				cursorRadius={280}
				bulgeStrength={0.22}       /* 0.6 → 0.22，克制到几乎察觉不到 */
				twist={0}                  /* 关闭旋涡，方舟不玩旋 */
				holdToZoom={false}         /* 关闭长按，去掉玩具感 */

				/* —— 运动：留给 ArchiveArray，这里只做静态呼吸 —— */
				waveAmplitude={1.5}
				sparkle={false}
				speed={0.5}

				interactive
				intro
				lightMode={light}
				opacity={0.85}
				maxDevicePixelRatio={2}
			/>
		</div>
	);
}
```

**五处改造的理由**：

| 参数 | 默认 | 改为 | 为什么 |
|---|---|---|---|
| `dotSpacing` | 14 | **34** | 34px 是 ignoredone 实测的网格值，也是方舟常见的"稀疏点阵"密度。14px 太密，会变成噪点壁纸 |
| `gradientFrom/To` | `#5227FF → #FF9FFC` | **单色低对比** | 紫到粉是"AI 味"最重的配色。改成同色系两个透明度，点才有"印刷网点"感 |
| `glowIntensity` | 0.8 | **0.30** | 0.8 是"发光特效"，0.30 是"光刚好照到那里" |
| `bulgeStrength` | 0.6 | **0.22** | 0.6 是"魔镜"，0.22 是"纸面上有一点起伏" |
| `holdToZoom` | true | **false** | 长按放大是交互玩具，会诱使用户去玩而忘记读内容 |

**验证**：把 `opacity` 拉到 0.85 后截图，点的视觉重量应该**低于正文文字一个量级**——它是纸张的纹理，不是主角。如果一眼看到的是点阵，说明参数还没压够。

---

**放置位置与"必须删掉的东西"**

按 2.3 的数量纪律，引入 Dot Field 后必须腾位置。三个方案，选一个：

| 方案 | 做法 | 代价 | 推荐度 |
|---|---|---|---|
| **A（推荐）** | Dot Field 进 **hero**，删除 hero 内的 `blob-morph` 色块；`ArchiveArray` 保留但 opacity 降到 0.25 | hero 少一个"有机形"，多一层"纸纹" | ★★★★★ |
| **B** | Dot Field 进 **hero**，**删除 `ArchiveArray`**（连同 GL 版） | 失去三维阵列，首屏变平；但能删掉 `three.js` 约 1MB 依赖 | ★★★★ |
| **C** | Dot Field 只用于 **`/archive/` 和 `/about/` 的页面背景**，hero 不动 | 首屏不变，子页获得统一材质 | ★★★ |

> **我的判断**：选 **A**。`ArchiveArray` 是你项目最有辨识度的东西（三维档案阵列），不能删；但 `blob-morph` 那个呼吸色块是纯装饰，与方舟无关，删掉最划算。

**性能注意**：
- Canvas 点阵 + `ArchiveArray` 的 `requestAnimationFrame` 会双跑。必须让 Dot Field 在 `document.hidden` 时暂停——它内部可能没做，需要手动加：
  ```tsx
  const [active, setActive] = useState(true);
  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  // 渲染时：{active && <DotField ... />}
  ```
- 移动端必须 `interactive={false}`（触屏无光标），或整个换成纯 CSS 点阵（v3 的 2.2 节三层点阵参数可直接用）。

#### 3.2.2 Line Waves —— `ArchiveArray` 的低成本替代

**官方描述**：流动的线波背景。

**为什么考虑**：v3 指出 `ArchiveArray` 的核心问题是"卡片里的文字与标题争抢"。除了降透明度，另一个解法是**换成没有内容的线**——线波天然不承载文字。

**但**：线波的气质偏"科技感数据流"，而档案阵列的隐喻是"实体档案在传送带上"。**两者不可互换**，放在一起会矛盾。

**结论**：**不替换，只在 `/about/` 或 `/projects/` 这类"非档案"页面用**。作为页面级的材质区分。

#### 3.2.3 Text Animations 分类 —— `DecryptText` 的升级选项

React Bits 有独立的 `Text Animations` 分类（如 `Tech Text`）。你的 `DecryptText` 已是自研实现（解密乱码 → 逐字落定），**这个是项目资产，不要换**。

只取一样东西：**`Tech Text` 的字符集**。它的乱码字符池比你现在用的更像"终端"：

```js
// 建议替换 DecryptText 里的字符池
const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*+=<>/?\\|_~^";
```

> 关键：**不要用中文乱码**（如"壹贰叁"），那会变成"古风"。方舟的终端感来自**拉丁字母 + 符号**。

#### 3.2.4 Grainient —— 颗粒渐变，用于 hero 底

**官方描述**：带噪点的渐变（Grain + Gradient）。

**你的痛点**：v3 的 P1-06 指出"全站零图像，缺视觉锚点"。纯 CSS 渐变太干净，加一层颗粒立刻有"印刷品/胶片"的质感——这正是方舟物料的味道。

**替代方案（更省）**：如果不想引组件，用一行 CSS 就能做颗粒：

```css
.grain-overlay {
	position: absolute;
	inset: 0;
	pointer-events: none;
	opacity: 0.35;
	mix-blend-mode: overlay;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**结论**：**用 CSS 版，不用组件版**。`feTurbulence` 是 SVG 原生滤镜，零 JS，且可控（`baseFrequency` 调粗细、`numOctaves` 调层次）。

#### 3.2.5 Beams —— 慎用，判断为"不进"

**官方描述**：从边缘射出的光线束。

**问题**：Beams 是"AI SaaS 落地页"的标志性元素（和 MotionSites 上那些案例同一套语言）。方舟的"光"是**物理的、有方向的、被遮挡的**（比如百叶窗投下的条纹），不是"从中心放射的粒子光"。

**结论**：**弃用**。若要"光"，用 v3 的 `linear-gradient` 斜向遮罩更准确。

#### 3.2.6 最终采用清单

| 组件 | 用吗 | 放哪 | 改造量 |
|---|---|---|---|
| **Dot Field** | ✅ **核心** | hero 背景层 | 参数改造（见 3.2.1 配方） |
| Line Waves | ⚠️ 局部 | `/about/`、`/projects/` 页面背景 | 低 |
| Text Animations | ✅ 取字符池 | `DecryptText` | 极低 |
| Grainient | ✅ 但用 CSS 版 | hero / 卡片底 | 极低 |
| Beams | ❌ | — | — |
| 其余 210+ | ❌ | — | — |

---

### 3.3 Aceternity UI —— 次选，但有一个组件必须用

**规模**：118+ 免费组件、183+ blocks、17 模板、4 完整页面。技术栈 **React + Tailwind + Motion**。

**和 React Bits 的差异**：

| | React Bits | Aceternity |
|---|---|---|
| 倾向 | 更"技术演示"，组件本身就是主角 | 更"落地页"，组件服务于营销转化 |
| 代码形态 | 4 种变体可选，纯组件 | 大量用 `motion` + `useState`，耦合更多 |
| 与你项目的匹配 | **背景层 / 文字层** | **特定交互件**（翻牌、卡片） |
| 危险性 | 中（参数化，好控） | 高（默认强度大，容易"油"） |

**结论**：Aceternity **只取 2 个组件**，其余全部不碰。

#### 3.3.1 Text Flipping Board —— 编号系统的完美载体

**官方描述**：`A split-flap display component that animates characters with flip transitions, inspired by Vestaboard.`（机场翻牌显示屏）

**为什么这是"必须有"**：你的全站有一个 `docId()` 生成的编号系统（`DOC.261005-GUESTB`），目前只是 `.mono-tag` 一行小字。**翻牌器能把"编号"从装饰变成"仪式"**——每次进文章页，编号翻出来，这是方舟式的"档案调取"动作。

**完整 props（实测）**：

| prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `text` | string | — | 要显示的文本，支持 `\n` 换行，自动折行 |
| `rows` | string[] | — | 手动控制每一行，支持 `{O}` 之类的颜色码（橙色块） |
| `duration` | number | `~1.2` | 总动画时长（秒），内部时序按比例缩放 |
| `sound` | boolean | `false` | **每个字符翻转时播放机械声** |
| `className` | string | — | 外层容器类名 |

**接入方案**：

```tsx
// app/posts/[slug]/page.tsx —— header 内替换 mono-tag
import TextFlippingBoard from "@/components/aceternity/TextFlippingBoard";

<div className="mb-4">
	<TextFlippingBoard
		text={docId(post)}
		duration={0.7}         /* 1.2 → 0.7，快一点才像"调取"而非"表演" */
		sound={false}          /* 先关，见下方说明 */
		className="text-[11px] tracking-[0.16em]"
	/>
</div>
```

**两个关键改造判断**：

**① `duration` 必须从 1.2 降到 0.6~0.8。**
1.2s 是"演示模式"，用户看一次觉得酷，看十次觉得慢。翻牌应该是"刷"的一下——参考机场翻牌，整块刷新不超过 0.5s。

**② `sound` 的处理是个决策点。**

Aceternity 内置了合成的机械翻牌音。你的项目已有 `lib/sound.ts`（WebAudio + tick/confirm 两种音效 + 用户开关 `raos-sound`）。

三个选项：

| 选项 | 做法 | 评价 |
|---|---|---|
| **A（推荐）** | `sound={false}`，把翻牌音**注册进 `lib/sound.ts`** 作为第三种音效 `playFlap()`，统一受用户开关控制 | 音效系统不分裂，用户只需关一次 |
| B | `sound={true}` | ❌ 用户关了音效，翻牌还在响——体验割裂 |
| C | 完全无声 | 可接受，但少了方舟那种"机械感" |

**推荐 A 的实现**（`lib/sound.ts` 现有结构：模块私有 `ensureCtx()` + `blip()` 振荡器工具，**没有导出 `getCtx`**，所以 `playFlap` 必须写在 `sound.ts` 文件内部）：

```ts
// lib/sound.ts 追加（放在 playConfirm 之后）

/**
 * 翻牌音：30ms 噪声爆破 + 带通滤波，模拟机械翻片。
 * 与 blip() 不同——翻牌不是乐音，是噪声，所以单独实现。
 */
export function playFlap(): void {
	if (!isSoundEnabled()) return;
	const ac = ensureCtx();
	if (!ac) return;

	const len = Math.floor(ac.sampleRate * 0.03);
	const buf = ac.createBuffer(1, len, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < len; i++) {
		// 白噪声 × 指数衰减，指数 8 让尾巴极短，形成"咔"而非"沙"
		data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 8);
	}

	const src = ac.createBufferSource();
	src.buffer = buf;

	const bp = ac.createBiquadFilter();
	bp.type = "bandpass";
	bp.frequency.value = 2200;
	bp.Q.value = 1.6;

	const g = ac.createGain();
	g.gain.value = 0.06; // 极低：翻牌音是"提示有东西在动"，不是特效

	src.connect(bp).connect(g).connect(ac.destination);
	src.start(ac.currentTime);
}
```

> **参数理由**：`0.03s` 时长 ≈ 一帧半，长了就变成"撕纸"；`2200Hz` 是机械卡扣的典型频段；`Q=1.6` 保持噪声但有一点音高感；`gain 0.06` 比现有 `playTick` 的 0.015 高 4 倍——因为它是单次事件而非高频悬停，需要更明显一点才听得见。

**③ 不要用在列表页。** 只在 `/posts/[slug]` 的 header 用一次。列表页 8 张卡片同时翻牌 = 噪音灾难。

#### 3.3.2 3D Card Effect / Wobble Card —— 改成"微倾"

**原版效果**：鼠标移动时卡片整体 3D 倾斜（通常 ±10~15deg）+ 内部元素视差浮起。

**问题**：这是"产品发布会"语言。方舟的卡片永远是**平的、正的、1px 描边**。

**但可以改造**：把倾斜幅度压到 ±1.5deg，去掉内部元素视差，只保留"纸片被指尖轻触"的错觉。

```tsx
// 改造版：档案卡微倾（±1.5deg，无内外视差）
"use client";
import { useRef } from "react";

export function TiltCard({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	const onMove = (e: React.MouseEvent) => {
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 ~ 0.5
		const ny = (e.clientY - r.top) / r.height - 0.5;
		el.style.transform = `perspective(800px) rotateY(${nx * 3}deg) rotateX(${-ny * 3}deg) translateY(-3px)`;
	};
	const onLeave = () => {
		const el = ref.current;
		if (!el) return;
		el.style.transform = "";
	};

	return (
		<div
			ref={ref}
			onMouseMove={onMove}
			onMouseLeave={onLeave}
			className="transition-transform duration-200 [transition-timing-function:var(--ease-hover)] [transform-style:preserve-3d]"
			style={{ willChange: "transform" }}
		>
			{children}
		</div>
	);
}
```

**关键数字**：
- `perspective(800px)` — 800 是"近距离观察"的透视，数值越小畸变越大。800 是克制值
- `rotateY/rotateX` 幅度 `nx * 3` → 最大 ±1.5deg（`0.5 * 3`）
- 必须叠加原来的 `translateY(-3px)`，否则"倾斜了但没抬起"，会显得扁平

**只在 `pointer: fine` 启用**：
```tsx
@media (hover: hover) and (pointer: fine) { /* 启用 */ }
```

**是否值得做**：**判断为"可选"**。它的收益是把卡片从"平面的"变成"有厚度的"，但代价是多一个客户端组件 + 每次 mousemove 一次 reflow。

**如果你只有时间做一件事，跳过这个，做 Dot Field。**

#### 3.3.3 其余组件逐个判断

| 组件 | 效果 | 判断 | 理由 |
|---|---|---|---|
| `Background Beams` | SVG 光束背景 | ❌ | 与 React Bits 的 Beams 同问题，"AI SaaS 味" |
| `Hero Highlight` | 文字跟随鼠标高亮 | ⚠️ | 想法好，但你的 hero 已有打字机，再加会抢戏 |
| `Liquid Glass` | 液态玻璃面板 | ❌ | 你的 `.glass-panel` 已经是克制版，Liquid Glass 太"苹果" |
| `Background Cubes Grid` | 3D 立方体网格 | ❌ | 与 `ArchiveArray` 语义重复且更廉价 |
| `Cloud Shader` | 云朵着色器 | ❌ | 与"档案/工业"无关 |
| `Apple Cards Carousel` | 横向卡片轮播 | ⚠️ | 可用于 `/friends/`，但会引入横向滚动容器，触屏冲突 |
| `3D Marquee` | 3D 跑马灯 | ❌ | 纯营销组件 |
| `Image Generation Loader` | 像素消隐加载 | ✅ | **可用**，用于 `CoverArt` 生成中的占位（见 3.4.1） |
| `Text Flipping Board` | 翻牌 | ✅ **必用** | 见 3.3.1 |
| 其余 100+ | — | ❌ | — |

---

### 3.4 Uiverse —— 微件库，质量参差，要筛

**性质**：社区众包，5600+ 元素，在线作者 556 人。导出格式：**HTML/CSS · Tailwind · React · Figma** 四种。

**核心问题**：**这是唯一一个"质量不可预期"的库**。同一个"按钮"分类下，既有极简的 1px 描边按钮，也有镶金边发光 3D 按钮。必须自己筛。

#### 3.4.1 筛选标准（三条，快速判断）

| # | 标准 | 一眼判断 |
|---|---|---|
| 1 | **代码行数 ≤ 40 行** | 超过 40 行 CSS 的微件，通常靠"多层伪元素叠加"堆效果，改不动 |
| 2 | **不用 `box-shadow` 做主体** | 方舟用 1px 描边和实底色，不靠投影造体积 |
| 3 | **有 `:focus-visible` 或能轻易加上** | 无键盘可达性的微件一律弃用 |

#### 3.4.2 能用与不能用

**能用（四类）**：

| 类型 | 用在哪 | 挑选要点 |
|---|---|---|
| **Loader / Spinner** | `BootSequence` 的等待态、`CoverArt` 生成中 | 选"线性/方块"类，**不要圆形旋转**（方舟用条形与网格） |
| **Toggle / Switch** | 音效开关、明暗切换 | 选"方形滑块 + 硬边"，不要胶囊液态 |
| **Input Field** | ⌘K 命令面板 | 选"只有下划线"或"1px 描边"的，不要浮动标签 |
| **Background Patterns** | 卡片底纹、空状态底 | 选 `CSS Patterns` 子类，纯 `repeating-linear-gradient` 实现的最优 |

**不能用（明确列出）**：

```
❌ Neumorphism UI（新拟物）
❌ 3D Buttons（立体按钮）
❌ Glow Buttons（发光按钮，尤其是多层 glow）
❌ 任何带"液态/果冻"形变的
❌ 任何需要 <div> 嵌套 4 层以上才能成立的
```

#### 3.4.3 一个具体用法：`CoverArt` 的加载态

现状：`components/CoverArt.tsx` 生成程序化封面，生成过程无反馈。

Uiverse 的 `Loading UI` 分类里有大量"条形扫描"加载器。但要按方舟改：

```tsx
// 方舟式加载：不是 spinner，是"扫描线在网格上推进"
export function ArchiveLoader() {
	return (
		<div className="relative h-full w-full overflow-hidden bg-[var(--color-panel-2)]">
			{/* 底色点阵 */}
			<div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle,var(--color-ink)_1px,transparent_1.2px)] [background-size:12px_12px]" />
			{/* 扫描线 */}
			<div className="absolute inset-x-0 top-0 h-8 animate-[scan_1.6s_linear_infinite] bg-[linear-gradient(to_bottom,transparent,rgb(241_198_68/0.18),transparent)]" />
			{/* 角标 */}
			<span className="absolute bottom-2 left-2 font-mono text-[9px] tracking-[0.14em] text-[var(--color-muted)]">
				GENERATING…
			</span>
			<style jsx>{`
				@keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(1000%); } }
			`}</style>
		</div>
	);
}
```

**为什么自己写而不用 Uiverse 的**：这个只需要 12 行，且完全贴合你的 token。Uiverse 上的同类实现通常写了 60 行，还带一圈发光。

> **这就是 Uiverse 的正确用法**：**把它当"效果索引"，看完自己重写。**直接粘贴的成功率不到 30%。

---

### 3.5 MotionSites —— 只取 section 类型清单

**实际内容**：AI 生成的落地页 section 现成案例 + 提示词（付费产品）。

案例清单（实测）：`EMBER.dsgn` / `RIVR` / `HAUL!` / `AKOR Security` / `Aetheris Voyage` / `Shamoni` / `Vize Footer` / `Nexus IT Solutions` / `RIVR DeFi` / `Glow Features` / `Bionova Biotech` / `Digital Epoch` / `Zenith Realty` / `Slam Dunk` / `Orbit Engineers` / `NOVA Space Systems` / `Finlytic AI Agent`

**它的 section 分类法**（这个可以直接用作你的信息架构 checklist）：

```
Hero Section / Features / Pricing / CTA Section / Testimonials
Logo Cloud / Footer / Landing Page / SaaS / Backgrounds（Animated）
```

**怎么用在你身上**：对照这个清单，逐项问"我的博客有吗、需不需要"。

| MotionSites section | 你的博客 | 判断 |
|---|---|---|
| Hero | ✅ 有（`hero-panel`） | 保留，按 v3 的 B3-1 重构 |
| Features | ❌ 无 | **可以加**：`/about/` 页做「本站用了什么」的三宫格（Next.js / 静态导出 / 无追踪） |
| Pricing | ❌ | 不需要 |
| CTA | ⚠️ 弱 | **该加**：文章末尾加"订阅 RSS / 去留言板"双按钮 |
| Testimonials | ❌ | 不需要 |
| Logo Cloud | ❌ | **可加**：`/friends/` 已经是它的变体 |
| Footer | ✅ 有 | 按 v3 的 P2-12 升级 |
| Backgrounds | ✅ 有 | 用 Dot Field 替换 |

**结论**：**只补 CTA 和 Features 两处**，其余不补。

**视觉上完全不要参考它**——它的每一页都是"紫蓝渐变 + 光晕 + 大圆角玻璃卡"，正是 v3 诊断出的病灶。

---

### 3.6 Showreel.design —— 只取节奏

**实际内容**：motion designer 个人 showreel 视频托管（`Billy Mpetha 2D Animation Reel` / `Cub Studio Showreel` / `Animade Reel 2026` / `Sander van Dijk Reel` …）。

**标签体系**（实测，可用来筛选）：
```
行业：Entertainment & Media / Advertising & Commercial / Tech & SaaS
风格：Hand-drawn / 3D-CGI / Bold-Vibrant / Minimal-Clean / Sound-Design-Focused
音乐：Hip-hop-Urban / Rock-Energetic / Electronic-Synth / Orchestral-Classical / Jazz-Acoustic
```

**用法**：只看 **`Minimal / Clean`** 标签的 reel。观察三件事，直接映射成你的 CSS 参数：

| 观察什么 | 对应参数 | 参考结论 |
|---|---|---|
| 一个动作从静止到终态用多久 | `--dur-base` | 顶级 motion reel 的单个动作通常 **6–10 帧**（0.25–0.4s）。你现在 `.archive-card` 的 hover 是 260ms，**已经对了** |
| 两个动作之间留多久空白 | `stagger` | 通常是动画时长的 **1/3 到 1/2**。你现在的 `stagger(70ms)` 对 520ms 动画偏短，可提到 120ms |
| 缓入缓出谁长谁短 | `ease` | **出慢入快**（`cubic-bezier(0.22, 1, 0.36, 1)` = `outExpo` 家族）。你的 `--ease-os` 已经是这个，正确 |

**唯一可能需要改的**：`Reveal` 的 `delay={i * 70}` 改成 `i * 110`。让列表入场"一张一张来"，而不是"一起涌上来"。

> **一句话**：这个站不给你任何视觉参考，只校准你的**时间感**。而时间感恰恰是"高级感"最容易被忽略的一半。

---

## 4. 与 v3 规格书的对接

### 4.1 哪些替换、哪些新增

| v3 里的方案 | 用哪个库实现 | 关系 |
|---|---|---|
| 2.2 `mask-image` 开洞（探照灯） | **Dot Field** 的 `cursorRadius` + `bulgeStrength` | **替换**（组件化，省 40 行 JS） |
| 2.2 三层点阵呼吸 | 保留纯 CSS（v3 已给参数） | **保留**，Dot Field 作为可选增强 |
| B3-2 `ArchiveArray` 剪影层重构 | 仍按 v3 做 | **保留**（Dot Field 不替代它） |
| P1-06 Hero 纹理层 | **CSS `feTurbulence`** 颗粒 | **替换**（比 Grainient 更省） |
| P2-09 BootSequence 进度条 | **`createDrawable`** 描线 | **增强** |
| P2-15 阅读进度条刻度 | **rAF 节流 + ref 直写**（不用 anime，见 B5 第 3 项） | **替换**（顺带修掉 resize 未监听的 bug） |
| B4-1 占位卡 | Aceternity `Image Generation Loader` 的思路 | **改造**（不用原组件，只借"消隐"手法） |
| 编号系统 `docId()` | **Text Flipping Board** | **新增**（v3 没提，价值高） |
| 卡片 hover | Aceternity `Wobble Card` 的**微倾改造** | **可选增强** |
| ⌘K 面板输入框 | Uiverse `Input Field` 的样式参考 | **微调** |

### 4.2 一屏动效预算表（防止再次超编）

| 位置 | v3 方案 | 引入库后 | 最终保留 |
|---|---|---|---|
| Hero 背景 | `ArchiveArray` + `os-grid` + `blob-morph` | + Dot Field | **`ArchiveArray`(om 0.25) + Dot Field**，删 `os-grid` 和 `blob-morph` |
| Hero 文字 | `TypeLine` 打字机 + `DecryptText` | — | 保留，不加翻牌 |
| Hero 粒子 | 无 | 不加 | 无 |
| 卡片 hover | 扫描光 + 位移 + 边框 | + 微倾（可选） | **位移 + 边框 + 微倾**，扫描光降级 |
| 文章页 | `ReadingProgress` | + 翻牌编号 | 两者都要，但不在同一视觉带 |
| 全站光标 | 系统光标 | 不加自定义光标 | 系统光标 |

**结论：引入 3 个库之后，一屏内的动效元素从 5 个降到 4 个。** 这是"用了更多工具但更安静"的正确结果。

---

## 5. 实施批次（接在 v3 的 B1–B4 之后）

| 批次 | 主题 | 风险 | 前置 |
|---|---|---|---|
| **B5** | Anime.js 能力补齐（无视觉变化） | 极低 | v3 的 B1 完成 |
| **B6** | Dot Field 接入 hero | 中 | B5 完成 |
| **B7** | Text Flipping Board + Uiverse 微件 | 低 | B6 完成 |

### B5 · Anime.js 能力补齐

**这一批不改任何视觉，只换实现。做完截图应该和改之前一模一样。**

按"收益/风险"排序，**建议只做前两项**：

| 顺序 | 改什么 | 收益 | 风险 | 做不做 |
|---|---|---|---|---|
| 1 | `BootSequence.tsx` 的 SVG 描线 → `createDrawable`（见 3.1.2） | 删掉 `pathLength` / `strokeDasharray` 两个 hack，SVG 可自由缩放 | 极低 | ✅ 做 |
| 2 | `ArchiveArray.tsx` 的媒体查询 → `createScope`（见 3.1.3） | 三处 `window.innerWidth` 判断收敛成一处，`scope.revert()` 自动清理 | 低 | ✅ 做 |
| 3 | `ReadingProgress.tsx` → rAF 节流（见下方） | 消除滚动时每帧 `setState` | 极低 | ✅ 做 |
| 4 | `Reveal.tsx` → `onScroll`（见 3.1.1） | 语义化阈值，为 sync 铺路 | **中**（ScrollObserver 生命周期需实测） | ⚠️ 可选 |

#### 3 的具体改法：`ReadingProgress` 的真正问题是 `setState`

现状源码（19 行）在 `scroll` 里每帧调用 `setPct(...)`，触发 React re-render。虽然只是一个 div，但这是**每帧一次 render 循环**，完全没必要。

**不需要 anime.js**，用 `ref` 直写 style + rAF 节流即可：

```tsx
"use client";

import { useEffect, useRef } from "react";

/** 顶部阅读进度条（文章页）—— rAF 节流 + ref 直写，不触发 re-render */
export default function ReadingProgress() {
	const bar = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let raf = 0;
		let ticking = false;

		const update = () => {
			const doc = document.documentElement;
			const max = doc.scrollHeight - doc.clientHeight;
			const pct = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0;
			if (bar.current) bar.current.style.width = `${pct}%`;
			ticking = false;
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			raf = requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, []);

	return <div ref={bar} className="reading-progress" style={{ width: "0%" }} aria-hidden />;
}
```

**顺带修掉一个真 bug**：原实现没有监听 `resize`。窗口变窄 → `scrollHeight` 变化 → 进度条位置错误，直到下一次滚动才修正。

**验收**：滚动时 DevTools Performance 的 "React" 轨道不再有每帧的 commit；进度条仍平滑跟随。

---

**B5 总验收**：截图与 B4 完成后逐像素对比无差异（字体渲染允许 ±1px）。**若有差异，说明改错了。**

### B6 · Dot Field 接入

1. 手动复制 `DotField` 源码到 `components/reactbits/DotField.tsx`（见 6.4）
2. 按 3.2.1 的参数表写 `components/DotFieldBackdrop.tsx`
3. `app/page.tsx` 的 hero 内引入，**同时删掉 `os-grid` 和 `blob-morph`**
4. `ArchiveArray` 的 `opacity` 从 0.38 降到 **0.25**
5. 加 `visibilitychange` 暂停
6. 移动端降级：`interactive={false}` + 若性能不达标，整块换成 v3 的三层 CSS 点阵

**验收**：
- 1440×1000 截图，**第一眼看到的是标题**，点阵在余光里
- 鼠标移动时光标周围有极轻的"呼吸"，不产生"哦这是个特效"的念头
- `performance` 面板：hero 区域 FPS ≥ 55
- 移动端关闭后截图不塌

### B7 · 翻牌与微件

1. 复制 `TextFlippingBoard` 到 `components/aceternity/`
2. `lib/sound.ts` 加 `playFlap()`
3. `app/posts/[slug]/page.tsx` 接入，`duration={0.7}`、`sound={false}`
4. 按需替换 1–2 个 Uiverse 微件（Toggle / Loader）

**验收**：
- 文章页编号翻牌一次约 0.7s，不循环
- 关闭音效后完全静音
- 移动端翻牌不导致布局跳动（翻牌器需固定宽高）

---

## 6. 代码附录

### 6.1 Tailwind v3 → v4 类名映射（粘贴组件后必查）

React Bits / Aceternity 的 Tailwind 变体大量使用 v3 类名。项目是 v4.0.9，**以下必须替换**：

| v3 | v4 | 备注 |
|---|---|---|
| `bg-gradient-to-r` | `bg-linear-to-r` | 所有 `bg-gradient-to-*` |
| `bg-gradient-to-br` | `bg-linear-to-br` | |
| `shadow-sm` | `shadow-xs` | v4 整体下移一档 |
| `shadow` | `shadow-sm` | |
| `shadow-md` | `shadow-sm` | v4 合并了 md |
| `rounded-sm` | `rounded-xs` | |
| `rounded` | `rounded-sm` | |
| `outline-none` | `outline-hidden` | 语义变化：v4 的 `outline-none` 是 `outline-style:none` |
| `flex-shrink-0` | `shrink-0` | |
| `flex-grow` | `grow` | |
| `overflow-ellipsis` | `text-ellipsis` | |
| `decoration-slice` | `box-decoration-slice` | |
| `bg-opacity-50` | `bg-black/50` | 斜杠语法必用 |
| `text-opacity-50` | `text-black/50` | |
| `border-opacity-50` | `border-black/50` | |
| `space-x-4`（反向） | `space-x-reverse` 仍可用 | 但推荐 `gap-4` |
| `!p-4` | `p-4!` | **重要**：v4 把 `!` 移到末尾 |

**快速自查命令**：
```bash
grep -rn "bg-gradient-to-\|flex-shrink-0\|flex-grow\b\|outline-none\|shadow-md\|rounded-sm" components/reactbits components/aceternity
```

### 6.2 Dot Field 方舟化参数速查

```ts
// 三套预设：hero / 子页背景 / 亮色模式
export const DOT_PRESETS = {
	hero: {
		dotRadius: 1.15, dotSpacing: 34, pattern: "grid",
		gradientFrom: "rgba(233,234,238,0.13)", gradientTo: "rgba(233,234,238,0.05)",
		gradientAngle: 180, glowColor: "#f1c644", glowRadius: 190, glowIntensity: 0.30,
		baseOpacity: 0.34, cursorRadius: 280, bulgeStrength: 0.22, twist: 0,
		holdToZoom: false, waveAmplitude: 1.5, sparkle: false, speed: 0.5,
		interactive: true, intro: true, lightMode: false, opacity: 0.85,
	},
	page: {
		dotRadius: 1.0, dotSpacing: 40, pattern: "grid",
		gradientFrom: "rgba(233,234,238,0.07)", gradientTo: "rgba(233,234,238,0.03)",
		gradientAngle: 180, glowColor: "#f1c644", glowRadius: 120, glowIntensity: 0.15,
		baseOpacity: 0.22, cursorRadius: 200, bulgeStrength: 0.12, twist: 0,
		holdToZoom: false, waveAmplitude: 0, sparkle: false, speed: 0.3,
		interactive: true, intro: false, lightMode: false, opacity: 1,
	},
	light: {
		dotRadius: 1.15, dotSpacing: 34, pattern: "grid",
		gradientFrom: "rgba(17,19,24,0.10)", gradientTo: "rgba(17,19,24,0.04)",
		gradientAngle: 180, glowColor: "#b58900", glowRadius: 160, glowIntensity: 0.18,
		baseOpacity: 0.30, cursorRadius: 240, bulgeStrength: 0.18, twist: 0,
		holdToZoom: false, waveAmplitude: 0, sparkle: false, speed: 0.4,
		interactive: true, intro: true, lightMode: true, opacity: 1,
	},
} as const;
```

> 亮色模式的 `glowColor` 用 `#b58900`（暗金）而不是 `#f1c644`——纯黄在白底上不可见，必须压暗。

### 6.3 Anime.js `onScroll` 参数速查

```js
onScroll({
	container: window,              // 滚动容器，默认 window
	axis: "y",                      // 'x' | 'y'
	enter: "bottom 90%",            // '容器边缘 目标边缘' —— 元素底边到达视口 90% 处
	leave: "top 10%",               // 离开条件
	sync: false,                    // true = 进度绑定；false = 触发式
	debug: false,                   // true = 显示一条参考线，调试用
})
```

**常用 enter 值**：

| 值 | 含义 | 场景 |
|---|---|---|
| `"bottom 90%"` | 元素顶边刚进视口 10% | 卡片入场 |
| `"bottom 100%"` | 元素顶边碰到视口底 | 最宽松 |
| `"top 50%"` | 元素顶边到视口中央 | 章节标题 |
| `"center center"` | 元素中心到视口中心 | 阅读进度锚点 |

> **调试技巧**：第一次调 `onScroll` 一律开 `debug: true`，屏幕上会画出触发线，比猜快十倍。上线前记得关掉。

### 6.4 手动安装组件（替代 shadcn CLI）

**不要跑 `npx shadcn init`**——它会往 `globals.css` 顶部注入一套 shadcn 变量（`--background` / `--foreground` / `--card` …），与你的 `@theme` 体系（`--color-bg` / `--color-ink` …）形成两套并行命名，是长期维护的地雷。

**正确做法：直接抓 registry JSON，取 `content` 字段。**

```bash
# React Bits 的 registry 前缀是 @react-bits
# 直接看源码的方式：在组件页切到 TS + Tailwind 变体，复制代码块
# 或用 shadcn CLI 的 --dry-run 看它要写哪些文件，然后手动取

# 更稳的方式：从 GitHub 仓库直接拿
git clone --depth 1 https://github.com/DavidHDev/react-bits /tmp/react-bits
cp /tmp/react-bits/src/content/Backgrounds/DotField/DotField.tsx components/reactbits/DotField.tsx
cp /tmp/react-bits/src/content/Backgrounds/DotField/DotField.css   components/reactbits/DotField.css
```

> 仓库路径可能随版本变动。若找不到，用 `find /tmp/react-bits -name "DotField*"` 定位。

**Aceternity 同理**：
```bash
git clone --depth 1 https://github.com/aceternity/ui /tmp/aceternity
find /tmp/aceternity -iname "*flipping*" -o -iname "*flip*board*"
```

**复制后的标准动作（顺序不能错）**：
1. 改文件头的 import 路径为 `@/`
2. 跑 6.1 的类名映射
3. 若是 `jsx` 文件，改扩展名为 `.tsx` 并补类型（或先保留 `.jsx` 让它跑起来）
4. 若组件有 `"use client"` 但你的页面是 Server Component，在**使用处**包一层 Client 边界
5. `pnpm build` 验证

### 6.5 组件准入自查清单（贴到 PR 描述里）

```markdown
- [ ] 能压到几乎看不见而不崩（opacity ≤ 0.2 或 scale ≤ 0.05 测试通过）
- [ ] 没有引入新的饱和色（默认紫色/粉色已覆盖为 token）
- [ ] 静态时（reduced-motion）视觉不塌
- [ ] 不新增 npm 依赖（motion / three / animejs 除外）
- [ ] 移动端能降级（interactive={false} 或不渲染）
- [ ] Tailwind 类名已过 v3→v4 映射
- [ ] 不包含 next/image（静态导出下需手动改 img）
- [ ] 不包含 API route / Server Action
- [ ] 已在 1440 和 390 两个宽度验证
- [ ] 同一屏内的动效数量未超编（背景 1 + 强调 1）
```

---

## 7. 验收与避坑

### 7.1 验收标准

| 检查项 | 通过标准 |
|---|---|
| 首屏第一印象 | 看到的是标题，不是背景特效 |
| 动效数量 | 一屏内 ≤ 1 个动的背景 + 1 个动的强调 |
| 关闭 JS 后 | 文字全部可读（渐进增强成立） |
| `prefers-reduced-motion` | 所有动画静止，布局不塌 |
| 移动端 390px | 无横向滚动，Dot Field 已降级或无交互 |
| 性能 | hero FPS ≥ 55；首屏 JS 增量 ≤ 30KB |
| 静音状态 | 关闭音效后翻牌无声 |
| 视觉一致性 | 全站饱和色仍只有 brand / signal / data 三个 |

### 7.2 避坑清单

| 坑 | 表现 | 规避 |
|---|---|---|
| **`!` 位置** | 粘贴的组件里 `!p-4` 在 v4 失效 | v4 是 `p-4!` |
| **`bg-gradient-to-*` 失效** | 渐变背景不显示 | 改 `bg-linear-to-*` |
| **`"use client"` 缺失** | build 报 `useState` 只能在 client component 用 | 组件文件头必须加 |
| **`onScroll` 不触发** | 元素一直不可见 | 检查容器是否有 `overflow:hidden` 导致滚动容器不是 window |
| **Dot Field 在 SSR 崩** | build 报 `window is not defined` | 必须 `dynamic(() => import(...), { ssr: false })` |
| **翻牌器导致 CLS** | 加载时布局跳动 | 给容器固定 `min-height` 或 `aspect-ratio` |
| **Canvas 双跑** | hero 掉帧到 30 | Dot Field + ArchiveArray 二者必须有 `visibilitychange` 暂停 |
| **Aceternity 的 motion 版本** | 报 `motion/react` 找不到 | 项目装的是 `motion@11`，import 路径是 `motion/react`，不是 `framer-motion` |
| **`trailingSlash`** | 组件内 `router.push("/x")` 404 | 项目设了 `trailingSlash: true`，跳转必须带尾斜杠 |
| **`output: export`** | 组件用了 `searchParams` 或 API | 全静态，筛选/搜索必须走客户端状态 |

### 7.3 最后一条判断

如果只能上**一个**东西：

> **上 Dot Field，参数按 3.2.1 压到"几乎看不见"，同时删掉 `os-grid` 和 `blob-morph`。**

它一次性解决三件事：给 hero 加材质（v3 的 P1-06）、给"鼠标探索"一个理由（v3 想用 `mask-image` 做的事）、把一屏的动效数量从 5 降到 4。

其他的都是锦上添花。

---

## 附录 · 一句话备忘

1. **6 个站里只有 4 个能出代码。** 另外 2 个，一个给你 section 清单，一个给你节奏感。
2. **Showreel.design 不是网页站**，是动画师作品集。别去那儿找 UI。
3. **MotionSites 的审美就是你的病灶**（渐变 + 光晕 + 玻璃卡）。只抄它的 section 分类。
4. **准入标准比组件库重要。** 三个库加起来 400+ 组件，你能用 12 个。
5. **能压到看不见的才是好组件。** 压不下去的，说明它靠强度撑审美。
6. **Anime.js 你只用了 15%。** `onScroll` / `createDrawable` / `createScope` 加起来 1.1KB，能换掉两套手写逻辑。
7. **Dot Field 是这个清单里唯一"必须用"的。** 24 个 props，改 5 个就是方舟味。
8. **Text Flipping Board 是唯一"必须加"的。** 它把编号从装饰变成仪式。
9. **Uiverse 当索引，不当仓库。** 看完自己重写，成功率从 30% 提到 90%。
10. **别跑 `shadcn init`。** 它会给你第二套 CSS 变量，和 `@theme` 打架。

---

*文档结束 · 6 站筛选 → 12 组件准入 → 3 批次落地 · 与 v3 规格书互补*

# RHINE ARCHIVE OS v3 · 设计升级规格书

> **文档性质**：可执行的改造规格书，面向代码模型（GLM）直接在仓库中实施。
> **目标仓库**：`H:\Zcode cangku\Leersxie.github.io`（Next.js 15 + React 19 + Tailwind v4 + three.js + anime.js）
> **本地预览**：`http://127.0.0.1:4321/`（由 `npx serve out -l 4321` 提供）。注意：`out/` 是 production 构建，**只包含 1 篇已发布文章**（其余 3 篇是 `draft: true`），这是正确行为，详见 P0-06。想看全部 4 篇请用 `pnpm dev`。
> **参考标杆**：`https://www.ignoredone.space/`（WordPress 硬改的手写感站点，方舟设计研究站）
> **编写日期**：2026-10-24

---

## 0. 给 GLM 的执行说明（先读这一节）

### 0.1 你该怎么用这份文档

1. **不要重写项目**。项目已有清晰的 `app/` + `components/` + `lib/` 分层，`globals.css` 已建立 `@theme` token 体系。你的任务是**在既有骨架上做外科手术**，不是推倒重来。
2. **按 Batch 顺序执行**。第 5 章把改动拆成 4 批，每批都是"改完能跑、能看、能回滚"的独立单元。**不要跨批混改**。
3. **每批改完必须 `pnpm build`**，确认 `scripts/verify-export.mjs` 通过。项目是静态导出（`output: 'export'`），任何客户端 API 误用都会在 build 阶段炸掉。
4. **改样式优先改 token，不要散写魔法值**。`globals.css` 的 `@theme` 块是唯一的颜色/字体/圆角来源。新增视觉属性一律先加 token 再引用。
5. **移动端 390×844 是硬门槛**。每次改完必须用 390px 宽度截图自检，第 1 章的 P0-01 就是移动端溢出。
6. **不确定的地方标注 `// TODO(review)`**，不要臆造内容。特别是文案。
7. **本文件里所有 CSS 片段都是"意图精确、可直接落地"的**。变量名、单位、数值都可以照抄；类名请对齐项目既有的 Tailwind v4 `@utility` 写法。

### 0.2 项目的既有设计语言（别打破它）

```
布局基因 = Claude.ai 应用壳（左侧固定侧栏 256px + 顶部状态条 + 居中版心）
视觉基因 = 莱茵生命终端（深色面板 + 解密文字 + 三维档案阵列）
交互基因 = "OS 拟态"（命令面板 ⌘K / 启动序列 / 音效 tick / 系统时钟）
```

**这三条是本项目的身份，改造的目的是"让它们更锋利"，不是换一套身份。**

### 0.3 本次升级的一句话主张

> **把"紫色的、活泼的、四处发光的"终端，收敛成"黑白的、克制的、单点信号的"档案系统。**

依据：ignoredone 全站只有**一个**饱和色（`#FFDE00`），其余全是黑白灰；明日方舟官方 UI 同样只有黑白灰 + 一个信号色 + 一个数据冷色。而当前项目有 `primary / primary-deep / primary-soft / indigo-line` 四档紫蓝 + 5 个板块 accent（紫/靛/蓝/青/紫），**饱和点过多，视觉重心涣散**。

---

## 1. 现状诊断（基于源码 + 双端截图实测）

### 1.0 诊断方法与证据

| 手段 | 说明 |
|---|---|
| 源码通读 | `app/globals.css`(448行) / `app/page.tsx`(136行) / `components/AppShell.tsx`(518行) / `components/ArchiveArray.tsx`(130行) / `components/HeroVisual.tsx`(73行) / `components/BootSequence.tsx`(143行) / `app/posts/[slug]/page.tsx`(118行) / `lib/site.ts` / `scripts/subset-fonts.mjs` |
| 桌面截图 | Edge headless 1440×1000，覆盖 `/` `/archive/` `/about/` `/friends/` `/projects/` `/guestbook/` `/posts/first-blog/` |
| 移动截图 | Edge headless 390×844，覆盖 `/` |
| 构建核对 | `out/` 与 `.next/server/app/posts/` 的产物对比，配合 `content/posts/*.md` 的 frontmatter 逐篇核对 `draft` 状态 |

---

### 1.1 P0 级问题（阻断体验，必须第一批修）

> **编号备注（重要，请先读）**：本节 6 条中，**2 条经复核后被我自己的实测推翻或降级**：
> - **P0-03**（字体子集）→ 降为 P1。字符确实不在字体内，但浏览器 fallback 生效，**不会出现豆腐块**，实际后果只是字形不一致。
> - **P0-06**（out 只有 1 篇）→ **完全撤销**。原因是 3 篇文章标了 `draft: true`，构建丢弃它们是**正确行为**，不需要改任何代码。
>
> 保留原编号与原始判断过程，是为了让 GLM 看到"哪些是已验证的真问题、哪些是我的误判"，避免重复踩坑。**真正需要第一批修的是 P0-01 / 02 / 04 / 05。**

#### P0-01 · 移动端横向溢出（390px 视口）

**现象**：390px 宽下，Hero 主标题 `RHINE ARCHIVE OS` 右侧被裁切，页面可横向拖动；档案卡右边缘溢出屏幕。

**根因链**：
1. `app/page.tsx:77`
   ```tsx
   <h1 className="mt-5 font-display text-5xl font-normal tracking-tight text-white md:text-7xl">
   ```
   `text-5xl` = 48px，`RHINE ARCHIVE OS` 17 个字符含空格，实测宽度约 470px > 390px 视口 − 48px padding = 342px 可用宽度。**标题是纯拉丁大写串，浏览器不会在词内换行**，于是撑破容器。
2. `app/page.tsx:54` 的 `<section>` 有 `overflow-hidden`，但 h1 的溢出不计入滚动宽度时仍会撑开 `min-width`，导致 `<main>` 出现横向滚动条。
3. `components/ArchiveArray.tsx:85` 的 `w-[170%]` 绝对定位层虽有 `overflow-hidden` 父级，但在移动端 `perspective` + `translate` 组合下不总是被正确裁剪（Safari 尤甚）。

**修复规格**：

```tsx
// app/page.tsx —— 替换 h1
<h1 className="mt-5 font-display text-[clamp(2rem,7.5vw,4.5rem)] font-normal leading-[0.92] tracking-[-0.03em] text-white">
  RHINE
  <span className="bg-gradient-to-r from-[var(--color-primary-soft)] to-[#7ea2ff] bg-clip-text text-transparent">
    {" "}ARCHIVE OS
  </span>
</h1>
```
- 用 `clamp` 替代断点跳变，390px 时约 29px，1440px 时约 108px（受 `md:text-7xl` 上限约束可保留 `md:` 覆盖）。
- `overflow-x: clip` 加在 hero `<section>` 上（`overflow-hidden` 会创建 BFC 影响 sticky，`clip` 不会）：
  ```tsx
  <section className="hero-panel relative overflow-x-clip border-b border-[var(--color-line)]">
  ```
- `ArchiveArray` 根节点补 `contain: paint`：
  ```css
  .array-wrap { contain: paint; }
  ```
- `<body>` 加保险：`overflow-x: clip;`（不要用 `hidden`，会影响 `position: sticky` 的顶栏）。

**验收**：390px 下 `document.documentElement.scrollWidth === 390`；`/` 页面无横向滚动。

---

#### P0-02 · `Space Grotesk` 从未加载，display 字体全线 fallback

**现象**：所有 `font-display` 元素（h1、h2、页脚大字、统计数字）实际渲染为 Noto Sans SC，标题失去工业几何感。截图里 `RHINE ARCHIVE OS` 的字形圆润、中宫偏大，是典型中文黑体拉丁字形，并非 Space Grotesk。

**根因**：
- `app/globals.css:60` 声明 `--font-display: "Space Grotesk", ...`
- `app/globals.css` 的 5 个 `@font-face` 中**没有** Space Grotesk
- `public/fonts/SpaceGrotesk.woff2`（17.9 KB）文件存在但无人引用
- `scripts/subset-fonts.mjs` 的 `JOBS` 数组里也没有它的条目

**修复规格**：

```css
/* app/globals.css —— 追加到 @font-face 区 */
@font-face {
  font-family: "Space Grotesk";
  src: url("/fonts/SpaceGrotesk.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;
}
```

```js
// scripts/subset-fonts.mjs —— 追加到 JOBS 数组
{ src: "SpaceGrotesk-Regular.ttf", out: "SpaceGrotesk.woff2", family: "latin" },
```

> **前置检查**：确认 `source-assets/fonts/SpaceGrotesk-Regular.ttf` 存在。若不存在，用 `public/fonts/SpaceGrotesk.woff2` 反推不可行——需从 Google Fonts 重新取源文件放入 `source-assets/fonts/`。**若拿不到源文件，退而求其次**：改用已加载的 `Instrument Sans`（同属几何无衬线，字形偏工业）作为 display 字体：
> ```css
> --font-display: "Instrument Sans", "Space Grotesk", "Noto Sans SC", system-ui, sans-serif;
> ```
> 这样至少保证 display 层有独立的英文字形，不会掉到中文字体。

**验收**：DevTools → Computed → `font-family` 显示 `Space Grotesk`（或 Instrument Sans），且 Network 面板有 `/fonts/*.woff2` 请求返回 200。

---

#### P0-03 · latin / mono 字体子集只含 ASCII，符号字符全部 fallback（字形混排）

> **实测澄清（重要，避免误判）**
> 我最初怀疑页面底部出现"豆腐块"，并做了隔离测试：用 `@font-face` 单独加载 `public/fonts/JetBrainsMono-Regular.woff2` 与 `Jost-Regular.woff2`，渲染 `© · ⌘ ▸ ◂ ▓ —`。
> **结果：全部正常显示，没有 tofu。** 因为浏览器在字体缺字时会**自动 fallback 到系统字体**。
> 进一步截取 1440×2200 全高页面确认：底部那个"白色方块 + 圆点"其实是 **footer 大字 `Leersxie.` 被视口边缘截断**后的顶部笔画，**不是缺陷**。
> 因此本条**降级为 P1 级视觉一致性问题**，而不是阻断性 bug。但代码层面的缺陷是真实的，仍应修复。

**代码事实（已核实）**：
```js
// scripts/subset-fonts.mjs:91
const text = job.family === "cjk" ? cjkText : ASCII;
```
`latin` 与 `mono` 两类字体只按 `ASCII` 常量（` !"#$%&'()*+,-./0-9:;<=>?@A-Z[\]^_\`a-z{|}~`）子集化。而代码里实际使用了一批非 ASCII 装饰字符：

| 字符 | U+ | 出现位置 | 声明的字体 | 实际渲染 |
|---|---|---|---|---|
| `©` | 00A9 | `AppShell.tsx:498` footer | JetBrains Mono | 系统字体 |
| `·` | 00B7 | `AppShell.tsx:499` footer | JetBrains Mono | 系统字体 |
| `⌘` | 2318 | `AppShell.tsx:430` 顶栏 | JetBrains Mono | 系统字体 |
| `▸` | 25B8 | 全站多处（`mono-tag`、PREV/NEXT、BootSequence） | JetBrains Mono | 系统字体，**实心三角** |
| `◂` | 25C2 | `posts/[slug]/page.tsx:98` | JetBrains Mono | 系统字体 |
| `▓` | 2593 | `BootSequence.tsx:131` | JetBrains Mono | 系统字体 |
| `—` | 2014 | 文案内 | Jost / Noto | 系统字体 |
| `›` `‹` | 203A/2039 | 分页/灯箱 | JetBrains Mono | 系统字体 |

**真实后果**（不是豆腐块，但同样是缺陷）：
1. **字形不匹配**：`▸` 在系统字体里是**实心黑三角**，而 JetBrains Mono 的三角是**细线等宽三角**。混在 `.mono-tag` 的小字距排版里，会显得"粗一号、不对齐"。
2. **字体切换闪烁**：fallback 会触发一次额外的字体匹配，首帧可能有微小位移。
3. **不可控**：不同平台（Windows/macOS/Linux）的 fallback 字体不同，`▸` 在 mac 上是 `Menlo`、在 Windows 上是 `Segoe UI Symbol`，**视觉不可预期**。

**修复规格**：

```js
// scripts/subset-fonts.mjs —— 在 ASCII 常量后新增
const SYMBOLS =
	"©®™·•‥…—–‒―‹›«»“”‘’" +
	"▸◂▹◃◆◇■□▪▫●○◎★☆✦✧" +
	"⌘⌥⇧⌃⏎⎋" +
	"▓▒░█▌▐" +
	"×÷±≈≠≤≥∞√∑∏∫" +
	"←↑→↓↔↕" +
	"「」『』【】〔〕《》〈〉" +
	"，。！？；：、～　";

// 替换第 91 行
const text = job.family === "cjk" ? cjkText : ASCII + SYMBOLS;
```

> **更稳的做法（推荐）**：不要依赖"每个字体都有这些符号"。
> 在 `@theme` 里给 mono 声明**显式的 fallback 链**，并交叉验证：
> ```css
> --font-mono: "JetBrains Mono", "Sarasa Mono SC", "Cascadia Mono", ui-monospace, monospace;
> ```
> 同时在 `.mono-tag` 里把 `▸` 这类装饰字符改成**纯 CSS 三角**（`border` 画的三角形或 `clip-path`），彻底摆脱字体依赖：
> ```css
> .arrow-r::after {
>   content: "";
>   display: inline-block;
>   width: 0; height: 0;
>   margin-left: 2px;
>   border-left: 4px solid currentColor;
>   border-top: 3px solid transparent;
>   border-bottom: 3px solid transparent;
>   vertical-align: middle;
> }
> ```

**验收**（修正后）：
- 全站 `▸ ◂ ⌘ © ·` 与周围等宽文字**基线对齐、粗细一致**（截图目测）
- 用 DevTools 的 Rendering 面板开启 "Show font metrics"，确认这些字符不再落到 fallback 字体
- **不要求"无方块"**（那本来就不是问题）

---

#### P0-03b · 页面底部视觉误判说明（给后续审查者的备注）

在 1440×1000 与 1440×2200 截图里，页面底部会出现一个**白色小方块 + 一个白色小圆点**。经查证：

- 位置：`main` 结束、`footer` 开始的交界处（`footer` 的 `pt-14` 之后）
- 成因：footer 大字 `Leersxie.`（`text-[clamp(2.5rem,7vw,5rem)] leading-none`）**被视口下边缘截断**，只露出字形顶部
  - 大写 `L` 的顶部横画 → 看起来像"实心方块"
  - 小写 `e` 的顶部弧线 → 看起来像"圆点"
- **结论：不是渲染缺陷，不需要修复。**
- **但**：这暴露了一个真实问题——`main` 的 `min-h-[calc(100dvh-8rem)]`（`AppShell.tsx:435`）会在内容很少的页面（如 `/archive/`）把 footer 推到首屏之外，导致"页脚永远要滚一下才看到"。这是 P1-02（空状态缺失）的伴生现象，用占位卡解决后自然缓解。

> **给 GLM 的提醒**：如果你在看到本文档时也"发现"了这个方块，不要当作 bug 修。它是页脚大字被视口截断，用 2200px 高度截图即可确认。

---

#### P0-04 · Hero 区三层文字互殴，主标题不可读

**现象**（1440×1000 截图）：`RHINE ARCHIVE OS` 大标题背后，`ArchiveArray` 渲染的 5 列 × 3 行档案卡把 `DOC.2617-179`、`留言板`、斑马条纹理直接铺在大标题中段；同时 `os-grid` 48px 网格线、`blob-morph` 色块叠加。**观感 = 三份文字重影**。

**根因**：
- `ArchiveArray.tsx:80` 容器 `absolute inset-0`，无任何模糊/降透明度
- 卡片内 `.array-box` 有 `border` + `bg-panel/70` + **两行文字**（编号 + 标题）+ 斑马条
- `app/page.tsx:69` 的内容容器 `relative` 但**无背景遮罩**，h1 直接压在阵列上
- `app/page.tsx:56` `os-grid opacity-60` 又叠了一层网格

**修复规格（推荐方案：阵列降级为"剪影层"）**：

阵列的价值在于**纵深与运动**，不在于"看得清卡片内容"。因此：

1. **卡片去文字化**（`ArchiveArray.tsx:100-118` 整块替换为纯几何）：
   ```tsx
   <div
     key={`${box.key}-${bi}`}
     className="array-box rounded-[3px] border border-white/10 bg-white/[0.02] p-3"
     style={{ height: `${88 + ((bi * 37 + ci * 19) % 56)}px` }}
   >
     {/* 只保留三条随机长度的数据条 —— 暗示"有内容"，但不构成可读文字 */}
     <div className="mb-2 h-[3px] w-[38%] rounded-[1px] bg-white/12" />
     <div className="mb-1.5 h-[2px] w-[72%] rounded-[1px] bg-white/8" />
     <div className="mb-1.5 h-[2px] w-[54%] rounded-[1px] bg-white/8" />
     <div className="mt-auto h-[10px] w-[30%] rounded-[1px] bg-[var(--color-primary)]/25" />
   </div>
   ```
   > 关键：**移除所有 `<span>{box.id}</span>` 和 `<p>{box.label}</p>`**。保留 `labels` prop 但仅用于生成高度/宽度伪随机序列，不再渲染文本。

2. **整层降不透明度 + 单向渐隐**：
   ```tsx
   <div ref={wrap} className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.55] [perspective:1100px]" aria-hidden>
   ```
   并在 h1 所在区域加一条"雾化带"：
   ```tsx
   <div className="pointer-events-none absolute inset-x-0 top-[38%] h-[34%] bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgb(20_18_39/0.92)_0%,transparent_78%)]" aria-hidden />
   ```

3. **移除 `os-grid`**（`app/page.tsx:56`）。48px 网格 + 3D 阵列 + 大标题，三者都是"结构线"，只需要一层。留阵列，删网格。

4. **`blob-morph` 保留但降到 12% 不透明度**，位置移到 h1 右上外沿，避免穿过标题：
   ```tsx
   <div className="blob-morph pointer-events-none absolute -right-24 -top-16 h-72 w-72 bg-[var(--color-primary)]/12 blur-[40px]" aria-hidden />
   ```

**备选方案（若不想动组件）**：给 h1 容器加玻璃底板
```tsx
<div className="relative mx-auto max-w-5xl px-6 pb-14 pt-16">
  <div className="pointer-events-none absolute inset-x-0 top-8 h-[62%] rounded-3xl bg-[#141227]/55 backdrop-blur-[6px]" aria-hidden />
  {/* ...原有内容，记得加 relative */}
```
缺点是削弱了"浮在阵列上"的空间感，优先用方案一。

**验收**：1440px 截图，h1 任意字母后景不得出现可辨认的文字/数字；对比度目测 ≥ 7:1。

---

#### P0-05 · Hero 底部渐隐色错误（浅色渐变污染深色面板）

**现象**：Hero 面板下沿出现一条**比面板更亮**的横向带（截图 `/` 页面 y≈290–300px 区间），面板顶部也有轻微亮带。

**根因**：
```tsx
// components/ArchiveArray.tsx:126-127
<div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
<div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
```
`--color-bg` 在暗色模式是 `#0a0c12`（近黑），而 `.hero-panel` 的背景是 `#141227 → #1b2140`（深蓝紫）。
`#0a0c12` 比 `#141227` **更暗更冷**，在蓝紫面板上形成一条"黑洞带"，视觉上像一条瑕疵横纹。而在**亮色模式**下更糟：`--color-bg` = `#f4f5f7`，接近白色，直接在深色面板上刷出两条白带。

**修复规格**：

```tsx
// ArchiveArray.tsx —— 渐隐色改为继承，而非硬编码 --color-bg
<div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[var(--array-fade-top,transparent)] to-transparent" />
<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--array-fade-bottom,transparent)] to-transparent" />
```
在 `app/page.tsx` 的 hero `<section>` 上定义：
```tsx
<section className="hero-panel relative overflow-x-clip [--array-fade-top:#141227] [--array-fade-bottom:#1b2140]">
```
或者更简单——**直接删掉这两个渐隐层**。因为 P0-04 已经让阵列变淡，不再需要渐隐来保护标题可读性；而 Hero 面板本身 `overflow-hidden` + `border-b` 已经收边。

> **推荐：删掉。** 少两个 DOM 层，少两处颜色耦合。

**验收**：Hero 上下边缘无任何"比面板更亮/更暗的水平条带"。

---

#### P0-06 · 【已撤销 · 误判】`out/` 只有 1 篇文章不是 bug

> **这一条我判断错了两次，最终结论是：构建行为完全正确，不需要修任何代码。**

**我最初的判断（错误）**：`content/posts/` 有 4 篇、`out/posts/` 只有 1 篇 → 认为 `out/` 是旧构建、构建丢了 3 篇文章。

**第一次修正**：跑了 `pnpm build`（在沙盒里被拦，见下），检查 `.next/server/app/posts/`，发现**上次构建也只生成了 guestbook 一个页面**。说明不是"out 过期"，而是构建本身就只认 1 篇。

**真正原因（已核实）**：4 篇文章的 frontmatter 里，3 篇标了 `draft: true`：

| 文件 | draft | encrypted | 是否发布 |
|---|---|---|---|
| `cs2.md` | `true` | `true` | ❌ |
| `first-blog.md` | `true` | — | ❌ |
| `guestbook.md` | — （有 `pinned: true`） | — | ✅ |
| `xiangtuzhongguo-analysis.md` | `true` | `true` | ❌ |

而 `lib/posts.ts:61` 的逻辑是：
```ts
return (await getAllPostsRaw()).filter((p) => !p.draft || !isProd());
```
`next build` 是 production 环境 → `isProd()` 为 true → **所有 draft 被过滤**。

**结论**：
- `/archive/` 只显示 1 条 = 正确
- `/posts/first-blog/` 返回 404 = 正确（draft 不生成静态页）
- **不需要"修复"，也不需要重建 `out/` 来'找回'文章**

**真正需要处理的是内容策略，不是代码**（移到 P1-02 讨论）：
1. 你现在**只有 1 篇已发布内容**，所以"档案阵列空荡"是内容现状，不是设计缺陷。
2. 三条路，任选其一：
   - **A. 发布内容**：把准备好的文章去掉 `draft: true`（`encrypted` 的保留密码保护，加密是另一个机制，不影响生成）。
   - **B. 接受空态并设计它**：见 P1-02 占位卡方案——把"内容少"翻译成"档案位待写入"的世界观。
   - **C. 让 draft 在开发环境可见**：`pnpm dev` 下 `isProd()` 为 false，所有 draft 都会出现。**这是本地预览看到 4 篇的正确方式**。

> **给 GLM 的指令**：不要为了"让 archive 页面好看"而修改 `lib/posts.ts` 的过滤逻辑，也不要批量把 `draft: true` 改成 `false`。内容发布是用户的决定。你只需要按 P1-02 做好空状态。

**附：我的构建验证为什么失败（环境问题，非项目问题）**

在沙盒里跑 `pnpm build` 时报：
```
Error: [safe-delete][SAFE_DELETE_BULK_CONFIRM_REQUIRED] {"count":50,...}
  at checkBulkDeleteGuard (node-safe-delete-shim.cjs)
PROGRAM BLOCKED BY SECURITY POLICY - wmic.exe 在黑名单
```
这是**执行环境的文件删除保护 + 程序黑名单**（`next build` 需要清理 `.next` 且 Next.js 会探测 `wmic`），**与项目代码无关**。

**给用户的动作**：在你自己的终端里（不经过任何沙盒）跑一次：
```bash
cd "H:\Zcode cangku\Leersxie.github.io"
pnpm build
```
若通过，说明基线是绿的，可以放心交给 GLM 改。

**验收（修正后）**：
- `pnpm build` 在真实终端通过
- `out/posts/` 下只有 `guestbook/` —— **这是对的**
- 若想让本地预览看到全部 4 篇，用 `pnpm dev` 而非 `serve out`

---

### 1.2 P1 级问题（体验与信息架构）

#### P1-01 · 版心过窄，1440px 下右侧 500–670px 纯空

**实测**：

| 页面 | 版心类名 | 实际内容宽 | 右侧空白 | 视觉印象 |
|---|---|---|---|---|
| `/archive/` | `max-w-5xl` | ~1024px 内只有 1 行内容 | — | **80% 垂直空白 + 内容全在左上** |
| `/about/` | `max-w-2xl`（约 672） | ~540px | ~670px | 内容像浮在左上角的小卡片 |
| `/friends/` | `max-w-5xl` | 网格 2 列 ~600px | ~600px | 重心严重偏左 |
| `/posts/[slug]` | `max-w-3xl`（768） | ~720px | ~530px | 可接受，但缺目录 |

**根因**：所有页面共用"居中单列"心智，但**没有第二列的内容可填**。而 ignoredone 的做法是**头部双栏（`1fr 1fr; gap:80px`）+ 主体多列网格**，把横向空间吃干。

**修复规格**：

1. **文章页加右侧粘性目录（TOC）**：
   ```tsx
   // app/posts/[slug]/page.tsx —— article 内外层改造
   <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_200px]">
     <article>{/* 原有内容 */}</article>
     <aside className="hidden lg:block">
       <div className="sticky top-24">
         <p className="mono-tag mb-3">// INDEX</p>
         <nav className="space-y-1.5 border-l border-[var(--color-line)] pl-3">
           {toc.map(h => (
             <a key={h.id} href={`#${h.id}`}
                className="block truncate text-xs text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
                style={{ paddingLeft: `${(h.level - 2) * 10}px` }}>
               {h.text}
             </a>
           ))}
         </nav>
       </div>
     </aside>
   </div>
   ```
   `toc` 数据可在 `lib/posts.ts` 解析 HTML 时用正则抓 `<h2 id="...">` 生成（项目已启用 `rehype-slug`，标题自带 id）。

2. **列表页改 3→4 列**（`app/page.tsx:121`）：
   ```tsx
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
   ```

3. **子页头部改双栏**（`/archive/` `/friends/` `/projects/` 统一）：
   ```tsx
   <header className="grid gap-6 border-b border-[var(--color-line)] pb-8 md:grid-cols-[1fr_auto] md:gap-16">
     <div>
       <p className="mono-tag mb-2">// OPERATION LOG</p>
       <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.02em]">归档 · 作战记录</h1>
     </div>
     <div className="flex items-end gap-6 md:justify-end">
       {/* 右列：统计 / 筛选 / 视图切换 —— 把空白吃掉 */}
     </div>
   </header>
   ```
   右列放什么：`RECORDS 04 · WORDS 8,412 · SPAN 2025-2026` 三组数字（`tabular-nums`）。

**验收**：1440px 下任一子页，右侧空白 ≤ 320px；`/posts/*` 出现可点击目录。

---

#### P1-02 · 空状态完全缺失

**现象**：`/archive/` 只有 1 条记录，页面 80% 是纯背景色。没有任何"这里本来应该有东西"的暗示，看起来像**渲染失败**。

**成因（已核实，非 bug）**：4 篇文章中 3 篇是 `draft: true`，production 构建按 `lib/posts.ts:61` 正确过滤，只剩 `guestbook` 一篇。详见 P0-06。

**这才是真正的设计问题**：**内容少不是缺陷，但"内容少"没有被设计过**。用户打开 archive 看到 80% 空白，第一反应是"网站坏了"而不是"这里还没写"。

**根因**：`app/page.tsx:127` 只处理了 `posts.length === 0` 的极端情况，没处理"少量"。

**修复规格（方舟式处理：填充"待归档占位卡"）**：

```tsx
// 当 posts.length < 6 时，补齐占位卡
const placeholders = Math.max(0, 6 - posts.length);

{Array.from({ length: placeholders }).map((_, i) => (
  <div key={`ph-${i}`}
    className="flex flex-col rounded-xl border border-dashed border-[var(--color-line)] p-5 opacity-45"
    aria-hidden>
    <div className="mb-3 flex items-center justify-between">
      <span className="mono-tag">DOC.——-PENDING</span>
      <span className="font-mono text-[10px] text-[var(--color-muted)]">--</span>
    </div>
    <p className="mb-2 font-mono text-sm text-[var(--color-muted)]">NO RECORD</p>
    <p className="mb-4 font-mono text-[11px] text-[var(--color-muted)]">该档案位尚未写入。</p>
    <div className="mt-auto flex gap-2">
      <span className="h-4 w-12 rounded border border-dashed border-[var(--color-line)]" />
      <span className="h-4 w-10 rounded border border-dashed border-[var(--color-line)]" />
    </div>
  </div>
))}
```

**为什么这样比"留白"好**：方舟的档案系统本身就是"编号 + 空位 + 待解密"的语义。占位卡把"内容少"从缺陷翻译成了**世界观的一部分**。这是最省力的优雅。

**验收**：`/archive/` 在只有 1 篇文章时，网格仍是 3 列 × 2 行的完整视觉块。

---

#### P1-03 · 圆角语言不统一（5 种以上混用）

**现状盘点**：

| 元素 | 现用值 | 位置 |
|---|---|---|
| `.nav-item` | `999px`（胶囊） | `globals.css:158` |
| `.archive-card` | 无圆角（靠调用处 `rounded-xl`=12px） | `globals.css:176` + `page.tsx:14` |
| 命令面板 | `rounded-xl` = 12px | `AppShell.tsx:134` |
| 顶栏检索按钮 | `rounded-full` | `AppShell.tsx:427` |
| 侧栏折叠按钮 | `rounded-full` | `AppShell.tsx:373` |
| 标签 chip | 无圆角（`rounded` = 4px） | `page.tsx:33` |
| Logo 方块 | `rounded-md` = 6px | `AppShell.tsx:276` |
| 移动端菜单按钮 | `rounded-full` | `AppShell.tsx:395` |
| 正文 code | `4px` | `globals.css:269` |
| 正文 pre | `0.5rem` = 8px | `globals.css:275` |

**ignoredone 的做法是只有 4 档**（见 2.4 节），且**严格按"元素体积"分级**：体积越大圆角越大，永不错配。

**修复规格**：在 `@theme` 里定义四档，全站只允许引用这四档：

```css
@theme {
  /* --- 圆角：四档制 --- */
  --radius-pill: 999px;   /* 胶囊：导航项 / 按钮 / 标签 / 输入框 */
  --radius-card: 14px;    /* 卡片 / 面板 / 命令面板 */
  --radius-menu: 10px;    /* 菜单项 / 列表行 / 内嵌小块 */
  --radius-tag: 4px;      /* 极小标签 / 行内 code / 状态徽标 */
}
```

映射表（直接照改）：

| 元素 | 改为 |
|---|---|
| `.nav-item` | `var(--radius-pill)` ✅ 已对 |
| `.archive-card` + 调用处 | `var(--radius-card)`，**删掉调用处的 `rounded-xl`**，让组件自持 |
| 命令面板容器 | `var(--radius-card)` |
| 命令面板列表项 | `var(--radius-menu)` |
| 顶栏检索按钮 / 侧栏折叠 / 移动菜单 | 保持 `var(--radius-pill)` |
| 标签 chip | `var(--radius-tag)` |
| Logo 方块 | `var(--radius-menu)` |
| 正文 code | `var(--radius-tag)` |
| 正文 pre | `var(--radius-card)` 的一半 → `8px`（代码块可例外，单独 token `--radius-code: 8px`）|

**验收**：全站 grep `rounded-`，出现次数 ≤ 5 个映射到 token 的工具类；无裸数字圆角。

---

#### P1-04 · 顶栏 / 侧栏信息密度失衡

**现象**：
- 桌面顶栏只有 `RHINE ARCHIVE OS // HOME` + 时钟 + 检索按钮 → **1200px 宽的条，只有 3 个信息块**
- 侧栏 `RECENT ARCHIVES` 之后到 `border-t` 之间有约 380px 纯空白（截图 `/` 页面 y=250–660）

**修复规格**：

1. **顶栏三段式**（左：上下文 / 中：系统状态 / 右：操作）：
   ```tsx
   <header className="sticky top-0 z-30 hidden h-12 items-center justify-between gap-6 border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 px-6 backdrop-blur md:flex">
     {/* 左：路径 */}
     <div className="flex min-w-0 items-center gap-3">
       <p className="mono-tag shrink-0">{SITE.osName}</p>
       <span className="text-[var(--color-line-strong)]">/</span>
       <p className="mono-tag truncate text-[var(--color-ink)]">{activeTag}</p>
     </div>
     {/* 中：状态灯组 —— 吃掉空白，强化 OS 拟态 */}
     <div className="hidden items-center gap-5 lg:flex">
       <StatusDot label="SYS" state="ok" />
       <StatusDot label="ARCHIVE" state="ok" />
       <StatusDot label="GISCUS" state={giscusReady ? "ok" : "idle"} />
       <span className="font-mono text-[10px] tabular-nums text-[var(--color-muted)]">
         UPTIME {uptime}
       </span>
     </div>
     {/* 右：操作 */}
     <div className="flex items-center gap-4">
       <Clock />
       <button ...>检索档案 <kbd>⌘K</kbd></button>
     </div>
   </header>
   ```
   `StatusDot` 一个小圆点 + 大写短标签，`ok` 用 `var(--color-signal)`，`idle` 用 `var(--color-muted)`，带 2s 呼吸。

2. **侧栏空白区填"板块速览"**（替代纯 `flex-1` 空白）：
   在 `RECENT ARCHIVES` 列表下方插入：
   ```tsx
   {!collapsed && (
     <div className="mt-5 px-2">
       <p className="mono-tag px-3 pb-2">MODULES</p>
       <div className="grid grid-cols-2 gap-1">
         {NAV_ITEMS.map(n => (
           <Link key={n.href} href={n.href}
             className="rounded-[var(--radius-menu)] border border-[var(--color-line)] px-2.5 py-2 transition hover:border-[var(--accent)]">
             <p className="font-mono text-[9px] tracking-widest text-[var(--color-muted)]">{n.tag}</p>
             <p className="text-xs">{n.label}</p>
           </Link>
         ))}
       </div>
     </div>
   )}
   ```

3. **侧栏底部社交链接升级为"图标 + 文字"两列**，当前是 3 个 10px 大写小字，太弱。

**验收**：1440×900 下侧栏无 >120px 的纯空白段；顶栏信息块 ≥ 5 组。

---

#### P1-05 · hover 反馈过载且各唱各的

**现状**：
- `.archive-card:hover`：600ms 斜向扫描光 + 边框变色（`globals.css:185-205`）
- 同时 `Reveal` 组件又在滚动进入时做 `translateY` 入场
- `page.tsx:38` 的 `OPEN ▸` 又是 `opacity 0→100`
- 结果：一次 hover 触发 **3 个独立动效**，600ms 还没结束

**ignoredone 的规格（实测自 CSS）**：
```css
.site-card:hover {
  transform: translateY(-4px);
  background: #ffffff;
  border-color: #ececec;
  box-shadow: 0 12px 26px rgba(0,0,0,.07);
  transition: transform .28s cubic-bezier(.22,.61,.36,1),
              background .28s ease, box-shadow .28s ease, border-color .28s ease;
}
.site-card:hover .site-logo { transform: scale(1.08); }
```
**只有一个位移 + 一个阴影 + 一个内部元素缩放。扫描光是没有的。**

**修复规格**：

1. **降级扫描光**：从 600ms 改为 380ms，从 `rgb(124 92 255 / 0.14)` 改为 `rgb(255 255 255 / 0.06)`（暗色下用白），并且**只在 `pointer: fine` 下启用**：
   ```css
   @media (pointer: fine) {
     .archive-card::before {
       background: linear-gradient(115deg, transparent 44%, rgb(255 255 255 / 0.07) 50%, transparent 56%);
       transition: transform 380ms var(--ease-os);
     }
     .archive-card:hover::before { transform: translateX(60%); }
   }
   @media (pointer: coarse) { .archive-card::before { display: none; } }
   ```

2. **统一 hover 位移曲线**：全站位移只用一条曲线
   ```css
   @theme { --ease-hover: cubic-bezier(0.22, 0.61, 0.36, 1); }
   ```
   `.archive-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgb(0 0 0 / 0.28); }`（暗色）

3. **`OPEN ▸` 从 hover 才出现改为常驻**，只做颜色变化。理由：隐藏式 CTA 在触屏上永远不可见。

**验收**：hover 一张卡片，300ms 内到达终态；不同组件的位移幅度差 ≤ 1px。

---

#### P1-06 · 全站零图像，缺"视觉锚点"

**现象**：所有页面都是纯色块 + 文字 + 线框。`.hero-panel` 是渐变，`.archive-card` 没有封面，`.friends` 是单字母方块。**没有任何一张真实图像**。

而 ignoredone 首页有**整屏摄影背景**（`--bg-image`），全靠 `mask-image` 开洞来"露出"；方舟官网同样大量使用 KV 图与立绘。

**修复规格（低成本方案）**：

1. **Hero 加一层"档案纸纹理"**（纯 CSS，无资源依赖）：
   ```css
   .hero-texture {
     background-image:
       /* 细密网点 */
       radial-gradient(circle, rgb(255 255 255 / 0.05) 1px, transparent 1.2px),
       /* 扫描线 */
       repeating-linear-gradient(0deg, rgb(255 255 255 / 0.022) 0 1px, transparent 1px 3px);
     background-size: 4px 4px, 100% 3px;
     mix-blend-mode: overlay;
   }
   ```
   叠在 hero 上，`opacity: 0.6`。

2. **`CoverArt` 组件已有**（`components/CoverArt.tsx`），确认它在每张卡片上都用了。若没有，加 16:9 顶部封面条 —— 用 `slug` 做种子生成确定性几何图形（不引入外部图）。

3. **友链卡片头像**从"单字母 + 紫色渐变"改为**几何徽记**：
   ```tsx
   <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-menu)] border border-[var(--color-line)] bg-[var(--color-panel-2)]">
     {/* 左上 45° 切角 + 中央字母 + 右下小方块 */}
     <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-[var(--color-ink)]">
       {name[0]}
     </span>
     <span className="absolute -right-2 -bottom-2 h-4 w-4 rotate-45 bg-[var(--accent)]/30" />
   </div>
   ```

**验收**：Hero 区有可感知的材质层（缩放截图能看到网点）；卡片不再是纯文字块。

---

### 1.3 P2 级问题（打磨清单，逐条可直接改）

| # | 问题 | 位置 | 修法 |
|---|---|---|---|
| P2-01 | `::selection` 紫色 0.25 太淡，选中几乎看不出 | `globals.css:102` | 改 `rgb(124 92 255 / 0.42)`；暗色下用 `rgb(155 133 255 / 0.38)` |
| P2-02 | 滚动条 10px 宽，占位显眼 | `globals.css:105` | 改 6px；thumb 用 `--color-line-strong`，border 2px |
| P2-03 | `mono-tag` 0.6875rem(11px) / 0.14em，1440px 下偏小且过散 | `globals.css:125` | 改 0.75rem(12px) / 0.12em；中文场景另设 `.mono-tag--cn` 用 0.04em |
| P2-04 | 统计数字未用 `tabular-nums`，滚动时宽度跳动 | `page.tsx:96` | `RollingNumber` 外层加 `tabular-nums` |
| P2-05 | `.prose-os h2` 是"左竖线 3px"，与"档案编号"语言不匹配 | `globals.css:223` | 改：`h2::before` 渲染 `§` 或两位数序号 + 竖线 2px；见附录 A.3 |
| P2-06 | 正文 `line-height 1.85` / `font-size 0.9375rem(15px)`，长文偏挤 | `globals.css:209` | 改 `1.9` / `1rem(16px)`；`letter-spacing: 0.01em` |
| P2-07 | 代码块 `background: #0c0e15` 在亮色模式下突兀 | `globals.css:273` | 加 `.light .prose-os pre { background: #f7f8fa; border-color: #e4e7ec }` 并同步 hljs 前景 |
| P2-08 | Giscus 未跟随明暗主题切换 | `components/Giscus.tsx` | 监听 `MutationObserver` 到 `documentElement.class`，`postMessage({giscus:{setConfig:{theme:...}}})` |
| P2-09 | BootSequence 1.9s 无进度指示，用户不知要等多久 | `BootSequence.tsx` | 底部加 1px 进度条 `scaleX` 0→1（1900ms linear）+ 右侧 `0x3A / 0x64` 计数器 |
| P2-10 | 404 页只有"返回首页"，无"返回上一页" | `app/not-found.tsx` | 加 `<button onClick={() => history.back()}>` 次级按钮，样式为 `border` 而非填充 |
| P2-11 | 移动端顶条时钟挤压标题 | `AppShell.tsx:390-391` | `<Clock />` 在小屏 `hidden xs:inline`，或只显示 `HH:MM` |
| P2-12 | 页脚大字 `tracking-tight` 不够极端 | `AppShell.tsx:440` | 改 `tracking-[-0.045em] leading-[0.82]`，字号 clamp 上限提到 6rem |
| P2-13 | 侧栏 Logo 是 `from-primary to-indigo` 渐变方块，太"互联网产品" | `AppShell.tsx:276` | 改：`bg-[var(--color-ink)]` + 白色 `LX` 字 + 右上角 2px 信号色小方块（方舟式） |
| P2-14 | 命令面板无分类/快捷键提示 | `AppShell.tsx:128-176` | 底部加一条 `↑↓ 选择 · ⏎ 打开 · ESC 关闭` 的 kbd 行 |
| P2-15 | 文章页 `ReadingProgress` 2px 渐变，与"档案"语言无关 | `globals.css:395` | 改 3 段刻度条（`repeating-linear-gradient`），见附录 A.4 |
| P2-16 | 无 `prefers-reduced-transparency` 支持 | 全局 | `@media (prefers-reduced-transparency: reduce) { .glass-panel { backdrop-filter: none; background: var(--color-panel) } }` |
| P2-17 | 暗色下 `--color-primary` 提到 `#9b85ff`，但 `--color-primary-deep` 也提到 `#b7a4ff`（更亮），层级反转 | `globals.css:80-81` | deep 应比 primary **暗**或同亮度加饱和，改为 `#8168ff` |
| P2-18 | Hero 面板内 `.mono-tag` 仍是全局 `--color-muted`，与面板对比不足 | `page.tsx:67-68` | `.hero-panel .mono-tag { color: rgb(255 255 255 / 0.42) }` |
| P2-19 | 归档页年份分隔 `2026` 只有 16px 字号，无层级感 | `app/archive/page.tsx` | 改 `font-display text-4xl font-normal tracking-[-0.02em]` + 右侧一条 `flex-1` 虚线 |
| P2-20 | 全站无 `focus-visible` 样式（键盘可达性） | 全局 | 统一 `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; border-radius: inherit }` |

---

### 1.4 文案与语气诊断（"文字搭配"专项）

> 这一节独立成节，因为**文字是设计的一半**。方舟最强的不是视觉，是"所有文案都像同一个人写的"。

#### 现状：三种语气在同一屏内打架

| 位置 | 现文案 | 语气 |
|---|---|---|
| Hero 打字机行 1 | `欢迎访问 LX 的档案库。这里存放随笔、项目与记录。` | **公告式**（"欢迎访问"） |
| Hero 打字机行 2 | `RHINE ARCHIVE OS v2 · 系统就绪 · 全部档案可检索（⌘K）` | **系统式**（术语 + 状态） |
| Hero 打字机行 3 | `读你想读的，剩下的交给时间。` | **文艺式**（散文腔） |
| Hero 描述 | `把思考归档成可以被再次找到的东西。玄学、项目、生活记录，都在这份阵列里。` | **混合**（前半文艺，后半说明书） |
| 归档页标题 | `归档 · 作战记录` | **术语式**（好） |
| 归档页小签 | `// OPERATION LOG` | **系统式**（好） |
| 404 | `请求的档案不存在，或已在一次重构中被移入深海。` | **叙事式**（好，有世界观） |

**问题本质**：行 1 的"欢迎访问"把用户当访客，行 2 把用户当操作员，行 3 把用户当读者。**同一个人在同一屏被叫了三次不同的名字。**

#### 方舟的语气配方（可直接套用）

拆解 `ak.hypergryph.com` / 游戏内文本 / `ignoredone` 的文案，共性有四条：

| 原则 | 表现 | 反例（不要这样） |
|---|---|---|
| **不用第二人称祈使** | "开始行动" 而不是 "点击开始" | "快来试试吧！" |
| **不用感叹号 / 不用"欢迎"** | "A WORLD FAMILIARLY UNKNOWN" | "欢迎来到我的博客！" |
| **状态优先于抒情** | "系统就绪" / "信号丢失" / "档案已封存" | "时间会给你答案" |
| **术语即装饰** | `OPERATION LOG` / `SIGNAL LOST` / `ACCESS GRANTED` / `DOC.261005` | "最新文章列表" |

#### 改写规格（逐条替换）

| 位置 | 现文案 | 建议文案 | 理由 |
|---|---|---|---|
| Hero 打字机 1 | `欢迎访问 LX 的档案库。这里存放随笔、项目与记录。` | `终端已连接。当前档案库包含随笔、项目与记录。` | 保留"介绍"功能，但换成系统播报口吻 |
| Hero 打字机 2 | `RHINE ARCHIVE OS v2 · 系统就绪 · 全部档案可检索（⌘K）` | ✓ 保留 | 这条已经是标准答案 |
| Hero 打字机 3 | `读你想读的，剩下的交给时间。` | `检索索引已建立。输入关键词，或直接开始阅读。` | 去掉散文腔，改成"操作提示" |
| Hero 描述 | `把思考归档成可以被再次找到的东西。玄学、项目、生活记录，都在这份阵列里。` | `把思考归档成可以被再次找到的东西。` | **砍掉后半句**。前半句已经完整，后半句是解释，削弱力量 |
| 归档页 h1 | `归档 · 作战记录` | ✓ 保留 | 好 |
| 空状态 | 无 | `该档案位尚未写入。` | 见 B4-1 |
| 404 | `请求的档案不存在，或已在一次重构中被移入深海。` | ✓ 保留 | 这条是全站文案最佳，保留 |

**一条通用判据**：**能删掉一半的句子，就删掉一半。** 方舟的文案几乎都是短句 + 句号，没有"其实""真的""非常"。

#### 中英混排规则（统一执行）

现状不统一：有时 `// ARCHIVE ARRAY` 在中文标题**上方**，有时在下方，有时没有。建议固定为**英文小签在上、中文标题在下**，且英文永远全大写 + `+0.1em` 字距 + `--color-muted`：

```tsx
<p className="mono-tag">// ARCHIVE ARRAY</p>          {/* 英文：位置固定在上 */}
<h2 className="font-display text-xl font-bold tracking-[-0.02em]">档案阵列</h2>
```

四条硬规则：
1. **英文只做标签，不做内容** —— 不用英文句子，只用 `名词` 或 `名词 名词`
2. **英文永远 uppercase** —— 小写英文会破坏"刻度感"
3. **英文永远正字距（`0.1em–0.16em`），中文永远负字距或 0**
4. **同一页面内，英文前缀只用一种** —— 现在混用了 `//`、`·`、`[ ]`、`SYS.`。建议统一用 `//`（注释感），`[ ]` 只用于系列名，`·` 只用于同一行内的分隔

#### 命名一致性（编号系统）

现有编号 `DOC.261005-GUESTB` 是很好的资产，但规则没写清：
- `DOC.` + `YYMMDD` + `-` + `SLUG前6位大写` → `DOC.261005-GUESTB`
- 建议补一条：**编号必须全局唯一且可排序**，`docId()` 已实现，但 `posts.length` 变化时可能重复。检查 `lib/posts.ts` 的 `docId` 实现，确保基于 `published` 日期而非索引。

---



### 1.5 现状优点（改造时务必保留）

写这份清单是为了防止 GLM"顺手优化掉"真正好的东西。

1. **`BootSequence` 的克制** —— 1.9s、可跳过、`sessionStorage` 只播一次、reduced-motion 直接跳过。这是教科书级的开屏实现，**不要加长、不要加重**。
2. **`ArchiveArray` 的性能自觉** —— `IntersectionObserver` + `visibilitychange` 双重暂停、`prefers-reduced-motion` 静止、纯 CSS 3D 无 WebGL 兜底。**保留这套机制**，只改视觉。
3. **`HeroVisual` 的渐进增强** —— CSS 3D 立刻可见 → 600ms 后检测能力 → 1500ms GL 淡入接管 → 失败永久停在 CSS 版。**这个编排逻辑不要动。**
4. **`CommandPalette` 的 ⌘K** —— 键盘优先、ESC 关闭、`NO RECORD FOUND` 空状态文案。保留并只做视觉升级。
5. **音效默认关闭** —— 尊重用户。保留。
6. **板块主题色随路由 800ms 缓动** —— 这个想法本身很好（ignoredone 每个板块也有独立性格），问题只是**颜色太多**，不是机制错。保留机制，见第 3 章的收敛方案。

---

## 2. ignoredone.space 全站逆向拆解

> 拆解基于：首页 + `designwebsite` + `fontlab` + `arknights_design` + `portfolio` + `resource` + `personaldesign` 的 HTML/CSS 原文（curl 抓取，非渲染快照），以及 `designwebsite` 页 22KB 内联 CSS 的逐行阅读。

### 2.1 站点地图（14 个板块）

```
ignoredone's space
├── 首页                    /
├── 学方舟做设计             /arknights_design/      ← 学习核心
├── 学习工程                /learningproject/
├── 免费工程                /free_project/
├── 个人作品                /personaldesign/        ← 作品集（含动态加载）
├── 终末地设计              /endfield_design/
├── 视频设计                /graphic-design-arknights/
├── 封面设计                /coverdesign/
├── IgnoBoard              /ignoboard/             ← 自研工具（品牌资产）
├── 字体库                  /fontlab/                ← 56 款字体 + 筛选器
├── 设计导航                /designwebsite/          ← 82 个资源 + 三视图
├── 作品库                  /portfolio/
├── 图文教程                /article-arrangement/    ← 三级教程入口
├── 学习端口                /ignoredone-project/     ← 工程文件下载
├── 资源共享                /resource/               ← 按活动/年份归档
└── 自制图标库              /iconasset-2/
```

**值得学的信息架构决策**：
1. **"学习"与"作品"分离** —— 教程/工程文件/资源 ≠ 个人作品集。很多人把两者混在一起，导致"想学的人找不到，想看作品的人被教程烦"。
2. **"工具"作为独立板块** —— IgnoBoard 有自己的落地页（版本号 v1.1.6 / 特性九宫格 / 更新日志 / 视频演示）。**个人开发者把自研工具当产品页做，是建立专业度的最短路径。**
3. **"导航"作为独立板块** —— 82 个外部资源做成带搜索/分类/三视图的数据库，而不是 `footer` 里的一坨链接。**这一条对你的"友链"页直接适用。**
4. **"字体库"作为独立板块** —— 56 款字体带实时预览 + 字重/分类筛选。你的博客有 `--font-display` / `--font-body` / `--font-mono` 三档，完全可以把"字体"做成一个可交互的 about 子页，作为"设计态度"的展示。

### 2.2 首页视觉纵深（这是全站最核心的技法）

实测 z-index 层级表（**可直接复用到你的 hero**）：

| z | 层名 | 内容 | 关键 CSS |
|---|---|---|---|
| `-6` | `.bg-image` | 固定整屏摄影背景图 | `position:fixed; inset:0; background-size:cover; pointer-events:none` |
| `-5` | `.container::before` | **白色遮罩 + 动态开洞** | `background:white; opacity:0.35; mask-image: var(--mask-holes)` |
| `-4` | `.bg-glow` | 双暖光斑（黄） | 两组 `radial-gradient`（420px / 340px）坐标由鼠标 JS 写入；`mix-blend-mode: soft-light` |
| `-3` | `#waveCanvas` | three.js 波浪线 | `mask-image: radial-gradient(ellipse 85% 75% at 50% 50%, #000 45%, transparent 100%)` |
| `-2` | `.dot-matrix-bg` ×3 | 三层点阵 | 见 2.3 |
| `1–5` | `.spiral-dot` | 融球圆点 | `filter: url(#gooeyFilter)`；外层 anime 驱动 / 内层鼠标驱动 |
| `6` | `.audio-bar` | 毛玻璃音波 | `width:6px; height:1000px; backdrop-filter: blur(8px) saturate(150%)` |
| `100` | `.glass-bar` | 液态玻璃导航 | `backdrop-filter: blur(18px) saturate(170%)` |
| `9999` | `#preloader` / `#back-to-top` | 开屏 / 回顶 | `clip-path: circle()` |
| `999999` | `#custom-cursor` | 自定义光标 | 20px 圆 `#E3E3E3`，`pointer: fine` 才启用 |

#### 核心技法：`mask-image` 开洞

这是整个站点最值得抄的一手。原文（`BLOCK 32`）：

```css
/* 白色遮罩，压在背景图之上 */
.container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0.35;
  z-index: -5;
  mask-image: var(--mask-holes, none);
  mask-repeat: no-repeat;
  mask-composite: add;
}

/* 每个"蒙版圆点"只作为坐标占位，本身不显示 */
.spiral-dot.is-mask-hole .spiral-dot-core {
  background-color: transparent;
  opacity: 0;
}
```
JS 每帧读取黄圆点的位置，拼成 `--mask-holes: radial-gradient(circle 30vh at 35% 62%, transparent 98%, #000 100%), radial-gradient(...)` 写回 CSS 变量。

**效果**：屏幕上覆盖一层 35% 白雾，黄点所在位置"烧穿"白雾、露出底层高清摄影图。视觉隐喻是**显微镜 / 探照灯 / 被擦亮的表面**。

> **对你的直接应用**：Hero 区可以做「深色档案雾 + 鼠标处开洞露出 CoverArt 纹理」。成本：一个 `radial-gradient` 字符串 + rAF 更新 CSS 变量，**不到 40 行**，但视觉记忆点极强。

#### 三层点阵呼吸（可直接抄参数）

```css
.dot-matrix-bg {
  background-image: radial-gradient(circle, rgba(0,0,0,0.55) 1.5px, transparent 1.6px);
  background-size: 34px 34px;
  opacity: 0.10;                      /* min */
  animation: dotBreatheA 7.5s ease-in-out infinite;
}
.dot-matrix-bg.layer-2 {
  background-image: radial-gradient(circle, rgba(0,0,0,0.42) 1.1px, transparent 1.2px);
  background-size: 56px 56px;
  background-position: 17px 17px;      /* 错位，避免网格重合 */
  opacity: 0.34;                       /* max */
  animation: dotBreatheB 12s ease-in-out infinite;
}
.dot-matrix-bg.layer-3 {
  background-image: radial-gradient(circle, rgba(0,0,0,0.30) 0.9px, transparent 1px);
  background-size: 20px 20px;
  background-position: 5px 9px;
  animation: dotDrift 26s ease-in-out infinite;
}

@keyframes dotBreatheA {
  0%,100% { opacity: .10; transform: scale(1) translate3d(0,0,0); }
  50%     { opacity: .34; transform: scale(1.035) translate3d(0,-0.6%,0); }
}
```

**三个关键数字**：网格 `34 / 56 / 20px`（非整数倍关系）、点径 `1.5 / 1.1 / 0.9px`、周期 `7.5 / 12 / 26s`（互质取向，避免同步）。
**为什么是三层**：单层点阵是"贴图"，三层错周期点阵是"景深"。这是廉价的空间感。

### 2.3 配色系统

```css
:root {
  --yellow-color: #FFDE00;        /* 唯一饱和色 —— 全部强调都用它 */
  --text-color:   #000000;
  --bg-color:     #FFFFFF;
  --gray-color:   #CCCCCC;
  --white-color:  #FFFFFF;
  --background-opacity: 0.35;     /* 白雾强度 */
  --dot-color: 0, 0, 0;
  --dot-opacity-min: 0.10;
  --dot-opacity-max: 0.34;
}
```

辅助色（散落在各页）：
| 色值 | 用途 | 出现位置 |
|---|---|---|
| `#E3E3E3` | 预加载底 / 自定义光标 | `#preloader` / `#custom-cursor` |
| `#f4f3f1` | 卡片暖灰底 | `.site-card` |
| `#ebe9e5` | 卡片 hover 加深 | `.empty-rec-card:hover` |
| `#e07a5f` | **赭橙** 强调/收藏/失效徽标 | `.category-count` / `.is-favorite` / `.site-broken-badge` |
| `#1a1a1a` | 深色交互态（active 按钮） | `.view-btn.active` / `.category-btn.active` |
| `#141414` | 卡片标题字色 | `.site-text` |
| `#9b9b9b` | 卡片副标 | `.site-subtitle` |
| `#ececec` | 卡片 hover 边框 | — |

**核心原则（必须理解，否则抄不到精髓）**：

> **全站只允许出现一个饱和色。** 白底黑字 + 灰阶 + 一个 `#FFDE00`（或 `#e07a5f`）。
> 所有"强调"的表达方式不是"换颜色"，而是**换底色/换字重/换尺寸/换透明度**。

对比你的项目：`primary #7c5cff` / `primary-deep #6540f0` / `primary-soft #9b85ff` / `indigo-line #4f6bff` + 5 个板块 accent（`#7c5cff` `#4f6bff` `#3d8bff` `#2fb8d8` `#a06bff`）= **8 个饱和色同屏**。这就是"紫蓝糊成一片、没有重点"的根本原因。

### 2.4 排版系统

#### 字号 / 字距 / 行高的实测规格

| 角色 | 类名 | font-size | weight | letter-spacing | line-height | color |
|---|---|---|---|---|---|---|
| 首页主标题 | `.typewriter-line` | `9vw` | 600 | **-0.05em** | **0.85** | `#000` |
| 首页副标 | `.subtitle-typewriter` | **6px** | **200** | **+1.5em** | 1.5 | `rgba(0,0,0,.4)` |
| 页面大标题 | `.custom-module__title h1` | `clamp(36px, 5vw, 64px)` | **400** | 默认 | 1.15 | `#000` |
| 分区小签 | `.custom-module__project` | 12px | 500 | **+0.08em** + uppercase | — | `#999` |
| 左栏菜单 | `.custom-module__menu a` | 14px | 400 / active 600 | — | 2 | `#666` → active `#000` |
| 卡片标题（桌面） | `.site-text` | 17px | 500 | **-0.2px** | 1.3 | `#141414` |
| 卡片标题（移动） | `.site-text` | **22px** | 400 | **-0.8px** | — | `#333` |
| 卡片副标 | `.site-subtitle` | 12px | 400 | 0（桌面）/ -0.8px（移动） | 1.45 | `#9b9b9b` |
| 时间线日期 | `.timeline-date` | 12px | 600 | +0.08em | — | `#999` |
| 分类计数 | `.category-count` | **9px** | 600 | 0 | 1 | `#000` on `#e07a5f` |

#### 三条可提炼的排印规则

**规则 1 · 字距方向随字号反转**
- 大字（≥ 32px）：**负字距** `-0.05em ~ -0.02em`（让字母"咬"在一起，形成块面）
- 小字（≤ 12px）：**正字距** `+0.08em ~ +0.15em` + uppercase（让字母"散开"，形成标签感）
- 中间字号（14–22px）：`0 ~ -0.02em`

**为什么**：大字负字距减少"空气"，视觉上更"重"、更像标题；小字正字距增加可辨识度，同时暗示"这是元数据不是内容"。**这是方舟系设计最强的排印签名。**

**规则 2 · 字重跨度拉到极端，中间档几乎不用**
- 实测使用：`200`（副标）、`400`（正文/大标题）、`500`（卡片标题）、`600`（主标题/active）
- **没有 300 / 700 / 800**。要么很轻，要么很实。

**规则 3 · 极端行高只给单行大字**
- `.typewriter-line` 用 `line-height: 0.85` —— 只因为它是 `white-space: nowrap` 的单行
- 正文永远 `≥ 1.45`，长文 `1.85+`
- **行高 < 1 是"视觉技巧"，不是"排版规范"，只能用在单行标题上**

#### 字体选择

| 用途 | 字体 | 来源 |
|---|---|---|
| 全站 UI / 正文 | `Google Sans Flex` | Google（可变字体） |
| 中文 | `Noto Sans SC` / `思源黑体` | Google / Adobe |
| 中文衬线（标题） | `思源宋体` | Google / Adobe |
| 数字 / 等宽 | 系统 mono | — |
| 字体库收录 | 共 56 款，分 10 类 | 见 2.7 |

字体分类体系（`fontlab` 页的 10 个分类，可作为你"字体页"的分类骨架）：
```
中文无衬线体 / 中文衬线体 / 像素体 / 打字机体 / 花体
英文手写体 / 英文无衬线体 / 英文无衬线体-扁平 / 英文无衬线体-窄体
英文衬线体 / 英文衬线体-窄体
```
每张卡片结构：`字体名` → `获取`（按钮）→ `多字重 / 可变字体 / 单字重` → `推荐`（可选徽标）→ `中文字体预览 The quick brown fox`（实时预览行）

**值得抄的点**：**每个字体都必须有"实时预览"**（用该字体渲染一行中英混排样例）。做了这个，页面立刻从"链接列表"升级为"工具"。

### 2.5 圆框 UI 四档体系（核心参考）

| 层级 | radius | 典型尺寸 | 用途 | 完整规格 |
|---|---|---|---|---|
| **胶囊** | `50px` / `30px` / `999px` / `24px` | 高 40px / 宽自适应 | 导航按钮、分类筛选、搜索框、视图切换容器 | `padding: 10px 20px; font-size: 12px; font-weight: 500` |
| **卡片** | `14px`（桌面）/ `16px`（移动） | `aspect-ratio: 1/1` 或 `min-height: 64px` | 资源卡、推荐卡 | `padding: 18px 18px 20px; background: #f4f3f1` |
| **菜单** | `12px` | `min-width: 132px` | 下拉菜单、弹出面板 | `padding: 5px; box-shadow: 0 10px 28px rgba(0,0,0,.12)` |
| **标签** | `6px` / `999px` | 高 18px | 计数角标、失效徽标、Toast | `padding: 0 6px; font-size: 9px; font-weight: 600` |

#### 液态玻璃按钮完整规格（首页导航，最值得抄的一段）

```css
.nav-btn {
  /* 三层叠加：渐变底 + 背板模糊 + 内阴影高光 */
  background: linear-gradient(135deg, rgba(255,255,255,.32), rgba(255,255,255,.16));
  backdrop-filter: blur(18px) saturate(170%) brightness(1.03);
  border: 1px solid rgba(255,255,255,.6);
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.75),      /* 顶部高光 */
    inset 0 -1px 0 rgba(255,255,255,.15),     /* 底部反光 */
    0 2px 6px rgba(0,0,0,.03);                /* 极淡投影 */
  transition: background .35s ease, backdrop-filter .35s ease,
              border-color .35s ease, transform .3s ease, box-shadow .35s ease;
  will-change: transform, box-shadow, border-color, background, backdrop-filter;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.nav-btn:hover {
  background: linear-gradient(135deg, rgba(255,255,255,.5), rgba(255,255,255,.28));
  backdrop-filter: blur(30px) saturate(190%) brightness(1.07);
  border-color: rgba(255,255,255,.78);
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.9),
    inset 0 -1px 0 rgba(255,255,255,.22),
    0 6px 16px rgba(0,0,0,.05);
}
```

**四个细节决定质感**：
1. `blur` 从 `18px → 30px`（**hover 时模糊增强**，不是减弱 —— 制造"更贴近玻璃"的错觉）
2. `saturate` 从 `170% → 190%`（玻璃下的色彩被"提纯"）
3. 三层 `box-shadow`（上高光 / 下反光 / 外投影），缺一层就是"贴纸"而非"玻璃"
4. `translateZ(0)` + `backface-visibility: hidden`（防 blur 抖动）

#### 圆角按钮的"反向 hover"（ignoredone 全站通用）

```css
/* 白底 → 黑底白字，而不是"变浅一点" */
.category-btn:hover, .category-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}
.search-toggle:hover { background: #000; color: #fff; border-color: #000; }
.empty-back-btn:hover { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
```

**这是方舟系按钮的核心反馈语言：反相，不是加深。** 白色描边圆角底 + 黑字 ↔ 黑色实底 + 白字。零色彩依赖，却极强。

> **对你的应用**：目前 `.nav-item:hover` 只是 `background: panel-2`（变亮一点点），几乎没有反馈。改成反相或加左侧 2px 信号色条。

### 2.6 `designwebsite` 页的信息架构（82 个资源 / 三视图 / 分类计数）

这是全站最完整的一个"列表页"实现，**你的 `/friends/` 和未来的 `/archive/` 都可以照这个骨架重做**。

#### 结构

```
.custom-module
├── .custom-module__header          grid: 1fr 1fr; gap: 80px
│   ├── .custom-module__menu        左栏 9 项板块导航（14px / line-height 2 / #666 / active #000 600）
│   └── .custom-module__title       右栏
│       ├── .custom-module__project "Section" 小签（12px / 500 / +0.08em / uppercase / #999）
│       ├── h1                      clamp(36px, 5vw, 64px) / 400 / 1.15
│       └── .title-actions          年份筛选按钮
├── .categories-toolbar             flex; gap 10px
│   ├── .categories                 分类胶囊组（带 .category-count 角标）
│   ├── .nav-search                 圆形搜索按钮 → 展开胶囊输入框
│   └── .view-toggle                网格 / 列表 / 时间线 三态
└── .sites-grid                     grid-template-columns: repeat(6, 1fr); gap 10px
    └── .site-card ×N
```

#### 卡片规格

```
桌面卡片（≥769px）
  aspect-ratio: 1/1  →  实际由 grid 列宽决定（6 列时约 200px 见方）
  padding: 18px 18px 20px
  background: #f4f3f1
  border: 1px solid transparent
  border-radius: 14px
  布局：flex column，align-items stretch，text-align left
  ├── .site-logo        30×30，左上，hover scale(1.08)
  ├── .site-text       17px / 500 / -0.2px / #141414，margin-top:auto（贴底）
  ├── .site-subtitle   12px / 1.45 / #9b9b9b / line-clamp 2
  └── .site-more       右上角 30×30 透明按钮 → 下拉菜单（收藏 / 复制链接）

移动卡片（≤768px）
  aspect-ratio: 1/1  居中布局，padding: 20px
  ├── .site-logo        18×18 居中
  ├── .site-text       22px / 400 / -0.8px / 居中
  └── .site-subtitle   12px / line-clamp 3 / 居中
```

#### 三视图切换（同一份数据的三种呈现）

```css
/* 1. 网格 */  .sites-grid { grid-template-columns: repeat(6,1fr); gap: 10px }
/* 2. 列表 */  .sites-grid.view-list { grid-template-columns: 1fr; gap: 8px }
               .view-list .site-card {
                 aspect-ratio: auto; min-height: 64px;
                 flex-direction: row; padding: 14px 56px 14px 16px;
                 border-radius: 12px;
               }
/* 3. 时间线 */ .sites-grid.view-timeline { display: block }
               .timeline-group { margin-bottom: 28px }
               .timeline-date::before {           /* 日期前的赭橙圆点 */
                 content:''; width:8px; height:8px;
                 border-radius:50%; background:#e07a5f;
               }
```

视图切换按钮：
```css
.view-toggle { display:inline-flex; border:1px solid #e0e0e0; border-radius:24px; overflow:hidden; background:#fff }
.view-btn { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; color:#666; transition: background .2s, color .2s }
.view-btn:hover { color:#000; background:#f4f3f1 }
.view-btn.active { background:#1a1a1a; color:#fff }
.view-btn svg { width:15px; height:15px }
```

#### 分类筛选胶囊（带计数角标）

```css
.category-btn {
  padding: 12px 18px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 16px;
  transition: all .3s;
}
.category-btn:hover, .category-btn.active { background:#000; color:#fff; border-color:#000 }
.category-count {
  display: none;                       /* 只有 active 时才显示！ */
  min-width: 18px; height: 18px;
  padding: 0 6px; margin-left: 6px;
  border-radius: 999px;
  font-size: 9px; font-weight: 600; line-height: 1;
  background: #e07a5f; color: #000;
  letter-spacing: 0;
}
.category-btn.active .category-count { display: inline-flex }
```

**关键决策**：计数角标默认隐藏，**只在选中分类时出现**。这比"永远显示计数"干净得多——平时是纯文字胶囊，选中才浮现 `工具 20`。**一个 `display` 切换，换来整个工具栏的呼吸感。**

#### 搜索交互（按钮 → 展开）

```css
.nav-search { display:flex; align-items:center; gap:8px; flex-shrink:0 }
.nav-search.is-open { flex: 1 1 auto }              /* 展开时吃掉剩余空间 */
.categories-toolbar.is-searching .categories,
.categories-toolbar.is-searching .view-toggle { display: none }   /* 搜索时隐藏其它工具 */

.search-toggle { width:40px; height:40px; border-radius:50%; border:1px solid #e0e0e0 }
.search-toggle:hover { background:#000; color:#fff; border-color:#000 }
.search-input { display:none; height:40px; padding:0 18px; border-radius:999px; border:1px solid #e0e0e0 }
.nav-search.is-open .search-input { display:block; animation: searchSlideIn .25s ease-out }
@keyframes searchSlideIn {
  from { opacity:0; transform: translateX(-8px) }
  to   { opacity:1; transform: translateX(0) }
}
```

**三层状态管理**：默认（工具全显示）→ 搜索中（隐藏分类和视图，输入框撑满）→ 关闭（恢复）。**不需要模态框，不需要新页面。**

#### 失效链接标记 + Toast

```css
.site-broken-badge {
  position: absolute; top: 22px; left: 50%; transform: translateX(-50%);
  padding: 5px 7px; border-radius: 6px;
  font-size: 10px; font-weight: 600; letter-spacing: .02em;
  background: #000; color: #fff;                /* 桌面端改 #e07a5f 底 + #1a1a1a 字 */
  pointer-events: none;
}
.dn-toast {
  position: fixed; left: 50%; bottom: 30px;
  transform: translateX(-50%) translateY(20px);
  background: #1a1a1a; color: #fff;
  padding: 10px 20px; border-radius: 8px;
  font-size: 14px; opacity: 0; pointer-events: none;
  transition: opacity .25s, transform .25s;
}
.dn-toast--show { opacity: 1; transform: translateX(-50%) translateY(0) }
```

### 2.7 `arknights_design` 的三层下钻（画廊架构）

```
第一层  .grid           网格列数 1–6 可调（右侧浮动 .column-control 控件）
第二层  .viewer         点开某系列 → 瀑布流（column-count 同列数）
第三层  .lightbox       点开单图 → 缩放 － ◎ ＋ / 左右 ‹ › / 全屏 ✕
```

#### 关键工程细节

**图片三级分辨率（OSS 实时处理）**：
```js
function getTinySrc(url)   { return `${url}?x-oss-process=image/resize,w_600/format,webp/quality,Q_60`; }
function getViewerSrc(url) { return `${url}?x-oss-process=image/resize,w_1200/format,webp/quality,Q_80`; }
// HD 原图：队列并发上限 3
const MAX_HD_LOADS = 3;
```

**骨架屏**（`skeleton-card`）：
```css
.skeleton-card {
  width: 100%; height: 26vw; min-height: 220px; max-height: 420px;
  border-radius: 5px;
  background: linear-gradient(90deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.07) 50%, rgba(255,255,255,.03) 100%);
  background-size: 200% 100%;
  animation: skeletonMove 1.4s infinite linear;
}
@keyframes skeletonMove {
  0%   { background-position: 200% 0 }
  100% { background-position: -200% 0 }
}
.grid-loader.hide { opacity:0; transform: translateY(10px); pointer-events:none; transition: opacity .6s, transform .6s }
```

**入场动画（anime.js v4）**：
```js
const EASE_SOFT   = 'cubicBezier(0.22, 0.9, 0.25, 1)';
const EASE_SPRING = 'easeOutElastic(1, .7)';
const EASE_OUT_Q  = 'easeOutQuad';

anime.timeline({ easing: EASE_SOFT })
  .add({ targets: menuLinks, opacity:[0,1], translateX:[-18,0], duration:700, delay: anime.stagger(45, { start: 80 }) })
  .add({ targets: [project, h1], opacity:[0,1], translateY:[28,0], duration:950, delay: anime.stagger(90) }, '-=450');
```

**移动端逐级降级**：
```css
@media (max-width: 768px) {
  .custom-module__menu { display: none }     /* 左栏菜单直接不要 */
  .viewer-grid { column-count: 1 !important }
  .lightbox img { max-width: 95vw !important; max-height: 90vh !important }
}
```

**四条可复用的工程经验**：
1. **图片三级分辨率 + 并发队列** —— 你的博客目前 `CoverArt` 是 SVG/CSS 生成，不涉及。但**未来上真实图片时必须照抄这套**。
2. **骨架屏而非 spinner** —— 保持布局稳定，避免 CLS。
3. **列数可调** —— 一个 `− 3 +` 控件，用户自己决定密度。这是"设计师友好"的信号。
4. **`stagger(45ms)`** —— 列表入场用 45ms 间隔，不是 100ms。快，才不烦。

### 2.8 交互词汇表（可直接搬进你的项目）

| 名称 | 实现要点 | 时长 / 曲线 | 用在哪 |
|---|---|---|---|
| **融圆揭示** | `clip-path: circle(100%)` → `circle(0 at var(--mouse-x) var(--mouse-y))` | 1s ease | 开屏（替代你的上滑） |
| **打字机** | 逐行 `overflow:hidden` + 光标 `blink 1s step-end` | — | 首页主标题 |
| **融球（gooey）** | SVG `feGaussianBlur stdDeviation=12` + `feColorMatrix` 拉 alpha 对比 | 循环 | 背景装饰圆点 |
| **点阵呼吸** | 三层独立 `opacity` + `scale` + `translate3d` | 7.5 / 12 / 26s | 背景 |
| **玻璃 hover** | `blur 18→30px`, `saturate 170→190%`, `translateY(-2px) scale(1.02)` | .35s | 导航按钮 |
| **卡片 hover** | `translateY(-4px)` + `bg #f4f3f1→#fff` + `border #ececec` + `shadow 0 12px 26px .07` | .28s `cubic-bezier(.22,.61,.36,1)` | 所有卡片 |
| **卡片入场** | `opacity 0→1` + `translateY(20→0)` | .4s ease-out | 列表首次渲染 |
| **卡片退场** | `translateY(0→-20)` + 淡出 | .3s ease-in | 筛选切换时 |
| **搜索框展开** | `translateX(-8px)→0` + 淡入 | .25s ease-out | 工具栏 |
| **菜单展开** | `translateY(-6px) scale(.96)` → `translateY(0) scale(1)`，`transform-origin: top right` | .18s ease | 卡片"更多" |
| **移动端页面切换** | 白遮罩 `opacity 0→1→0` + `visibility` | .4s | 路由跳转 |
| **自定义光标** | 20px 圆 `#E3E3E3`，`translate(-50%,-50%)`，`.active` 时 `scale(.8)` + `#999` | .2s | 全站（`pointer:fine`） |
| **自定义滚动条** | 全站隐藏（`::-webkit-scrollbar{display:none}` + `scrollbar-width:none`） | — | 全站 |

> **注意第 13 条**：ignoredone **隐藏了全站滚动条**。你的项目现在是 10px 显式滚动条。两者都可以，但不要"半吊子"（既显示又难看）。建议：桌面保留 6px 极细滚动条（可发现性更好），移动端隐藏。

### 2.9 从 11 条"补丁 CSS"里读到的工程现实

ignoredone 的 `<style>` 里有大量"打补丁"的痕迹，**这些恰恰是最有价值的一手经验**：

```css
/* 1. 强制亮色，压死所有暗色主题选择器 */
:root { color-scheme: light !important }
html, body { background:#fff !important; color:#111 !important }
[data-theme="dark"], .dark, .dark-mode { background:inherit !important; color:inherit !important }
@media (prefers-color-scheme: dark) { :root { color-scheme: light !important } }

/* 2. 全站隐藏滚动条但保留滚动 */
::-webkit-scrollbar { display: none }
html { scrollbar-width: none; -ms-overflow-style: none }

/* 3. 首页禁纵向滚动，改横向翻页 */
body.home { overflow: hidden; overscroll-behavior: none }
.page-wrapper { display:flex; height:100vh; transition: transform .8s ease-in-out; touch-action: pan-y }
.page { flex: 0 0 100vw; height: 100vh; overscroll-behavior: contain }

/* 4. 移动端去点击高亮 */
* { -webkit-tap-highlight-color: transparent }
*:focus { outline: none !important }        /* ← 这条是反模式，别学 */

/* 5. 清零 Gutenberg 的所有默认间距 */
body, html { margin:0 !important; padding:0 !important }
.wp-site-blocks { padding-top:0 !important; padding-bottom:0 !important }
.entry-content, .site-content, .site-main { padding:0 !important; margin:0 !important }
:root { --wp--style--block-gap: 0px !important }

/* 6. 直接隐藏主题的 header / footer，全部用自定义块重拼 */
footer.wp-block-template-part { display: none !important }
header.wp-block-template-part { display: none !important }
```

**读出来的三件事**：
1. **作者是在和 WordPress 打架**。14 个板块、每个板块一套自定义 CSS/JS 内联、把官方 header/footer 全隐藏自己重画。**维护成本极高**，每次主题/插件更新都可能崩。
2. **但结果是"零框架感"** —— 没有任何 Bootstrap / 卡片阴影 / 圆角按钮的痕迹。这就是为什么它看起来"像一个设计师手写出来的站"。
3. **你的 Next.js 反而更适合做这件事**：不需要 `!important` 打补丁，`@theme` 直接定义，组件自持样式。**同样的视觉效果，你的代码量只有它的 1/5。**

> **结论**：学它的**视觉决策**（层级、留白、字距、圆角档位、单一饱和色），**不要学它的工程方式**（`!important` 覆盖、内联 CSS、隐藏原生结构）。

### 2.10 五个可以直接落地的"抄点"（按性价比排序）

| # | 抄什么 | 成本 | 收益 | 落在你的哪 |
|---|---|---|---|---|
| 1 | **单一饱和色 + 反相 hover** | 30 分钟改 token | ★★★★★ | `globals.css` `@theme` + `.nav-item` |
| 2 | **负字距大字 / 正字距小签** | 20 分钟 | ★★★★★ | `.mono-tag` + 所有 h1/h2 |
| 3 | **四档圆角制** | 40 分钟 | ★★★★ | 全站 `rounded-*` |
| 4 | **`mask-image` 开洞** | 40 行 JS + 一段 CSS | ★★★★ | Hero 区（替代纯渐变） |
| 5 | **卡片 hover 只有位移 + 阴影** | 15 分钟 | ★★★★ | `.archive-card` |

---

### 2.11 与 v2 既有笔记的交叉核对（含一处**重要修正**）

项目里已有一份 `docs/DESIGN-STUDY-ignoredone.md`（v2 时期撰写，DOM 计算样式 + 16 页走查）。本文档与它是**增量关系**，但有**一处结论必须修正**。

#### 修正：「每板块一套主题色」是误读，v2 因此走偏

v2 笔记的结论是：

> 「色板是白底 + 四级灰阶 + **每板块一个主题色**」→ 落地为首页紫罗兰 / 归档靛蓝 / 项目天蓝 / 友链青蓝 / 关于品紫，**5 个 accent 同时存在于侧栏**。

**ignoredone 的真实做法被误读了。** 它的实测色板是：

| 板块 | 主题色 | 色族 |
|---|---|---|
| 首页 | 高饱和黄 `≈#FFE01A` | 暖 |
| 新手入门 / 学习工程 / 图文教程 / 资源系统 | 薄荷面板 `#e4efeb` + 薄荷白 `#f1fefb` | 冷绿 |
| IgnoBoard | 苹果蓝 `#0071E3` + `#1d1d1f` + `#86868b` | 冷蓝 |
| 终末地资源 | 深蓝黑 `#11141a` | 近黑 |
| 设计导航 / 作品库 | 纯白 + 四级灰阶 | 中性 |

**关键差异（这才是重点）**：

```
ignoredone：一次只看到一套色。进一个板块，整套皮肤全换。
            → 隐喻是"进入一个独立展厅"，色相跨度可以极大（黄 → 薄荷 → 苹果蓝）。

v2 的做法：5 个色相同时陈列在侧栏，且每点一次导航整站环境色都变。
            → 隐喻变成"5 个网站共用一个壳"，用户每点一次都在重新定位自己。
```

**所以 v2 的失败不在"学错了对象"，在"把纵向的板块切换，做成了横向的并列陈列"。**

#### 正确的迁移方式

| ignoredone | 迁移到你的项目 | 不要这样做 |
|---|---|---|
| 一套色贯穿一个板块（纵向） | 一个板块内**只用 brand + signal**（不引入第二色相） | ❌ 5 个 accent 横向并列 |
| 色相可以跨族（黄/薄荷/蓝） | 色相锁定紫蓝，**只变浓度**（见 3.7 方案 A 的 `sig`） | ❌ 跨族 5 色 |
| 环境色随板块**整站替换** | 环境色随板块**微调浓度**（2%–6%） | ❌ 800ms 大范围换色（视觉噪音） |
| 板块内自洽（面板+文字+边框同一族） | ✅ 这条可以学 | — |

> **一句话**：ignoredone 的板块色是"换房间"，你做成的是"换滤镜"。前者成立，后者失效。

#### v2 笔记里仍然有效、本文档已吸收的实测数据

| 数据 | 来源 | 本文档位置 |
|---|---|---|
| **字号越大字重越轻**（L1 是 64px/400，L3 是 40px/600，L5 是 16.8px/600） | v2 实测 | 3.3 排印规则、2.4 排版表 |
| 薄荷面板 `#e4efeb` / 薄荷白 `#f1fefb` | v2 实测 | （不采用，与紫蓝品牌冲突） |
| 苹果蓝 `#0071E3`（IgnoBoard 专属） | v2 实测 | （不采用） |
| IgnoBoard `88px/700` 全站最大最重 | v2 实测 | 3.3（"产品页可破例加重"） |
| 作品页零 UI 存在感（70 张图，色彩几乎全 `#111`） | v2 实测 | P1-06（图像锚点） |
| 底部胶囊导航坐在有机 blob 形黄底上，激活项整颗填充 | v2 实测 | 2.5 圆框规格 |
| 分区间距约 96px 级 | v2 实测 | P1-01（版心与节奏） |

#### 一处需要保留的分歧

v2 笔记的「风格边界」写：

> 「板块主题色限定在蓝紫-靛-蓝-青同系家族（v2 品牌一致性优先）」

**这个约束的方向是对的，但执行错了**：同系不等于"5 个色相"，而是"1 个色相 + 5 档浓度"。见 3.7 方案 A 的 `sig: 1.0 / 0.8 / 0.6 / 0.4 / 0.2`。

---

## 3. 明日方舟设计语言 · 可落地提炼

> 本节不是"方舟好美"的赏析，是**把方舟的视觉决策翻译成 CSS 数值**。所有结论都标注了来源（官方 UI / ak-ui token / 设计分析文章）。

### 3.1 三色骨架（最重要的一条）

方舟全部 UI 只用三层颜色：

| 层 | 作用 | 色值来源 | 占比 |
|---|---|---|---|
| **墨** | 背景、面板、边框 | `#000` / `#141414` / `#1a1a1a` / `#222` | 55–65% |
| **纸** | 文字、描边、高光 | `#fff` / `#e8e8e8` / `#9c9c9c` | 30–40% |
| **信号** | 状态、稀有度、CTA | 见下表 | **≤ 5%** |

信号色（引自 `ak-ui` 官方 token，参考游戏道具稀有度）：
```css
--ak-color-low:        #9c9c9c;   /* 灰 —— 普通 */
--ak-color-basic:      #d8dd5a;   /* 黄绿 —— 基础 */
--ak-color-primary:    #4aabea;   /* 蓝 —— 主色 / 数据 */
--ak-color-secondary:  #cfc2d1;   /* 灰紫 —— 次级 */
--ak-color-advanced:   #f1c644;   /* 金 —— 高级 / 强调 */
```
加上官方 KV 常用黄 `#FFDE00`、警示橙 `#e07a5f`、危险红（少量）。

**铁律：信号色总面积不超过屏幕 5%。** 一旦超过，方舟感立刻消失，变成"游戏风格网页"。

### 3.2 几何语法（8 条）

| # | 规则 | CSS 实现 | 说明 |
|---|---|---|---|
| 1 | **矩形为主导，圆形极少** | 圆只用于：头像、状态点、加载、指示器 | 方舟界面 90% 是矩形与直角 |
| 2 | **45° 斜切角** | `clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))` | 对角切两个角，不用四角全切 |
| 3 | **四角准星** | 四个 `+` 定位在 `absolute` 四角，`font-mono text-xs opacity-25` | 已有（`page.tsx:63-66`），保留 |
| 4 | **1px 描边 + 无阴影** | `border: 1px solid rgb(255 255 255 / .12)` | 用线分隔，不用投影分隔 |
| 5 | **刻度 / 网格 / 编号是装饰** | `repeating-linear-gradient` 造刻度；`DOC.261005-GUESTB` 造编号 | 已有编号系统，好 |
| 6 | **参差感（不对齐）** | 相邻面板高度/起点故意错开 8–24px | 打破"完美网格"的呆板 |
| 7 | **纹理层**：网点 / 扫描线 / 半调 | 见 3.4 | 廉价的空间感来源 |
| 8 | **留白是结构** | 大段留白不是"没内容"，是"待解密" | ignoredone 首页 70% 是留白 |

**参差感的实现示例**（`/archive/` 列表）：
```tsx
{posts.map((p, i) => (
  <Reveal key={p.slug} delay={i * 70}>
    <div style={{ marginTop: i % 3 === 1 ? '18px' : i % 3 === 2 ? '9px' : 0 }}>
      <ArchiveCard post={p} index={i} />
    </div>
  </Reveal>
))}
```
三张卡一组，第二张下沉 18px，第三张下沉 9px。**代价 3 行代码，换来"手工排版"的错觉。**

### 3.3 排印（方舟的字体谱系）

| 场景 | 字体 | 特征 | 免费替代 |
|---|---|---|---|
| 中文标题 | **思源宋体**（Source Han Serif） | 衬线，庄重，字形收放克制 | Google Fonts 直接可商用 |
| 中文正文 | **思源黑体**（Source Han Sans） | 无衬线，中性 | 已用 |
| 英文标题 | **Novecento Wide Normal** | 极宽字面，全大写，工业感 | `Oswald` / `Archivo Expanded` / `Bebas Neue` |
| 数字 / UI | **Bender** | 伪等距，半宽，硬朗 | `Chakra Petch` / `Share Tech Mono` / `JetBrains Mono` |
| 装饰 / 架空文字 | **Samigirian Serif** | 萨米/阿戈尔文字 | 开源 SIL OFL，可直接下载 |
| 正式英文 | **Trajan**（旧风格衬线） | 刻碑体，古典 | `Cinzel` |

**排印四规则（与 ignoredone 的实测结论完全一致，互为印证）**：

1. **大字负字距**：`-0.04em ~ -0.05em`（Novecento Wide 那种宽度上必须收，否则散架）
2. **小字正字距 + 全大写**：`+0.08em ~ +0.16em`
3. **中英混排时，英文承担"装饰/标尺"角色**，中文承担"信息" —— 所以英文常小、常大写、常拉开字距
4. **字重只用 3–4 档**（200 / 400 / 600 / 900），中间档跳过

**给你的具体建议**（`globals.css` 现状 vs 建议）：

| token | 现状 | 建议 | 理由 |
|---|---|---|---|
| `--font-display` | `"Space Grotesk", "Noto Sans SC"` | `"Space Grotesk", "Instrument Sans", "Noto Sans SC"` | 先修 P0-02 |
| `--font-body` | `"Jost", "Noto Sans SC"` | 保留 Jost（几何无衬线，接近 Novecento 的现代感） | 已合适 |
| `--font-mono` | `"JetBrains Mono"` | 保留，但**必须修子集**（P0-03） | 已合适 |
| 中文标题 | 无独立字体（用 body） | 引入**思源宋体**（`NotoSerifSC`）只用于 `h1/h2` | 这是"方舟味"最直接的一刀 |

**引入思源宋体做标题的收益**：你的 h1 `RHINE ARCHIVE OS` 是英文，不受影响；但**文章页标题、归档页「归档 · 作战记录」、页脚大字**会立刻从"互联网产品"变成"档案文献"。

```css
/* 新增 @font-face（子集化后约 60–80KB） */
@font-face {
  font-family: "Noto Serif SC";
  src: url("/fonts/NotoSerifSC-SemiBold.woff2") format("woff2");
  font-weight: 600;
  font-display: swap;
}

@theme {
  --font-serif: "Noto Serif SC", "Songti SC", serif;
}
```
用法：文章页 h1、归档页 h1、`.prose-os h2` —— **只在这三处**。用多了就变"古风"了。

### 3.4 纹理与材质（CSS-only，零资源）

```css
/* 1. 网点（半调）—— 方舟最标志性的纹理 */
.texture-halftone {
  background-image: radial-gradient(circle, currentColor 1px, transparent 1.1px);
  background-size: 4px 4px;
  opacity: 0.06;
}

/* 2. 扫描线（CRT） */
.texture-scanline {
  background-image: repeating-linear-gradient(
    0deg,
    rgb(255 255 255 / 0.03) 0px,
    rgb(255 255 255 / 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
}

/* 3. 刻度尺（进度/分隔） */
.texture-ruler {
  background-image: repeating-linear-gradient(
    90deg,
    currentColor 0px, currentColor 1px,
    transparent 1px, transparent 6px
  );
}

/* 4. 斑马纹（数据条 / 加载） */
.texture-stripe {
  background-image: repeating-linear-gradient(
    90deg,
    var(--color-line-strong) 0 2px,
    transparent 2px 5px
  );
}

/* 5. 蓝图网格（比 os-grid 更细，用于面板内部） */
.texture-blueprint {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-size: 12px 12px;
}
```

**使用纪律**：同一屏最多叠 **2 种**纹理。3 种以上必然变成噪点。

### 3.5 信息层级（干员界面的实战拆解）

引自 TrueSight 的实测分析，这套层级可直接迁移到"文章卡"：

| 优先级 | 视觉元素 | 迁移到你的 ArchiveCard |
|---|---|---|
| 最高 | 头像/名称，**大 + 高对比 + 居中** | 标题：`font-semibold` + `text-[var(--color-ink)]` |
| 高 | 等级/经验，**色彩高亮 + 尺寸** | 日期/编号：`mono-tag` + 信号色 |
| 中 | 属性值，**分色 + 尺寸** | 标签：`#tag` + 不同透明度 |
| 中 | 技能/天赋，**图标 + 文字** | 分类徽标 |
| 低 | 材料，**图标 + 数量** | 字数统计 |
| 最低 | 背景故事，**小字 + 灰色** | 摘要：`text-sm` + `--color-muted` |

**你现在的 ArchiveCard 问题**：编号（`.mono-tag`）和标题（`font-semibold`）字重差距不够，摘要和标题的色调差距只有一档。**方舟的层级是"悬崖式"的，不是"台阶式"的。**

改法：
```tsx
{/* 编号：极小 + 极淡 + 大字距 —— 明确"这是元数据" */}
<span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)]/60">{docId(post)}</span>

{/* 标题：大 + 重 + 高对比 —— 明确"这是内容" */}
<h2 className="mt-1 mb-2 text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--color-ink)]">

{/* 摘要：小 + 淡 + 宽行高 —— 明确"这是补充" */}
<p className="mb-4 line-clamp-2 text-[13px] leading-[1.6] text-[var(--color-ink-soft)]/75">
```

### 3.6 八个可复用组件模式（每个都有代码）

#### ① 状态灯 + 编号标签
```tsx
<span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)] shadow-[0_0_6px_var(--color-signal)]" />
  SYSTEM ONLINE
</span>
```

#### ② 四角准星面板
```tsx
<div className="relative border border-[var(--color-line)] p-5">
  {['left-0 top-0','right-0 top-0','left-0 bottom-0','right-0 bottom-0'].map(pos => (
    <span key={pos} className={`absolute ${pos} -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--color-line-strong)]`}>+</span>
  ))}
  {children}
</div>
```

#### ③ 斜切角按钮（45° 双角）
```tsx
<button className="group relative px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em]
  [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]
  bg-[var(--color-panel-2)] text-[var(--color-ink-soft)]
  transition-colors hover:bg-[var(--color-signal)] hover:text-[#0a0c12]">
  EXECUTE
</button>
```
> `clip-path` 会切掉 border，所以**不要给斜切按钮加 border**，用背景色反差。

#### ④ 刻度进度条
```tsx
<div className="relative h-1.5 w-full overflow-hidden bg-[var(--color-panel-2)]">
  <div className="h-full bg-[var(--color-signal)] transition-[width] duration-100"
       style={{ width: `${pct}%` }} />
  <div className="absolute inset-0 texture-ruler opacity-30" />
</div>
```

#### ⑤ 数据三件套（label / value / unit）
```tsx
<div className="flex items-baseline gap-1.5">
  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">WORDS</span>
  <span className="font-display text-2xl font-semibold tabular-nums">{n.toLocaleString()}</span>
  <span className="font-mono text-[10px] text-[var(--color-muted)]">w</span>
</div>
```

#### ⑥ 折叠档案条目
```tsx
<details className="group border-b border-dashed border-[var(--color-line)] py-3">
  <summary className="flex cursor-pointer list-none items-center gap-3">
    <span className="font-mono text-[10px] text-[var(--color-muted)]">§03</span>
    <span className="text-sm font-medium">子标题</span>
    <span className="ml-auto font-mono text-[10px] text-[var(--color-muted)] transition-transform group-open:rotate-90">▸</span>
  </summary>
  <div className="mt-3 pl-8 text-sm text-[var(--color-ink-soft)]">{children}</div>
</details>
```

#### ⑦ 扫描线覆盖层
```tsx
<div className="pointer-events-none absolute inset-0 texture-scanline opacity-50 mix-blend-overlay" aria-hidden />
```

#### ⑧ 识别徽标（角标 + 色条）
```tsx
<span className="relative inline-flex items-center gap-1 overflow-hidden rounded-[var(--radius-tag)] border border-[var(--color-line)] px-1.5 py-0.5">
  <span className="absolute inset-y-0 left-0 w-[2px] bg-[var(--color-signal)]" />
  <span className="pl-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]">{label}</span>
</span>
```

### 3.7 配色收敛方案（三选一，必须在 Batch 2 前定）

#### 方案 A · 保守收敛（推荐）
保留紫蓝作为**品牌色**，但削到 2 档，并引入 1 个信号黄作为**唯一的功能强调**：

```css
@theme {
  /* 品牌：只留 2 档 */
  --color-brand:      #7c5cff;    /* 主 */
  --color-brand-soft: #9b85ff;    /* 仅暗色模式的文字/描边 */

  /* 信号：唯一的饱和强调 */
  --color-signal:     #f1c644;    /* ak-ui advanced 金 */
  --color-signal-dim: rgb(241 198 68 / 0.12);

  /* 数据：冷色，只用于图表/进度/链接 */
  --color-data:       #4aabea;

  /* 骨架：中性（明暗各一套） */
  --color-bg:     #f6f6f7;
  --color-panel:  #ffffff;
  --color-panel-2:#eff0f2;
  --color-line:   #e5e6e9;
  --color-line-strong:#c8cad0;
  --color-ink:    #111318;
  --color-ink-soft:#4b4f58;
  --color-muted:  #8b8f9a;
}
:root.dark {
  --color-bg:     #0b0d11;
  --color-panel:  #12141a;
  --color-panel-2:#191c23;
  --color-line:   #23262e;
  --color-line-strong:#343945;
  --color-ink:    #e9eaee;
  --color-ink-soft:#a6aab4;
  --color-muted:  #6b707b;
  --color-brand:  #9b85ff;
  --color-brand-soft:#b7a4ff;
}
```

**并把 `NAV_ITEMS` 的 5 个 accent 收敛为 1 个**：
```ts
// lib/site.ts —— 删掉 accent 字段，改为每个板块一个"信号强度"
export const NAV_ITEMS = [
  { href: "/",         label: "首页", tag: "HOME",     sig: 1.0 },
  { href: "/archive/", label: "归档", tag: "ARCHIVE",  sig: 0.8 },
  { href: "/projects/",label: "项目", tag: "PROJECTS", sig: 0.6 },
  { href: "/friends/", label: "友链", tag: "LINKS",    sig: 0.4 },
  { href: "/about/",   label: "关于", tag: "ABOUT",    sig: 0.2 },
] as const;
```
`--accent` 由 `brand` + `sig` 的 alpha 组合而成，**色相不变，只变浓度**。这样"每板块一套性格色"的机制保留了，但视觉统一。

> **为什么这样更好**：目前 5 个色相会产生"5 个不同网站"的错觉，用户每点一次导航，整个环境色都变，认知成本高。改为"同色不同浓度"，用户感知到的是"这个板块更活跃/更安静"，而不是"我到了另一个网站"。

#### 方案 B · 激进方舟化
直接抄方舟：**深黑底 + 白字 + `#FFDE00` 单一信号**。紫蓝全部删除。
- 优点：方舟味 100%，辨识度最高
- 缺点：丢掉 `RHINE` 的品牌识别（莱茵生命是白/蓝绿系）；紫蓝是你项目的既有资产
- **不推荐**，除非你想彻底改版

#### 方案 C · 双主题双性格
亮色模式 = 纸白 + 墨黑 + 紫蓝（文档感）；暗色模式 = 近黑 + 纸白 + **信号黄**（终端感）。
- 优点：两种情绪都拿到
- 缺点：两套配色都要维护，容易失控
- **作为 A 的长期演进**，不要一次做完

**决策指令**：**Batch 2 用方案 A。** 方案 C 作为 v4 的路线，写进 README 的 roadmap。

### 3.8 一句话总结这一章

> 方舟的设计不是"加东西"，是**减到只剩结构，然后在一个点上给到饱和**。
> 你现在的问题是：结构已经对了（侧栏 / 顶栏 / 阵列 / 编号），但**饱和点太多**（8 个色），且**结构线太多**（网格 + 阵列 + 4 种边框 + 3 种圆角）。
> 升级 = 删掉 7 个色，删掉 1 层结构线，统一 4 档圆角，补 1 个衬线标题字体。

---

## 4. 全网优质的明日方舟设计资源清单

> **版权提示**：以下素材/代码的原始版权归**上海鹰角网络科技有限公司**所有。除明确标注 MIT / SIL OFL 的开源项目外，其余**仅供学习研究，禁止商用**。用于个人博客时，建议不直接使用游戏素材（立绘/图标/字体），只借鉴设计语言。

### 4.1 设计系统 / 组件库（最高价值，优先看）

| 项目 | 地址 | 技术栈 | 许可 | 为什么值得看 |
|---|---|---|---|---|
| **ak-ui** ⭐⭐⭐⭐⭐ | https://github.com/YunYouJun/ak-ui<br>文档 https://ak-ui.yyj.moe<br>组件 https://ak-ui.yunyoujun.cn/components | 框架无关 CSS + Vue Registry | MIT | **本清单第一推荐**。提供语义化 design token（`--ak-color-*` / geometry / hierarchy / motion / interaction states）+ 完整 CSS Core + 组件文档（60+ 组件分组）。**不追求像素复刻，而是把"工业几何 + 战术信息语言"提炼成约束**。还提供 Agent Skill（`npx skills add YunYouJun/ak-ui --skill ak-ui`），可让 AI 直接接入 |
| **ReEnd-Components** ⭐⭐⭐⭐ | https://github.com/luosky/ReEnd-Components | React + TypeScript + Tailwind + Radix UI | MIT | **终末地**风格组件库。签名组件全是"HUD 语法"：`TacticalPanel`（带状态灯的战术面板）`HoloCard`（全息卡，hover 倾斜）`DataStream`（滚动数据流）`ScanDivider`（扫描线分隔）`HUDOverlay`（四角括号 + 准星 + 坐标）`RadarChart`（SVG 雷达图）`GlitchText` `CoordinateTag` `WarningBanner`。**你的 hero 和状态条可以直接用它的思路** |
| **ArknightsUI-React-Template** ⭐⭐⭐ | https://github.com/Cromemadnd/ArknightsUI-React-Template | React 19 + Vite + TS + Tailwind + Headless UI | MIT | **主页复刻 + 鼠标重力感应 3D 变换**。你现在的 `ArchiveArray` 已有指针视差，可对照它的实现（`rotateX/rotateY` 跟随鼠标 + 缓动） |
| **mashirozx/arknights-ui** ⭐⭐⭐ | https://github.com/mashirozx/arknights-ui<br>Demo https://mashirozx.github.io/arknights-ui/ | H5 + CSS（42%） | MIT | 经典复刻（346★）。**纯 CSS 实现的主界面**，适合读它的布局用 Grid 怎么切 |
| **ngc7331/arknights-ui-remastered** ⭐⭐ | https://github.com/ngc7331/arknights-ui-remastered<br>Demo https://ngc7331.github.io/arknights-ui-remastered/ | Vue + H5 | MIT | 上面项目的 Vue 重写版，代码组织更现代 |
| **thirddeity/ak-ui**（旧版） | https://github.com/YunYouJun/ak-ui/tree/gh-pages | SCSS | MIT | ak-ui 的 2019 年原始版本（`ak-button` `ak-card` `ak-badge` `ak-progress` `ak-divider` `ak-message` `ak-checkbox` `ak-carousel`）。**组件命名可参考** |

### 4.2 字体（方舟字体谱系）

| 资源 | 地址 | 内容 | 许可 |
|---|---|---|---|
| **The-font-of-Arknights** | https://github.com/TimWangZi/The-font-of-Arknights | 方舟游戏内字体整理：`Times New Roman` / 思源宋体 / **Bender 系列** / `Georgia` / **Novecento Wide Normal** | 各字体原始许可 |
| **Samigirian** | https://github.com/Siphercase/Samigirian | 萨米/阿戈尔**架空文字**字体（基于 Elstob 改作），大写=萨米、小写=阿戈尔 | **SIL OFL 1.1**（可自由使用） |
| **HoYo-Glyphs**（参考思路） | https://github.com/SpeedyOrc-C/HoYo-Glyphs | 米哈游架空文字字体工程。**看它怎么做"架空文字的字体化"**，方法论可迁移 | 免费 |
| 思源宋体 | https://github.com/adobe-fonts/source-han-serif | 中文衬线，方舟标题主力字体 | SIL OFL |
| 思源黑体 | https://github.com/adobe-fonts/source-han-sans | 中文无衬线，方舟正文主力 | SIL OFL |
| Google Fonts | https://fonts.google.com | 免费可商用，含 `Noto Serif SC` / `Oswald` / `Archivo` / `Bebas Neue` / `Chakra Petch` | OFL / Apache |
| 猫啃网 | https://www.maoken.com | 中文开源字体聚合（ignoredone 也在用） | 各字体 |
| 字体天下 | https://www.fonts.net.cn | 中文免费字体 | 各字体 |

**Novecento Wide / Bender 的免费替代**（重要，因为原字体不可商用）：
```css
/* 宽体工业英文 → Archivo Expanded / Oswald 700 */
font-family: "Archivo", "Oswald", sans-serif;
font-stretch: 125%;              /* Archivo 是可变字体，可拉开字面 */
letter-spacing: -0.03em;
text-transform: uppercase;

/* 伪等距数字 → Chakra Petch / Share Tech Mono */
font-family: "Chakra Petch", "Share Tech Mono", monospace;
font-variant-numeric: tabular-nums;
letter-spacing: 0.02em;
```

### 4.3 官方 / 参考站点（看真实设计）

| 站点 | 地址 | 看什么 |
|---|---|---|
| **明日方舟官网** | https://ak.hypergryph.com | 黑白蓝三色、九宫格新闻卡、鼠标移动时背景光线偏移、章节页"方正雅宋 + Bender 编号" |
| **国际服官网** | https://www.arknights.global | 英文版排印（Novecento 全大写 + 极宽字距） |
| **塞壬唱片 MSR** | http://monster-siren.hypergryph.com | **纯排版页面的极致**：`A WORLD FAMILIARLY UNKNOWN` 逐字拉开、专辑封面墙、黑底白字 |
| **终末地官网** | https://endfield.hypergryph.com | 终末地的 HUD 语言（比本体更"硬"，更多等距线框） |
| **PRTS Wiki** | https://prts.wiki | 素材来源（图标 / 立绘 / 干员数据），也是"信息密度极高但可读"的排版范例 |
| **Mooncell** | http://ak.mooncell.wiki | 泰拉大典（世界观文本），适合看"档案体"文案怎么写 |
| **ignoredone's space** | https://www.ignoredone.space | 本文档第 2 章已完整拆解 |

### 4.4 设计分析文章（理解"为什么"）

| 文章 | 地址 | 核心观点 |
|---|---|---|
| **《尝试优化明日方舟官方网站的设计》**（机核） | https://www.gcores.com/articles/135723 | **元素提取方法论**：色彩（黑白灰 + 蓝橙辅助）、图形（矩形为主 + 少量圆 + 渐变底纹）、字体（标题思源宋体 + 正文思源黑体）。改版三大决策：导航悬浮顶部、中心不做侧边负担、下载渠道收入按钮 |
| **《为什么我说明日方舟的 UI/UX 设计既好看又先进》**（火星网） | https://www.hxsd.com/information/10933 | 字体考古：`EVIL TIME` 用思源宋体（Modern 衬线）、后续章节改 `Trajan`（Old Style）、基建用 `Bender`（伪等距工业体）。**结论：字体选择服务于"势力性格"** |
| **《解构泰拉世界：从设计理论与实践复刻 UI》**（TrueSight） | https://tsight.io/articles/7122399 | **信息层级表**（头像 > 等级 > 属性 > 技能 > 材料 > 背景故事）+ 交互控件规格（按钮/滑块/列表/确认弹窗） |
| **《舟味是什么？解析明日方舟设计美学》**（PDF） | https://janniewang.net/wp-content/uploads/2023/09/UIUX-analysis-for-Arknights.pdf | **Fluent Design 五要素**（Light 光效 / Depth 视差 / Motion 动效 / Material 材质 / Scale 比例）如何影响方舟。最学术的一篇 |
| **《有趣一点：〈明日方舟〉网页中的设计感》** | 微信公众号（搜标题） | 官网改版前后对比：九宫格卡片、分类小标题用蓝色、hover 整卡蓝白反相、鼠标位置驱动背景光线 |
| **《明日方舟 UI 设计分析》**（公众号） | 微信公众号 | 图标同构（罗德岛标志 = 国际象棋 Rook）、**参差感**（不对齐制造流动感）、干员浏览三守则（面部占 1/3、缩放持平、水平对齐） |
| **《用 AI 复活七年前的 ak-ui》** | https://yunyoujun.cn/posts/xiaoyun-studio-01-ak-ui | ak-ui 重启纪实，讲清"设计 token → CSS Core → Registry → Agent Skill"四层架构 |

### 4.5 素材与工具（做图/做资源时用）

| 工具 | 地址 | 用途 |
|---|---|---|
| **iconmonstr** | https://iconmonstr.com | ignoredone 的自制图标库用的就是这套（细线图标，1px stroke，极简） |
| **iconfont 阿里巴巴矢量图标库** | https://www.iconfont.cn | 中文项目首选，可下载 SVG |
| **半调制作器** | ignoredone 设计导航收录 | 生成 halftone 网点纹理 |
| **typedither** | ignoredone 设计导航收录 | 文字半调效果 |
| **HEISEI-VHS** | ignoredone 设计导航收录 | VHS 故障纹理 |
| **Pattern Monster** | https://pattern.monster | 无缝纹理生成（背景） |
| **Coolors** | https://coolors.co | 配色方案生成 |
| **Flat UI Colors** | https://flatuicolors.com | 扁平配色库 |
| **uiGradients** / **Mesh Gradient** | — | 渐变底纹（方舟常用"规则几何形状的渐变底纹"） |

### 4.6 逆向阅读清单（如果你想继续挖 ignoredone）

按这个顺序读，理解成本最低：

1. **首页 HTML 的 35 个 `<style>` 块** —— 其中 `BLOCK 32`（14KB）是核心视觉系统，`BLOCK 18` 是开屏，`BLOCK 33` 是自定义光标
2. **`designwebsite` 页的内联 CSS（22KB）** —— 完整的列表页范式（工具栏 / 三视图 / 卡片 / 空状态 / Toast / 动画）
3. **`arknights_design` 页的 `<script>`** —— 三层下钻（grid → viewer → lightbox）+ anime.js 时间线 + OSS 图片分级 + HD 并发队列
4. **`fontlab` 页** —— 56 字体 + 实时预览 + 双筛选器（字重/分类）
5. **`ignoboard` 页** —— 产品落地页范式（版本号 / 九宫格特性 / 视频演示 / 更新日志分组：`新增` `性能` `优化`）

抓取方法（本报告就是这么做出来的）：
```bash
curl -sL "https://www.ignoredone.space/index.php/designwebsite/" \
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126" \
  -e "https://www.ignoredone.space/" > page.html
# 然后用 python 正则提取 <style> 块
```
> **注意**：直接 `WebFetch` 会被 403（`arknights_design` 尤其），必须带 `User-Agent` + `Referer`。

---

## 5. 实施任务书（4 个批次，按序执行）

### 批次总览

| 批次 | 主题 | 改动文件 | 风险 | 验收方式 |
|---|---|---|---|---|
| **B1** | 修 Bug（P0 全部） | 6 个文件 | 低 | build 通过 + 双端截图 |
| **B2** | 设计令牌重构 | `globals.css` / `lib/site.ts` / `AppShell.tsx` | 中 | 全站视觉一致 |
| **B3** | Hero 重做 + 布局扩容 | `page.tsx` / `ArchiveArray.tsx` / 子页 | 中高 | 1440 + 390 截图 |
| **B4** | 组件升级 + 空状态 | 卡片 / 友链 / 归档 | 低 | 交互走查 |

---

### B1 · 修 Bug（P0，先让站点"能看"）

> **原则：只修不美。这一批不引入任何新视觉。**

#### B1-1 锁定基线：确认 build 通过（原 P0-06 已撤销）

```bash
cd "H:\Zcode cangku\Leersxie.github.io"
pnpm build          # prebuild(subset-fonts) → next build → postbuild(verify-export)
```

**目的**：确认"改之前是绿的"，这样后面任何 build 失败都能确定是自己改坏的。

**不要做的事**：
- ❌ 不要为了"让 archive 有更多文章"去改 `lib/posts.ts` 的 draft 过滤
- ❌ 不要批量把 `content/posts/*.md` 的 `draft: true` 改成 `false`
- ❌ 不要因为 `out/posts/` 只有 `guestbook/` 就认为构建失败——**这是对的**（3 篇是 draft，见 P0-06）

**正确的预期**：
| 命令 | 文章数量 | 原因 |
|---|---|---|
| `pnpm build`（production） | 1 篇 | 3 篇 `draft: true` 被 `lib/posts.ts:61` 过滤 |
| `pnpm dev`（development） | 4 篇 | `isProd()` 为 false，draft 全部可见 |

**若 build 失败**：
- `verify-export.mjs` 报错 → 先修导出管线（通常是误用动态 API 或 `dynamicParams`）
- `safe-delete` / `wmic` 相关报错 → 是执行环境的删除保护与程序黑名单，**不是项目问题**，换终端跑即可

#### B1-2 修字体子集缺字（P0-03）
文件：`scripts/subset-fonts.mjs`

```js
// 在 const ASCII = "..." 之后插入
const SYMBOLS =
	"©®™·•‥…—–‒―‹›«»“”‘’" +
	"▸◂▹◃◆◇■□▪▫●○◎★☆✦✧" +
	"⌘⌥⇧⌃⏎⎋" +
	"▓▒░█▌▐" +
	"×÷±≈≠≤≥∞√∑∏∫" +
	"←↑→↓↔↕" +
	"「」『』【】〔〕《》〈〉" +
	"，。！？；：、～　";

// 修改第 91 行
const text = job.family === "cjk" ? cjkText : ASCII + SYMBOLS;
```
- 删除 `public/fonts/*.woff2` 强制重建（脚本有 mtime 跳过逻辑）：
  ```bash
  rm public/fonts/InstrumentSans-*.woff2 public/fonts/Jost-Regular.woff2 public/fonts/JetBrainsMono-Regular.woff2 public/fonts/SpaceGrotesk.woff2
  pnpm build
  ```
- **验收**：`out/` 页面底部版权行 `© 2026 Leersxie · RHINE ARCHIVE OS v2` 中 `©` 与 `·` 的**字形与相邻 mono 文字一致**（不是方块与否的问题——见 P0-03 的实测澄清）。用 DevTools → Rendering → Show font metrics 核对。

#### B1-3 加载 Space Grotesk（P0-02）
文件：`app/globals.css`

```css
/* 追加到现有 @font-face 区末尾 */
@font-face {
	font-family: "Space Grotesk";
	src: url("/fonts/SpaceGrotesk.woff2") format("woff2");
	font-weight: 400 700;
	font-display: swap;
}
```
- **如果** `source-assets/fonts/SpaceGrotesk-Regular.ttf` 不存在 → 在 `JOBS` 里加条目会失败（脚本会 warn 并跳过，不阻断）。此时改走 fallback 方案：
  ```css
  --font-display: "Instrument Sans", "Space Grotesk", "Noto Sans SC", system-ui, sans-serif;
  ```
- **验收**：DevTools → 选中 h1 → Computed → `font-family` 首项是 Space Grotesk（或 Instrument Sans）。

#### B1-4 修移动端溢出（P0-01）
文件：`app/page.tsx`（h1）、`app/globals.css`（body）、`components/ArchiveArray.tsx`（容器）

```tsx
// app/page.tsx:77 —— 替换
<h1 className="mt-5 font-display text-[clamp(1.9rem,7vw,4.5rem)] font-normal leading-[0.94] tracking-[-0.03em] text-white">
	RHINE
	<span className="bg-gradient-to-r from-[var(--color-primary-soft)] to-[#7ea2ff] bg-clip-text text-transparent">
		{" "}ARCHIVE OS
	</span>
</h1>
```
```tsx
// app/page.tsx:54 —— section 加 overflow-x-clip
<section className="hero-panel relative overflow-x-clip border-b border-[var(--color-line)]">
```
```css
/* app/globals.css —— body 保险 */
body {
	background: var(--color-bg);
	color: var(--color-ink);
	font-family: var(--font-body);
	-webkit-font-smoothing: antialiased;
	overflow-x: clip;          /* 新增 */
}
```
```tsx
// ArchiveArray.tsx:80 —— 容器加 contain
className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint] [perspective:1100px] [--array-play:running]"
```
- **验收**：390×844 截图，`RHINE ARCHIVE OS` 完整可见，页面无横向滚动。

#### B1-5 修 Hero 渐隐色错误（P0-05）
文件：`components/ArchiveArray.tsx`

**直接删除** `ArchiveArray.tsx:125-127` 这两行渐隐层：
```tsx
// ❌ 删除
<div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
<div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
```
- **验收**：Hero 上下边缘无"更亮/更暗"的横向带。

#### B1-6 Hero 视觉降噪（P0-04，最小改动版）
文件：`components/ArchiveArray.tsx`

**只做两件事**（完整重构留给 B3）：
1. 容器加 `opacity-[0.45]`
2. 删除卡片里的**文字**（`:100-118` 的两个文本节点）

```tsx
// 替换 :100-118
<div className="mb-2 flex items-center justify-between">
	<span className="h-2 w-2 rounded-[2px]"
		style={{ background: bi % 3 === 0 ? "var(--color-primary)" : "var(--color-line-strong)" }} />
	<span className="h-[3px] w-8 rounded-[1px] bg-[var(--color-line-strong)]/40" />
</div>
<p className="truncate text-xs font-medium text-[var(--color-ink-soft)]/30">
	{box.label}
</p>
<div className="mt-2 h-1.5 w-full opacity-40 [background:repeating-linear-gradient(90deg,var(--color-line-strong)_0_2px,transparent_2px_5px)]" />
```
> 保留 `{box.label}` 但把 `opacity` 降到 30%，让文字"存在但不可读"。这是最省事的降噪——比彻底删掉更保真（还能看到"有内容"的暗示）。

3. `app/page.tsx:56` 删除 `os-grid` 那一层：
```tsx
// ❌ 删除
<div className="os-grid absolute inset-0 opacity-60" aria-hidden />
```
- **验收**：1440 截图，h1 后景无可辨认文字。

#### B1-7 P2 快修包（可选，10 分钟）
| 项 | 文件 | 改动 |
|---|---|---|
| `::selection` 加深 | `globals.css:102` | `rgb(124 92 255 / 0.42)` |
| 滚动条变细 | `globals.css:106` | `width: 6px; height: 6px`；`border: 2px solid var(--color-bg)` |
| focus-visible | `globals.css` 末尾 | `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` |
| 数字对齐 | `page.tsx:96` | 外层加 `tabular-nums` |

**B1 完成标志**：`pnpm build` 通过、`/` 和 `/archive/` 在 1440 与 390 下无溢出、无豆腐块、Hero 可读。

---

### B2 · 设计令牌重构（收敛配色 + 圆角 + 字体）

> **这一批决定"气质"。改完会像换了个站。**

#### B2-1 重写 `@theme`（方案 A）

文件：`app/globals.css` —— **替换整个 `@theme` 块和 `:root.dark` 块**

```css
@theme {
	/* ============ 色：三层骨架 ============ */
	/* 品牌（紫蓝，削到 2 档） */
	--color-brand: #7c5cff;
	--color-brand-soft: #9b85ff;

	/* 信号（唯一饱和强调）*/
	--color-signal: #f1c644;
	--color-signal-dim: rgb(241 198 68 / 0.12);

	/* 数据（只用于链接/进度/图表）*/
	--color-data: #4aabea;

	/* 骨架：明 */
	--color-bg: #f6f6f7;
	--color-panel: #ffffff;
	--color-panel-2: #eff0f2;
	--color-line: #e5e6e9;
	--color-line-strong: #c8cad0;
	--color-ink: #111318;
	--color-ink-soft: #4b4f58;
	--color-muted: #8b8f9a;

	/* ============ 圆角：四档制 ============ */
	--radius-pill: 999px;
	--radius-card: 14px;
	--radius-menu: 10px;
	--radius-tag: 4px;
	--radius-code: 8px;

	/* ============ 字体 ============ */
	--font-body: "Jost", "Noto Sans SC", system-ui, sans-serif;
	--font-display: "Space Grotesk", "Instrument Sans", "Noto Sans SC", system-ui, sans-serif;
	--font-serif: "Noto Serif SC", "Songti SC", serif;
	--font-mono: "JetBrains Mono", ui-monospace, Consolas, monospace;

	/* ============ 动效 ============ */
	--ease-os: cubic-bezier(0.22, 1, 0.36, 1);
	--ease-hover: cubic-bezier(0.22, 0.61, 0.36, 1);
	--dur-fast: 160ms;
	--dur-base: 260ms;
	--dur-slow: 480ms;

	/* ============ 阴影：两档 ============ */
	--shadow-rest: 0 1px 2px rgb(0 0 0 / 0.04);
	--shadow-lift: 0 14px 30px rgb(0 0 0 / 0.10);
}

:root {
	color-scheme: light;
}

:root.dark {
	color-scheme: dark;
	--color-bg: #0b0d11;
	--color-panel: #12141a;
	--color-panel-2: #191c23;
	--color-line: #23262e;
	--color-line-strong: #343945;
	--color-ink: #e9eaee;
	--color-ink-soft: #a6aab4;
	--color-muted: #6b707b;
	--color-brand: #9b85ff;
	--color-brand-soft: #b7a4ff;
	--color-signal: #f1c644;
	--color-data: #5fb8f0;
	--shadow-rest: 0 1px 2px rgb(0 0 0 / 0.4);
	--shadow-lift: 0 16px 34px rgb(0 0 0 / 0.5);
}
```

#### B2-2 全站替换旧色名（**关键，容易漏**）

旧名 → 新名映射：

| 旧 | 新 | 说明 |
|---|---|---|
| `--color-primary` | `--color-brand` | 所有引用处替换 |
| `--color-primary-deep` | `--color-brand` | 合并（去掉深档） |
| `--color-primary-soft` | `--color-brand-soft` | |
| `--color-primary-dim` | `rgb(124 92 255 / 0.10)` 或 `--color-brand-dim` | 建议保留 token 名 `--color-brand-dim` |
| `--color-indigo-line` | `--color-data` | 靛蓝并入数据色 |

**批量替换命令**（在项目根执行，先 `git commit` 保底）：
```bash
# 预览影响范围
grep -rn "color-primary\|color-indigo-line" app components lib --include="*.tsx" --include="*.ts" --include="*.css" | wc -l
```
然后用编辑器全局替换（**顺序很重要，长的先替换**）：
1. `--color-primary-soft` → `--color-brand-soft`
2. `--color-primary-deep` → `--color-brand`
3. `--color-primary-dim` → `--color-brand-dim`
4. `--color-primary` → `--color-brand`
5. `--color-indigo-line` → `--color-data`

同时 `globals.css` 里所有 `rgb(124 92 255 / ...)` 硬编码保持不变（色值未变，只是改名），但 `.archive-card:hover` 的 `rgb(124 92 255 / 0.45)` 建议改 `var(--color-brand)` 加 alpha。

#### B2-3 收敛板块色（`lib/site.ts`）

```ts
export const NAV_ITEMS = [
	{ href: "/",          label: "首页", tag: "HOME",     sig: 1.0 },
	{ href: "/archive/",  label: "归档", tag: "ARCHIVE",  sig: 0.8 },
	{ href: "/projects/", label: "项目", tag: "PROJECTS", sig: 0.6 },
	{ href: "/friends/",  label: "友链", tag: "LINKS",    sig: 0.4 },
	{ href: "/about/",    label: "关于", tag: "ABOUT",    sig: 0.2 },
] as const;
```

`AppShell.tsx` 对应改造（`:251-252`、`:346-361`）：

```tsx
const activeItem = NAV_ITEMS.find((n) => isActive(n.href));
const sig = activeItem?.sig ?? 1;

// 环境层：同色不同浓度
<div
	className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[600ms] ease-out"
	style={{ backgroundColor: "var(--color-brand)", opacity: 0.02 + sig * 0.045 }}
	aria-hidden
/>
```
并在根节点设置：
```tsx
style={{
	"--accent": "var(--color-brand)",
	"--accent-dim": `rgb(124 92 255 / ${0.06 + sig * 0.06})`,
} as React.CSSProperties}
```

> **效果**：首页环境紫 6.5%，归档 5.6%，友链 3.8%，关于 2.9%。色相不变，浓度递减。**用户感知是"这个板块更安静"，而不是"换了个网站"。**

#### B2-4 应用圆角制

| 位置 | 现值 | 改为 |
|---|---|---|
| `globals.css:158` `.nav-item` | `999px` | `var(--radius-pill)` |
| `globals.css:176` `.archive-card` | 无 | `border-radius: var(--radius-card)` |
| `page.tsx:14` | `rounded-xl` | **删掉**（组件自持） |
| `AppShell.tsx:134` 命令面板 | `rounded-xl` | `rounded-[var(--radius-card)]` |
| `AppShell.tsx:163` 列表项 `.nav-item` | 继承 | ✅ |
| `AppShell.tsx:148` kbd | 无 | `rounded-[var(--radius-tag)]` |
| `AppShell.tsx:276` Logo | `rounded-md` | `rounded-[var(--radius-menu)]` |
| `AppShell.tsx:373` 折叠按钮 | `rounded-full` | `rounded-[var(--radius-pill)]` |
| `AppShell.tsx:395` 菜单按钮 | `rounded-full` | ✅ 保持 |
| `AppShell.tsx:427` 检索按钮 | `rounded-full` | ✅ 保持 |
| `page.tsx:33` 标签 chip | `rounded` | `rounded-[var(--radius-tag)]` |
| `globals.css:269` code | `4px` | `var(--radius-tag)` |
| `globals.css:275` pre | `0.5rem` | `var(--radius-code)` |
| `posts/[slug]/page.tsx:81` 封面 | `rounded-xl` | `rounded-[var(--radius-card)]` |

#### B2-5 排印统一（"负字距大字 / 正字距小签"）

```css
/* globals.css —— 替换 @utility mono-tag */
@utility mono-tag {
	font-family: var(--font-mono);
	font-size: 0.75rem;              /* 11px → 12px */
	letter-spacing: 0.1em;           /* 0.14em → 0.1em（略收，中文混排更稳） */
	text-transform: uppercase;
	color: var(--color-muted);
	line-height: 1.4;
}

/* 新增：大标题统一负字距 */
@utility display-title {
	font-family: var(--font-display);
	font-weight: 600;
	letter-spacing: -0.035em;
	line-height: 0.96;
}
```

应用到：
- `page.tsx:110` `档案阵列` h2 → 加 `tracking-[-0.02em]`
- `AppShell.tsx:440` 页脚大字 → 改 `leading-[0.82] tracking-[-0.045em]`
- 各子页 h1 → 加 `tracking-[-0.025em] leading-[1.05]`
- `posts/[slug]/page.tsx:51` → `font-serif` + `tracking-[-0.02em]`（如果 B2-6 做了）

#### B2-6 引入思源宋体（可选但强烈推荐）

```bash
# 1. 下载 SourceHanSerifSC-SemiBold.otf 放入 source-assets/fonts/
#    地址：https://github.com/adobe-fonts/source-han-serif/releases
# 2. scripts/subset-fonts.mjs 的 JOBS 追加
```
```js
{ src: "SourceHanSerifSC-SemiBold.otf", out: "NotoSerifSC-SemiBold.woff2", family: "cjk" },
```
```css
/* globals.css */
@font-face {
	font-family: "Noto Serif SC";
	src: url("/fonts/NotoSerifSC-SemiBold.woff2") format("woff2");
	font-weight: 600;
	font-display: swap;
}
```
**只在这三处使用** `font-serif`：文章页 h1、归档页 h1、`.prose-os h2`。

#### B2-7 Hover 语言统一（反相 + 单一位移）

```css
/* globals.css —— 替换 .nav-item */
.nav-item {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0.5rem 0.875rem;
	border-radius: var(--radius-pill);
	font-size: 0.875rem;
	color: var(--color-ink-soft);
	transition: background-color var(--dur-fast) var(--ease-os),
	            color var(--dur-fast) var(--ease-os),
	            box-shadow var(--dur-fast) var(--ease-os);
}
.nav-item:hover {
	background: var(--color-panel-2);
	color: var(--color-ink);
	box-shadow: inset 2px 0 0 var(--color-brand);   /* 左侧 2px 信号条 */
}
.nav-item.is-active {
	background: var(--accent-dim, rgb(124 92 255 / 0.1));
	color: var(--accent, var(--color-brand));
	font-weight: 600;
	box-shadow: inset 2px 0 0 var(--accent, var(--color-brand));
}
```

```css
/* globals.css —— 替换 .archive-card 及其 hover */
.archive-card {
	position: relative;
	border: 1px solid var(--color-line);
	border-radius: var(--radius-card);
	background: var(--color-panel);
	overflow: hidden;
	box-shadow: var(--shadow-rest);
	transition:
		border-color var(--dur-base) var(--ease-hover),
		background var(--dur-base) var(--ease-hover),
		box-shadow var(--dur-base) var(--ease-hover),
		transform var(--dur-base) var(--ease-hover);
}
.archive-card:hover {
	border-color: var(--color-line-strong);
	box-shadow: var(--shadow-lift);
	transform: translateY(-3px);
}

/* 扫描光：降级为极淡白光，只桌面启用 */
.archive-card::before {
	content: "";
	position: absolute;
	inset: -40%;
	background: linear-gradient(115deg, transparent 44%, rgb(255 255 255 / 0.06) 50%, transparent 56%);
	transform: translateX(-60%);
	pointer-events: none;
}
@media (pointer: fine) {
	.archive-card::before { transition: transform 380ms var(--ease-os); }
	.archive-card:hover::before { transform: translateX(60%); }
}
@media (pointer: coarse) {
	.archive-card::before { display: none; }
}
```

**B2 完成标志**：全站再无 `--color-primary*` / `--color-indigo-line`；grep `rounded-` 只剩映射到 token 的写法；hover 300ms 内到终态。

---

### B3 · Hero 重做 + 布局扩容

#### B3-1 Hero 三段式重构

目标结构：
```
┌─────────────────────────────────────────────────┐
│ ● SYS.ONLINE          DOC.001 / HOME     21:32  │ ← 状态带 (h-9)
├─────────────────────────────────────────────────┤
│                                                 │
│   [3D 阵列剪影层 —— 无文字，opacity .4]           │
│   [雾化带 —— 保护标题]                            │
│                                                 │
│   // RHINE ARCHIVE OS v2 · 系统就绪               │ ← 打字机副标
│   RHINE ARCHIVE OS                              │ ← 主标题 clamp
│   把思考归档成可以被再次找到的东西。                 │ ← 描述
│                                                 │
│   04 ARCHIVES   8,412 WORDS   3 CATEGORIES      │ ← 数据三件套
│                                                 │
│   [ 浏览全部档案 ▸ ]  [ ⌘K 检索 ]                │ ← CTA 双按钮
│                                                 │
├─────────────────────────────────────────────────┤
│ + ─────────── HORIZON LINE ─────────── +        │ ← 底部刻度线
└─────────────────────────────────────────────────┘
```

```tsx
// app/page.tsx —— Hero 完整替换
<section className="hero-panel relative overflow-x-clip border-b border-[var(--color-line)]">
	<HeroVisual labels={posts.map((p) => p.title)} forceDark />

	{/* 雾化带：保护标题可读性 */}
	<div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(to_top,#141227_12%,rgb(20_18_39/0.86)_46%,transparent_100%)]" aria-hidden />

	{/* 融球色块：移到右上外沿，不穿标题 */}
	<div className="blob-morph pointer-events-none absolute -right-28 -top-20 h-80 w-80 bg-[var(--color-brand)]/10 blur-[48px]" aria-hidden />

	{/* 四角准星 */}
	{["left-5 top-5","right-5 top-5","left-5 bottom-5","right-5 bottom-5"].map(p => (
		<span key={p} className={`absolute ${p} font-mono text-xs text-white/20`} aria-hidden>+</span>
	))}

	{/* 顶部状态带 */}
	<div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-5">
		<span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
			<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)] shadow-[0_0_8px_var(--color-signal)]" />
			SYS.ONLINE
		</span>
		<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
			ARCHIVE / HOME
		</span>
	</div>

	{/* 主体 */}
	<div className="relative mx-auto max-w-6xl px-6 pb-14 pt-14">
		<TypeLine lines={[...]} />

		<h1 className="mt-5 font-display text-[clamp(1.9rem,7vw,4.5rem)] font-normal leading-[0.94] tracking-[-0.03em] text-white">
			RHINE
			<span className="bg-gradient-to-r from-[var(--color-brand-soft)] to-[#7ea2ff] bg-clip-text text-transparent">
				{" "}ARCHIVE OS
			</span>
		</h1>

		<p className="mt-4 max-w-lg text-sm leading-[1.75] text-[#aab4e0]">
			把思考归档成可以被再次找到的东西。玄学、项目、生活记录，都在这份阵列里。
		</p>

		{/* 数据三件套 */}
		<div className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-4">
			{[
				{ label: "ARCHIVES", value: posts.length, unit: "" },
				{ label: "WORDS", value: totalWords, unit: "" },
				{ label: "CATEGORIES", value: categories.size, unit: "" },
			].map((s) => (
				<div key={s.label} className="flex flex-col gap-1">
					<span className="font-display text-[2rem] font-semibold leading-none tabular-nums text-white">
						<RollingNumber value={s.value} />
					</span>
					<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
						{s.label}
					</span>
				</div>
			))}
		</div>

		{/* CTA 双按钮：主=信号色实底，次=白描边 */}
		<div className="mt-9 flex flex-wrap items-center gap-3">
			<Link href="/archive/"
				className="group inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-signal)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b0d11] transition hover:brightness-110">
				浏览全部档案
				<span className="transition-transform group-hover:translate-x-0.5">▸</span>
			</Link>
			<button onClick={() => setPaletteOpen(true)}
				className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70 transition hover:border-white/45 hover:text-white">
				⌘K 检索
			</button>
		</div>
	</div>

	{/* 底部刻度线 */}
	<div className="relative mx-auto flex max-w-6xl items-center gap-4 px-6 pb-6">
		<span className="font-mono text-[9px] tracking-[0.2em] text-white/25">+</span>
		<div className="h-px flex-1 [background:repeating-linear-gradient(90deg,rgb(255_255_255/0.22)_0_1px,transparent_1px_8px)]" />
		<span className="font-mono text-[9px] tracking-[0.2em] text-white/25">
			ARRAY.ACTIVE · {posts.length} UNITS
		</span>
		<div className="h-px w-16 [background:repeating-linear-gradient(90deg,rgb(255_255_255/0.22)_0_1px,transparent_1px_8px)]" />
		<span className="font-mono text-[9px] tracking-[0.2em] text-white/25">+</span>
	</div>
</section>
```

> **`HeroVisual` 的 `forceDark` 保留**。`os-grid` 已删（B1-6）。

#### B3-2 `ArchiveArray` 完全重构（剪影层）

```tsx
// components/ArchiveArray.tsx —— 只改渲染部分，useEffect 逻辑一行不动
export default function ArchiveArray({ labels }: { labels: string[] }) {
	const wrap = useRef<HTMLDivElement>(null);
	const plane = useRef<HTMLDivElement>(null);
	// ...useEffect 保持原样...

	// 用 labels 长度做种子，生成确定性的条宽序列
	const columns = [0, 1, 2, 3, 4].map((c) =>
		[0, 1, 2].map((r) => {
			const seed = (c * 31 + r * 17) % 100;
			return {
				key: `${c}-${r}`,
				h: 76 + (seed % 64),          // 76–140px
				w1: 28 + (seed % 34),         // 28–62%
				w2: 46 + ((seed * 7) % 40),   // 46–86%
				w3: 30 + ((seed * 13) % 40),
				hot: seed % 5 === 0,
			};
		}),
	);

	return (
		<div
			ref={wrap}
			className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.38] [contain:paint] [perspective:1100px] [--array-play:running]"
			aria-hidden
		>
			<div
				ref={plane}
				className="absolute left-1/2 top-1/2 w-[170%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] will-change-transform"
				style={{ transform: "rotateX(58deg)" }}
			>
				<div className="flex justify-center gap-8 md:gap-12">
					{columns.map((col, ci) => (
						<div
							key={ci}
							className="array-col flex w-36 flex-col gap-6 md:w-44"
							style={{ animationDuration: `${22 + ci * 5}s` }}
						>
							{[...col, ...col].map((box, bi) => (
								<div
									key={`${box.key}-${bi}`}
									className="rounded-[3px] border border-white/[0.07] bg-white/[0.015] p-3"
									style={{ height: `${box.h}px` }}
								>
									{/* 纯几何：三条数据线 + 一个状态块 */}
									<div className="mb-2 flex items-center justify-between">
										<span
											className="h-[3px] rounded-[1px] bg-white/15"
											style={{ width: `${box.w1}%` }}
										/>
										<span
											className={`h-1.5 w-1.5 rounded-[1px] ${box.hot ? "bg-[var(--color-signal)]/70" : "bg-white/10"}`}
										/>
									</div>
									<div
										className="mb-1.5 h-[2px] rounded-[1px] bg-white/10"
										style={{ width: `${box.w2}%` }}
									/>
									<div
										className="h-[2px] rounded-[1px] bg-white/10"
										style={{ width: `${box.w3}%` }}
									/>
									<div className="mt-auto h-1.5 w-full opacity-30 [background:repeating-linear-gradient(90deg,rgb(255_255_255/0.3)_0_2px,transparent_2px_5px)]" />
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
```
**关键改动**：
- `opacity-[0.38]`（原来是全亮）
- **删除所有文本渲染**，改为三条宽度随机的线 + 一个状态块
- 高度随机化（`76–140px`），制造"参差感"
- 每 5 个卡片有 1 个信号色块（`--color-signal`），像"档案里的活跃项"
- 删除顶部/底部渐隐层（B1-5 已删）
- `labels` prop 保留签名（避免改调用处），但**不再使用其内容**

> **若要消除 ESLint 未使用变量警告**，改为 `_labels` 或用 `void labels;`。

#### B3-3 文章页加 TOC

```tsx
// app/posts/[slug]/page.tsx
export default async function PostPage({ params }) {
	// ...
	const toc = (post.html ?? "").match(/<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/g)?.map(m => {
		const id = m.match(/id="([^"]+)"/)?.[1] ?? "";
		const text = m.replace(/<[^>]+>/g, "").replace(/<h2[^>]*>|<\/h2>/g, "");
		return { id, text, level: 2 };
	}) ?? [];

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_200px]">
			<article className="min-w-0">
				{/* ...现有全部内容... */}
			</article>

			{toc.length > 2 && (
				<aside className="hidden lg:block">
					<div className="sticky top-20">
						<p className="mono-tag mb-3">// INDEX</p>
						<nav className="space-y-2 border-l border-[var(--color-line)] pl-3">
							{toc.map((h, i) => (
								<a key={h.id} href={`#${h.id}`}
									className="group flex gap-2 text-xs leading-snug text-[var(--color-muted)] transition hover:text-[var(--color-brand)]">
									<span className="font-mono text-[9px] opacity-50">
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="line-clamp-2">{h.text}</span>
								</a>
							))}
						</nav>
					</div>
				</aside>
			)}
		</div>
	);
}
```

#### B3-4 子页头部双栏

以 `/archive/` 为例：
```tsx
<header className="border-b border-[var(--color-line)] px-6 pb-8 pt-10">
	<div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
		<div>
			<p className="mono-tag mb-2">// OPERATION LOG</p>
			<h1 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
				归档 · 作战记录
			</h1>
		</div>
		<div className="flex items-end gap-8">
			<Stat label="RECORDS" value={posts.length} />
			<Stat label="WORDS" value={totalWords} />
			<Stat label="SPAN" value="25–26" />
		</div>
	</div>
</header>
```

`Stat` 小组件（放 `components/Stat.tsx`）：
```tsx
export default function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col gap-1">
			<span className="font-display text-xl font-semibold leading-none tabular-nums">{value}</span>
			<span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{label}</span>
		</div>
	);
}
```

#### B3-5 档案阵列改 4 列 + 参差

```tsx
// app/page.tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{posts.map((post, i) => (
		<Reveal key={post.slug} delay={i * 70}>
			<div style={{ marginTop: i % 3 === 1 ? "20px" : i % 3 === 2 ? "10px" : 0 }}>
				<ArchiveCard post={post} index={i} />
			</div>
		</Reveal>
	))}
	{/* 占位卡见 B4-1 */}
</div>
```

**B3 完成标志**：1440 截图 Hero 有清晰的三段结构（状态带 / 主内容 / 刻度线）；阵列是纯几何无可读文字；文章页有右侧目录；1440 下右侧空白 ≤ 320px。

---

### B4 · 组件升级 + 空状态

#### B4-1 占位卡（P1-02）

```tsx
// app/page.tsx —— 网格内，posts.map 之后
{Array.from({ length: Math.max(0, 6 - posts.length) }).map((_, i) => (
	<div key={`ph-${i}`}
		className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)] p-5 opacity-50"
		aria-hidden>
		<div className="mb-3 flex items-center justify-between">
			<span className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)]">
				DOC.——-PENDING
			</span>
		</div>
		<p className="mb-1 font-mono text-sm text-[var(--color-muted)]">NO RECORD</p>
		<p className="mb-4 font-mono text-[11px] leading-relaxed text-[var(--color-muted)]/70">
			该档案位尚未写入。
		</p>
		<div className="mt-auto flex gap-2">
			<span className="h-4 w-12 rounded-[var(--radius-tag)] border border-dashed border-[var(--color-line)]" />
			<span className="h-4 w-10 rounded-[var(--radius-tag)] border border-dashed border-[var(--color-line)]" />
		</div>
	</div>
))}
```

#### B4-2 ArchiveCard 层级重排（P1-05 + 3.5）

```tsx
function ArchiveCard({ post }: { post: Post }) {
	return (
		<Link href={postPath(post)} className="archive-card group flex h-full flex-col p-5">
			{/* 元数据：极小 + 极淡 + 大字距 */}
			<div className="mb-3 flex items-center justify-between">
				<span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)]/60">
					{docId(post)}
				</span>
				<span className="font-mono text-[10px] tabular-nums text-[var(--color-muted)]/60">
					{post.published}
				</span>
			</div>

			{/* 标题：大 + 重 + 高对比 */}
			<h2 className="mb-2 text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-brand)]">
				<DecryptText text={post.title} />
			</h2>

			{/* 摘要：小 + 淡 */}
			<p className="mb-5 line-clamp-2 text-[13px] leading-[1.65] text-[var(--color-ink-soft)]/75">
				{post.description}
			</p>

			{/* 底部：标签常驻 + 箭头只做位移 */}
			<div className="mt-auto flex items-center gap-1.5">
				{post.tags.slice(0, 3).map((tag) => (
					<span key={tag}
						className="rounded-[var(--radius-tag)] border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)]">
						{tag}
					</span>
				))}
				<span className="ml-auto font-mono text-xs text-[var(--color-brand)] opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
					▸
				</span>
			</div>
		</Link>
	);
}
```
**三个变化**：
1. `OPEN ▸` 常驻（`opacity-40`），hover 才 `opacity-100` —— 触屏也能看见
2. 元数据用 `tracking-[0.18em]` + `/60` 透明度，与标题拉出"悬崖式"落差
3. `h-full` 保证栅格高度一致

#### B4-3 友链卡片升级（P1-06）

```tsx
<a href={f.href} target="_blank" rel="noreferrer"
	className="archive-card group flex items-center gap-3.5 p-4">
	{/* 几何徽记替代单字母渐变块 */}
	<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--radius-menu)] border border-[var(--color-line)] bg-[var(--color-panel-2)]">
		<span className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-semibold text-[var(--color-ink)]">
			{f.name[0]}
		</span>
		<span className="absolute -bottom-2.5 -right-2.5 h-4 w-4 rotate-45 bg-[var(--accent)]/25" />
		<span className="absolute left-0 top-0 h-[2px] w-4 bg-[var(--accent)]/60" />
	</div>
	<div className="min-w-0">
		<p className="truncate text-sm font-medium transition-colors group-hover:text-[var(--color-brand)]">
			{f.name}
		</p>
		<p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{f.desc}</p>
	</div>
</a>
```

#### B4-4 顶栏状态灯组（P1-04）

```tsx
function StatusDot({ label, state = "ok" }: { label: string; state?: "ok" | "idle" }) {
	return (
		<span className="inline-flex items-center gap-1.5">
			<span className={state === "ok"
				? "h-1.5 w-1.5 rounded-full bg-[var(--color-signal)] shadow-[0_0_5px_var(--color-signal)]"
				: "h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]/40"} />
			<span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
				{label}
			</span>
		</span>
	);
}
```
放在桌面顶栏中部（`AppShell.tsx:418` 之后）。

#### B4-5 侧栏 MODULES 宫格（P1-04）

在 `AppShell.tsx` 的 `RECENT ARCHIVES` 列表之后、`border-t` 之前插入：

```tsx
{!collapsed && (
	<div className="mt-4 px-2">
		<p className="mono-tag px-3 pb-2">MODULES</p>
		<div className="grid grid-cols-2 gap-1">
			{NAV_ITEMS.map((n) => (
				<Link
					key={n.href}
					href={n.href}
					className="group rounded-[var(--radius-menu)] border border-[var(--color-line)] px-2.5 py-2 transition hover:border-[var(--accent)]"
				>
					<p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
						{n.tag}
					</p>
					<p className="mt-0.5 text-xs text-[var(--color-ink-soft)] transition group-hover:text-[var(--color-ink)]">
						{n.label}
					</p>
				</Link>
			))}
		</div>
	</div>
)}
```
**注意**：这段要放在 `flex-1 overflow-y-auto` 容器**之后**（即滚动区外），否则会跟着 `RECENT ARCHIVES` 一起滚动。若侧栏高度不够，优先牺牲 `RECENT ARCHIVES` 的条数（从 6 条降到 4 条）。

#### B4-6 文案替换（P1 · 文字搭配）

按 1.4 节的改写表逐条替换：

| 文件 | 位置 | 旧 | 新 |
|---|---|---|---|
| `app/page.tsx:72` | TypeLine lines[0] | `欢迎访问 LX 的档案库。这里存放随笔、项目与记录。` | `终端已连接。当前档案库包含随笔、项目与记录。` |
| `app/page.tsx:74` | TypeLine lines[2] | `读你想读的，剩下的交给时间。` | `检索索引已建立。输入关键词，或直接开始阅读。` |
| `app/page.tsx:85` | 描述段 | `把思考归档成可以被再次找到的东西。玄学、项目、生活记录，都在这份阵列里。` | `把思考归档成可以被再次找到的东西。` |

**不要动的**：
- `RHINE ARCHIVE OS v2 · 系统就绪 · 全部档案可检索（⌘K）` —— 已是标准语气
- 404 的 `请求的档案不存在，或已在一次重构中被移入深海。` —— 全站最佳文案
- `档案阵列` / `归档 · 作战记录` —— 术语准确

**统一英文小签前缀**：全站 grep `//`、`·`、`[ ]`、`SYS.`，确保：
- `//` → 用于所有区块英文小签（`// ARCHIVE ARRAY`、`// INDEX`、`// OPERATION LOG`）
- `[ ]` → 只用于作品/系列名
- `·` → 只用于同一行内的分隔（`RHINE ARCHIVE OS v2 · 系统就绪`）
- 禁止使用 `SYS.` 作为小签前缀（那是状态值，不是标签）

**验收**：全站搜索"欢迎""试试""快来""哦""呀""吧"——除文章正文外应为 0 处。


**B4 完成标志**：只有 1 篇文章时首页仍是完整 3 列网格；友链头像不是纯色方块；顶栏有 ≥5 组信息。

---

## 6. 代码附录

### A.1 完整 `globals.css` 骨架（B2 后应有形态）

```css
@import "tailwindcss";

/* ================= @font-face ================= */
@font-face { font-family:"Noto Sans SC"; src:url("/fonts/NotoSansSC-Regular.woff2") format("woff2"); font-weight:400; font-display:swap }
@font-face { font-family:"Noto Serif SC"; src:url("/fonts/NotoSerifSC-SemiBold.woff2") format("woff2"); font-weight:600; font-display:swap }
@font-face { font-family:"Instrument Sans"; src:url("/fonts/InstrumentSans-Regular.woff2") format("woff2"); font-weight:400; font-display:swap }
@font-face { font-family:"Instrument Sans"; src:url("/fonts/InstrumentSans-SemiBold.woff2") format("woff2"); font-weight:600; font-display:swap }
@font-face { font-family:"Space Grotesk"; src:url("/fonts/SpaceGrotesk.woff2") format("woff2"); font-weight:400 700; font-display:swap }
@font-face { font-family:"Jost"; src:url("/fonts/Jost-Regular.woff2") format("woff2"); font-weight:400; font-display:swap }
@font-face { font-family:"JetBrains Mono"; src:url("/fonts/JetBrainsMono-Regular.woff2") format("woff2"); font-weight:400; font-display:swap }

/* ================= @theme ================= */
/* 见 B2-1 完整代码 */

/* ================= 基础 ================= */
html { scrollbar-gutter: stable; scroll-behavior: smooth }
body {
	background: var(--color-bg);
	color: var(--color-ink);
	font-family: var(--font-body);
	-webkit-font-smoothing: antialiased;
	overflow-x: clip;
}
::selection { background: rgb(124 92 255 / 0.42) }
:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; border-radius: inherit }

::-webkit-scrollbar { width: 6px; height: 6px }
::-webkit-scrollbar-thumb { background: var(--color-line-strong); border: 2px solid var(--color-bg); border-radius: 6px }
::-webkit-scrollbar-track { background: transparent }

/* ================= @utility ================= */
@utility mono-tag { font-family:var(--font-mono); font-size:.75rem; letter-spacing:.1em; text-transform:uppercase; color:var(--color-muted); line-height:1.4 }
@utility glass-panel { background: color-mix(in srgb, var(--color-panel) 88%, transparent); border:1px solid var(--color-line); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px) }
@utility os-grid { /* 保留但只在非 Hero 场景使用 */ }
@utility display-title { font-family:var(--font-display); font-weight:600; letter-spacing:-.035em; line-height:.96 }

/* ================= 组件（见 B2-7） ================= */
/* .nav-item / .archive-card / .prose-os ... */

@media (prefers-reduced-motion: reduce) {
	*,*::before,*::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important }
}
@media (prefers-reduced-transparency: reduce) {
	.glass-panel { backdrop-filter:none; -webkit-backdrop-filter:none; background:var(--color-panel) }
}
```

### A.2 Token 速查表

| Token | 亮 | 暗 | 用途 |
|---|---|---|---|
| `--color-brand` | `#7c5cff` | `#9b85ff` | 品牌、链接、active |
| `--color-brand-soft` | `#9b85ff` | `#b7a4ff` | 渐变高光 |
| `--color-signal` | `#f1c644` | `#f1c644` | **唯一饱和强调**：状态灯、CTA、进度 |
| `--color-data` | `#4aabea` | `#5fb8f0` | 图表、次要链接 |
| `--color-bg` | `#f6f6f7` | `#0b0d11` | 页面底 |
| `--color-panel` | `#ffffff` | `#12141a` | 卡片/侧栏 |
| `--color-panel-2` | `#eff0f2` | `#191c23` | 次级块/hover |
| `--color-line` | `#e5e6e9` | `#23262e` | 1px 分隔 |
| `--color-line-strong` | `#c8cad0` | `#343945` | 强调边框 |
| `--color-ink` | `#111318` | `#e9eaee` | 主文字 |
| `--color-ink-soft` | `#4b4f58` | `#a6aab4` | 正文 |
| `--color-muted` | `#8b8f9a` | `#6b707b` | 元数据 |
| `--radius-pill` | `999px` | — | 胶囊 |
| `--radius-card` | `14px` | — | 卡片 |
| `--radius-menu` | `10px` | — | 菜单项 |
| `--radius-tag` | `4px` | — | 极小标签 |
| `--radius-code` | `8px` | — | 代码块 |
| `--ease-os` | `cubic-bezier(.22,1,.36,1)` | — | 进场 |
| `--ease-hover` | `cubic-bezier(.22,.61,.36,1)` | — | hover |
| `--dur-fast` | `160ms` | — | 颜色 |
| `--dur-base` | `260ms` | — | 位移/阴影 |
| `--dur-slow` | `480ms` | — | 大范围 |

### A.3 正文 h2 升级（P2-05）

```css
.prose-os h2 {
	position: relative;
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1.45;
	margin: 2.4em 0 1em;
	padding-left: 1rem;
	letter-spacing: -0.01em;
	counter-increment: h2;
}
.prose-os h2::before {
	content: "";
	position: absolute;
	left: 0; top: 0.15em; bottom: 0.15em;
	width: 2px;
	background: var(--color-brand);
}
.prose-os h2::after {
	content: counter(h2, decimal-leading-zero);
	position: absolute;
	left: -2.2rem; top: 0.22em;
	font-family: var(--font-mono);
	font-size: 0.625rem;
	letter-spacing: 0.1em;
	color: var(--color-muted);
}
.prose-os { counter-reset: h2 }
```

### A.4 阅读进度条升级（P2-15）

```css
.reading-progress {
	position: fixed;
	top: 0; left: 0;
	height: 2px;
	width: 0%;
	z-index: 60;
	background: var(--color-signal);
	box-shadow: 0 0 8px var(--color-signal);
	transition: width 80ms linear;
}
/* 底衬刻度：暗示"总量" */
.reading-progress::after {
	content: "";
	position: fixed;
	top: 0; left: 0; right: 0;
	height: 2px;
	background: repeating-linear-gradient(90deg, var(--color-line) 0 1px, transparent 1px 12px);
	z-index: -1;
}
```

### A.5 自查脚本

存为 `scripts/audit-design.mjs`，B2 完成后运行：

```js
/**
 * 设计一致性自查：B2 完成后运行 node scripts/audit-design.mjs
 * 退出码 0 = 通过；1 = 有违规
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const SCAN = ["app", "components", "lib"];
const EXTS = /\.(tsx?|css)$/;

const RULES = [
	{ id: "legacy-color", re: /--color-primary|--color-indigo-line/g, msg: "使用了已废弃的旧色名" },
	{ id: "magic-radius", re: /rounded-\[?\d+px\]?|border-radius:\s*\d+px/g, msg: "裸数值圆角，应使用 --radius-* token" },
	{ id: "hard-shadow", re: /shadow-\[0_\d+px/g, msg: "硬编码阴影，应使用 --shadow-rest / --shadow-lift" },
	{ id: "multi-accent", re: /accent:\s*"#[0-9a-f]{6}"/gi, msg: "NAV_ITEMS 残留独立 accent 色，应收敛为 sig" },
];

const issues = [];
function walk(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".next") walk(p); continue; }
		if (!EXTS.test(e.name)) continue;
		const src = fs.readFileSync(p, "utf8");
		src.split("\n").forEach((line, i) => {
			for (const r of RULES) {
				if (r.re.test(line)) issues.push({ file: path.relative(ROOT, p), line: i + 1, rule: r.id, msg: r.msg, text: line.trim().slice(0, 90) });
				r.re.lastIndex = 0;
			}
		});
	}
}
SCAN.map((d) => path.join(ROOT, d)).forEach((d) => fs.existsSync(d) && walk(d));

if (issues.length === 0) { console.log("✓ 设计一致性检查通过"); process.exit(0); }
console.group(`✗ 发现 ${issues.length} 处违规`);
for (const i of issues) console.log(`${i.file}:${i.line}  [${i.rule}]  ${i.msg}\n    ${i.text}`);
console.groupEnd();
process.exit(1);
```

---

## 7. 验收清单（交付前逐项打勾）

### 7.1 功能验收

- [ ] `pnpm build` 成功，`verify-export.mjs` 无报错
- [ ] `pnpm build` 通过；`out/posts/` 只有 `guestbook/`（**正确**，其余是 draft）
- [ ] ⌘K 命令面板可开、可搜、可跳、ESC 可关
- [ ] 明暗切换正常，刷新保持（`raos-theme`）
- [ ] BootSequence 只在首次会话播放，可跳过，reduced-motion 不播放
- [ ] 音效开关可切换并持久化
- [ ] Giscus 在文章页/留言板正常加载，且跟随主题

### 7.2 视觉验收（1440×900）

- [ ] Hero 三段结构清晰（状态带 / 主内容 / 刻度线）
- [ ] h1 后景无可辨认文字
- [ ] Hero 上下边缘无异常亮/暗横带
- [ ] 圆角只出现 4 档（`999/14/10/4`），无裸 px
- [ ] 饱和色只有 `brand` + `signal` + `data` 三处，`signal` 面积 ≤ 5%
- [ ] 所有 `<h1>` 为负字距；所有 `.mono-tag` 为正字距 + uppercase
- [ ] `▸ ◂ ⌘ © ·` 与相邻等宽文字基线对齐、粗细一致（**不是**要求"无方块"）
- [ ] 卡片 hover 300ms 内到终态，位移 -3px，有阴影
- [ ] 子页右侧空白 ≤ 320px
- [ ] 文章页有右侧 TOC（≥3 个 h2 时）
- [ ] 只有 1 篇文章时，首页仍是完整网格（占位卡）
- [ ] 全站语气统一：无"欢迎""快来""试试""哦/呀/吧"（正文除外）
- [ ] 英文小签前缀只用 `//`；`[ ]` 只用于系列名；`·` 只用于行内分隔

### 7.3 移动端验收（390×844）

- [ ] 无横向滚动（`documentElement.scrollWidth === 390`）
- [ ] h1 完整可见
- [ ] 卡片不溢出屏幕
- [ ] 抽屉菜单可开可关，点遮罩关闭
- [ ] 触屏无 `::before` 扫描光残留
- [ ] 顶栏时钟不挤压标题

### 7.4 可访问性验收

- [ ] 所有交互元素有 `:focus-visible` 描边
- [ ] 正文对比度 ≥ 4.5:1（用 DevTools 检查 `--color-ink-soft` on `--color-bg`）
- [ ] `prefers-reduced-motion` 下所有动画静止
- [ ] 图片有 `alt`，装饰元素有 `aria-hidden`
- [ ] 键盘可完成：导航 → 打开文章 → 返回 → ⌘K 检索

### 7.5 性能验收

- [ ] LCP < 2.0s（本地 `serve` 测试）
- [ ] CLS < 0.05（字体 `font-display: swap` + `scrollbar-gutter: stable`）
- [ ] 首屏 JS < 200KB（three.js 已懒加载）
- [ ] 字体总下载 < 400KB（子集化后）
- [ ] 无 layout thrashing（`ArchiveArray` 的 rAF 只写 transform）

---

## 8. 常见坑（写给 GLM 的避雷提示）

| 坑 | 表现 | 规避 |
|---|---|---|
| **Tailwind v4 没有 `tailwind.config.js`** | 改了 config 没生效 | 所有 token 必须写在 `globals.css` 的 `@theme` 块内 |
| **`@utility` 语法** | 用 `@layer utilities` 会失效 | Tailwind v4 用 `@utility name { ... }` |
| **`overflow-hidden` 破坏 sticky** | 顶栏不吸附 | 用 `overflow-x: clip` 代替 |
| **`backdrop-filter` 在 `overflow:hidden` 父级内失效** | 毛玻璃变透明 | 父级改 `overflow: clip` 或去掉 |
| **`clip-path` 会切掉 border** | 斜切按钮没边框 | 用背景色反差替代 border |
| **three.js 在 SSR 报 `window is not defined`** | build 失败 | 必须 `dynamic(..., { ssr: false })`（项目已做） |
| **`export const dynamicParams = false`** | 新文章 404 | 新增 md 后必须重新 build |
| **静态导出不能用 `searchParams`** | build 报错 | 筛选/搜索全部走客户端状态 |
| **`animejs` v4 API 变更** | `anime()` 默认导出失效 | 用 `import { animate, stagger } from "animejs"`（项目已对） |
| **字体子集 mtime 跳过** | 改了字符集没重新生成 | 删 `public/fonts/*.woff2` 后重建 |
| **`--color-*` 在 `:root.dark` 里重定义不生效** | 暗色配色不变 | `@theme` 生成的是 `:root` 变量，`dark` 必须用 `:root.dark` 提高特异性（项目已对） |
| **`tabular-nums` 不生效** | 数字宽度跳动 | 需要字体本身含 `tnum` feature；Noto Sans SC 有，Jost 无 → 数字用 mono 或 display 字体 |

---

## 9. 参考实现索引（改哪个文件看哪节）

| 要改的东西 | 文件 | 本文档对应章节 |
|---|---|---|
| 配色 / 字体 / 圆角 / 动效 token | `app/globals.css` `@theme` | B2-1、A.1、A.2 |
| 导航项 / 卡片 / 正文样式 | `app/globals.css` 组件区 | B2-7、A.3 |
| 侧栏 / 顶栏 / 页脚 / 命令面板 | `components/AppShell.tsx` | P1-04、B2-3、B4-4 |
| 三维档案阵列 | `components/ArchiveArray.tsx` | B1-5、B3-2 |
| 首页 Hero + 档案阵列 | `app/page.tsx` | B1-4、B3-1、B3-5、B4-1、B4-2 |
| 文章页 + TOC | `app/posts/[slug]/page.tsx` | P1-01、B3-3、A.4 |
| 导航数据 | `lib/site.ts` | B2-3 |
| 字体子集 | `scripts/subset-fonts.mjs` | B1-2、B2-6 |
| 开屏 | `components/BootSequence.tsx` | P2-09（保留主体） |
| 友链 | `app/friends/page.tsx` | B4-3 |

---

## 10. 优先级总表（如果时间有限，只做这些）

| 优先级 | 事项 | 章节 | 工时预估 |
|---|---|---|---|
| **必须** | 锁定基线（build 通过） | B1-1 | 5 min |
| **必须** | 字体子集符号 + Space Grotesk | B1-2、B1-3 | 30 min |
| **必须** | 移动端溢出 | B1-4 | 20 min |
| **必须** | Hero 降噪 + 渐隐修复 | B1-5、B1-6 | 30 min |
| **必须** | 配色收敛（方案 A） | B2-1、B2-2、B2-3 | 2 h |
| **必须** | 圆角四档 + hover 统一 | B2-4、B2-7 | 1.5 h |
| **强烈建议** | Hero 三段式重构 | B3-1 | 2 h |
| **强烈建议** | 占位卡（解决"看着像坏了"） | B4-1 | 40 min |
| **强烈建议** | 卡片层级重排 | B4-2 | 40 min |
| **强烈建议** | 文案语气统一（3 条替换） | B4-6 | 20 min |
| **建议** | 子页双栏 + TOC | B3-3、B3-4 | 2 h |
| **建议** | 思源宋体标题 | B2-6 | 1 h |
| **可选** | 顶栏状态灯 + 侧栏宫格 | B4-4、B4-5 | 1 h |
| **可选** | P2 快修包 20 条 | P2 表 | 2 h |

**最小可行升级（MVP）**：B1 全部 + B2-1/2/3/4/7 + B4-1。约 5 小时，能拿回 80% 的观感提升。

---

## 附录 · 一句话备忘

1. **删比加重要**：删 7 个色、删 1 层网格、删 3 处重复动效，比加 10 个特效有用。
2. **一个饱和色**：全站只允许 `--color-signal` 是高饱和。其余靠明度/字重/尺寸做层级。
3. **悬崖式层级**：字号/字重/透明度三个维度同时拉开，不要"台阶式"微调。
4. **大字负字距，小字正字距**：这一条单独就能提升 30% 的"设计感"。
5. **圆角只有四档**：体积越大圆角越大，永不错配。
6. **hover 只做一件事**：位移 + 阴影，200–300ms。不要同时扫描、变色、缩放、发光。
7. **留白是内容**：方舟的留白不是"没填满"，是"待解密"。
8. **空状态要设计**：内容少的时候，占位卡比留白体面。方舟的"编号 + 空位"本身就是世界观。
9. **纹理省空间**：网点/扫描线/刻度，纯 CSS 零资源，能顶掉一张背景图。
10. **别学 ignoredone 的工程方式**：它用 `!important` 和隐藏原生结构硬改 WordPress。你的 Next.js 用 token 就能做到同样的效果，成本是它的 1/5。

---

*文档结束 · 共 10 章 + 附录 · 面向 GLM 实施*



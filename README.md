# Leersxie's Blog

个人博客源码：**https://leersxie.github.io/**

基于 Astro 构建的静态博客，主题来源于开源项目 [Mizuki](https://github.com/matsuzaka-yuki/Mizuki)（Apache-2.0），并做了本地化定制。

---

## 技术栈

| 项目 | 说明 |
| --- | --- |
| 框架 | [Astro](https://astro.build) 6（`output: static`，全站预渲染） |
| 交互组件 | Svelte 5 |
| 样式 | Tailwind CSS 4（CSS-first 配置）+ PostCSS + Stylus |
| 语言 | TypeScript 5（`tsconfig.json` 提供 `@components/*` 等路径别名） |
| 搜索 | Pagefind（构建后生成静态索引） |
| 包管理 | pnpm 10（`preinstall` 已强制，勿使用 npm / yarn） |
| Node | >= 22 |

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 本地开发（http://localhost:4321）
pnpm build            # 生产构建，产物在 dist/
pnpm preview          # 预览构建产物
pnpm check            # Astro 类型与模板检查
pnpm lint             # ESLint（自动修复）
pnpm format           # Prettier 格式化 src
pnpm test             # 单元测试（Vitest）
pnpm new-post <名称>  # 新建文章，自动生成 frontmatter
pnpm generate:og      # 重新生成站点默认分享图
pnpm generate:icons   # 从 design/icon-source.png 重新生成整套站点图标
pnpm check-env        # 检查 .env 配置是否完整
```

`pnpm build` 内部依次执行：更新番剧数据 → `astro build` → Pagefind 索引 → 字体子集化。
其中字体子集化会把 `public/assets/font/` 下的 TTF 按站点实际用字压缩为 woff2 并改写 CSS 引用。

## 目录结构

```
src/
├── config.ts          # 站点唯一配置入口（导航、侧栏、功能开关、字体、评论…）
├── content.config.ts  # 内容集合与 frontmatter Schema 定义
├── content/
│   ├── posts/         # 文章（Markdown）
│   └── spec/          # 关于、友链等页面正文
├── data/              # 功能页结构化数据（TS）
├── pages/             # 文件路由
├── layouts/           # Layout（html/head/body）→ MainGridLayout（导航/横幅/三栏网格）
├── components/        # 组件，按 atoms / control / widgets / features / organisms 等分层
├── plugins/           # 自定义 remark / rehype / Expressive Code 插件
├── scripts/           # 客户端运行时脚本（Swup、TOC、效果）
├── styles/            # 样式入口与分模块样式
├── i18n/              # 多语言（zh_CN / en / ja / zh_TW）
└── utils/             # 工具函数
public/                # 直通拷贝的静态资源（不经过构建优化）
scripts/               # 构建与维护用 Node 脚本
docs/                  # 部署、内容分离、迁移等文档
```

## 写文章

在 `src/content/posts/` 下新建 `.md` 文件，或执行 `pnpm new-post 文件名`。frontmatter 示例：

```yaml
---
title: 文章标题
published: 2026-03-28
description: 摘要，会用于 SEO 描述与分享卡片
category: 日常
tags: [标签A, 标签B]
image: /assets/images/cover.webp   # 封面图，可选
draft: false
---
```

可用字段见 `src/content.config.ts`，包含 `updated`、`pinned`、`priority`、`alias`、`permalink`、`encrypted` / `password`（文章加密）等。

### 封面图与分享图

`image` 支持两种写法：

- **`public/` 下的绝对路径**，如 `/assets/images/cover.webp`；
- **文章目录内的相对路径**，如 `cover.webp`（与 `.md` 同目录，构建时会走 `astro:assets` 生成响应式变体）。

封面图会用在三处：文章页顶部、列表卡片、以及 `og:image`（社交平台分享预览）。

**没有封面图时，分享预览会回退到站点默认分享图** `public/assets/og-default.png`。
该图由脚本生成，改完站点标题 / 副标题后重跑即可同步：

```bash
pnpm generate:og
```

想换成自己设计的图，直接替换 `public/assets/og-default.png` 即可（建议 1200×630），
并把 `src/config.ts` 里的 `siteConfig.ogImage` 指到对应路径。

## 站点配置

绝大多数站点行为都集中在 `src/config.ts`，包括：

- `siteConfig.featurePages` —— 功能页开关。**关闭的页面不会进入 sitemap**（页面本身会跳转 404）。
- `siteConfig.banner` / `wallpaperMode` —— 横幅与壁纸模式。
- `siteConfig.thirdPartyAnalytics` —— Microsoft Clarity 与 Google Tag Manager 各自独立开关。
- `font` —— ASCII / CJK 字体及是否开启构建期子集化。
- `musicPlayerConfig`、`commentConfig`、`sidebarLayoutConfig` 等。

## 部署

推送 `master` 后由 GitHub Actions 自动构建并发布到 GitHub Pages，流水线定义在 `.github/workflows/deploy.yml`：

```
quality（ESLint + astro check + 单测） → build → lighthouse
                                            ↘ deploy（仅 master 推送时）
```

GitHub Pages **不支持自定义响应头**，因此仓库中的 `vercel.json` 与 `public/_headers` 在当前部署方式下均不生效，仅在改用 Vercel / Netlify / Cloudflare Pages 时才有意义。两者已保持一致的配置意图。

其他平台的部署说明见 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 可选：内容分离

可将文章与代码拆到两个仓库，通过 `.env` 中的 `ENABLE_CONTENT_SYNC`、`CONTENT_REPO_URL` 控制（详见 [`docs/CONTENT_SEPARATION.md`](docs/CONTENT_SEPARATION.md)）。默认关闭，内容直接取自 `src/content/`。

## 许可

主题基于 Apache-2.0。站点原创内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。

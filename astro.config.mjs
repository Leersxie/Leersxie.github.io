import fs from "node:fs";
import path from "node:path";

import sitemap from "@astrojs/sitemap";
import svelte, { vitePreprocess } from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { umami } from "oddmisc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";

import { permalinkConfig, siteConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { rehypeImageWidth } from "./src/plugins/rehype-image-width.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { rehypeWrapTable } from "./src/plugins/rehype-wrap-table.mjs";
import { remarkContent } from "./src/plugins/remark-content.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkFixGithubAdmonitions } from "./src/plugins/remark-fix-github-admonitions.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";

/**
 * 功能页路由映射（与 src/config.ts 的 featurePages 一一对应）。
 * 未启用的功能页仍会被构建为「跳转 404」的占位页面，
 * 因此这里同步把它们从 sitemap 中剔除，避免向搜索引擎提交无效 URL。
 */
const FEATURE_PAGE_ROUTES = {
	anime: "/anime/",
	diary: "/diary/",
	friends: "/friends/",
	projects: "/projects/",
	skills: "/skills/",
	timeline: "/timeline/",
	albums: "/albums/",
	devices: "/devices/",
};

const POSTS_DIR = path.resolve("./src/content/posts");

/**
 * 收集「兼容旧链接的副本页」路径前缀。
 *
 * 与 `src/pages/posts/[...slug].astro` 的 noindex 判据同源：使用根路径 permalink
 * 或 alias 的文章，其 `/posts/<文件>` 页只是副本，规范地址在别处，因此不该进 sitemap。
 * 两处判据必须保持一致，否则会重演「提交了却禁止抓取」的自相矛盾。
 *
 * 这里读不到 content 集合（config 阶段没有 astro:content），所以直接扫描 frontmatter。
 * 漏判的失败模式是良性的：最坏只是 sitemap 里多列一条带 noindex 的地址，不会误删应收录的页面。
 */
/** 递归列出 src/content/posts 下所有 .md 的相对路径（与内容集合的递归 glob 一致） */
const listPostFiles = (dir, prefix = "") => {
	let dirents = [];
	try {
		dirents = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}

	const files = [];
	for (const dirent of dirents) {
		const relative = prefix ? `${prefix}/${dirent.name}` : dirent.name;
		if (dirent.isDirectory()) {
			files.push(...listPostFiles(path.join(dir, dirent.name), relative));
		} else if (relative.endsWith(".md")) {
			files.push(relative);
		}
	}
	return files;
};

const collectNonCanonicalPostPrefixes = () => {
	// 全局 permalink 开启时，所有文章都以根路径为规范地址，`/posts/` 下全是副本
	if (permalinkConfig.enable) {
		return ["/posts/"];
	}

	const prefixes = [];

	for (const relative of listPostFiles(POSTS_DIR)) {
		let raw = "";
		try {
			raw = fs.readFileSync(path.join(POSTS_DIR, relative), "utf8");
		} catch {
			continue;
		}
		// 没有 frontmatter 的文件不参与判断（避免把正文里的同名字符串当成配置）
		if (!raw.startsWith("---")) {
			continue;
		}

		const frontmatter = raw.split(/^---\s*$/m)[1] ?? "";
		const readValue = (key) => {
			const matched = frontmatter.match(
				new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"),
			);
			if (!matched) {
				return "";
			}
			return matched[1]
				// 先去掉 YAML 行尾注释：否则 `permalink: # 说明` 会被误判成「有 permalink」，
				// 那会导致页面可索引却被 sitemap 排除 —— 唯一有害的分叉方向
				.replace(/\s+#.*$/, "")
				.replace(/^['"]|['"]$/g, "")
				.replace(/^\/+|\/+$/g, "")
				.trim();
		};

		// 与 removeFileExtension(entry.id) 等价：只去掉 .md，保留目录层级。
		// 不要把 `<dir>/index.md` 折成 `<dir>`：那会让前缀 `/posts/<dir>/` 连带
		// 排除同目录下本应收录的其它页面（如 /posts/<dir>/other/）。
		const slug = relative.replace(/\.md$/, "");

		if (readValue("permalink")) {
			// 自定义 permalink：规范地址在根路径，默认 slug 页是副本
			prefixes.push(`/posts/${slug}/`);
			continue;
		}

		const alias = readValue("alias").replace(/^posts\//, "");
		if (alias) {
			// alias 副本（与 src/utils/post-url.ts 的归一化方式保持一致）
			prefixes.push(`/posts/${alias}/`);
		}
	}

	return prefixes;
};

const nonIndexablePrefixes = [
	"/api/",
	"/og/",
	...Object.entries(FEATURE_PAGE_ROUTES)
		.filter(([key]) => !siteConfig.featurePages?.[key])
		.map(([, route]) => route),
	...collectNonCanonicalPostPrefixes(),
];

/** 判断某个页面是否应被 sitemap 收录 */
const isIndexablePage = (pageUrl) => {
	const { pathname } = new URL(pageUrl);
	return !nonIndexablePrefixes.some((prefix) => pathname.startsWith(prefix));
};

/**
 * 把 Markdown 正文里的一级标题降为二级（在 remark / mdast 层处理）。
 *
 * 为什么需要：文章页与功能页的 <h1> 已经由**页面标题**承担 ——
 * `pages/posts/[...slug].astro` 渲染 `<h1>{title}</h1>`，
 * `features/page-header/PageHeader.astro` 渲染各功能页标题。
 * 正文里再出现 `#` 就会让同一页出现两个可见 <h1>
 * （2026-10-10 实测：`/about/` 与 `/posts/first-blog/` 都是 2 个可见 h1）。
 *
 * 放在 remark 而不是 rehype：这样 Astro 的 `headings`（右侧目录数据）
 * 也拿到降级后的深度，目录层级与视觉一致。
 * 注册在 remarkPlugins 的**第一位**，让后面的 remarkSectionize 按新深度分节。
 *
 * 不引入依赖：只遍历 mdast 改 depth。
 */
const remarkDemoteBodyH1 = () => (tree) => {
	const walk = (node) => {
		if (node.type === "heading" && node.depth === 1) {
			node.depth = 2;
		}
		if (Array.isArray(node.children)) {
			node.children.forEach(walk);
		}
	};
	walk(tree);
};

// https://astro.build/config
export default defineConfig({
	site: siteConfig.siteURL,
	base: "/",
	trailingSlash: "always",

	output: "static",

	integrations: [
		umami({
			shareUrl: false,
		}),
		swup({
			theme: false,
			animationClass: "transition-swup-",
			containers: ["main"],
			smoothScrolling: false, // 禁用平滑滚动以提升性能，避免与锚点导航冲突
			cache: true,
			preload: false, // 禁用预加载以提升性能
			accessibility: true,
			updateHead: process.env.NODE_ENV === "production",
			updateBodyClass: false,
			globalInstance: true,
			// 滚动相关配置优化
			resolveUrl: (url) => url,
			animateHistoryBrowsing: false,
			skipPopStateHandling: (event) => {
				// 跳过锚点链接的处理，让浏览器原生处理
				return (
					event.state &&
					event.state.url &&
					event.state.url.includes("#")
				);
			},
		}),
		icon(),
		expressiveCode({
			themes: ["github-light", "github-dark"],
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: { showLineNumbers: false },
					bash: { frame: "code" },
					shell: { frame: "code" },
					sh: { frame: "code" },
					zsh: { frame: "code" },
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-bg)",
					editorTabBarBackground: "var(--codeblock-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-bg)",
					terminalTitlebarBorderBottomColor: "none",
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
			},
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		svelte({
			preprocess: vitePreprocess(),
		}),
		sitemap({
			filter: isIndexablePage,
		}),
	],
	markdown: {
		remarkPlugins: [
			// 必须放第一位：先把正文 h1 降为 h2，后面的插件按新深度处理
			remarkDemoteBodyH1,
			remarkMath,
			remarkContent,
			remarkFixGithubAdmonitions,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
			remarkMermaid,
		],
		rehypePlugins: [
			rehypeKatex,
			[
				rehypeExternalLinks,
				{
					target: "_blank",
					rel: ["nofollow", "noopener", "noreferrer"],
				},
			],
			rehypeSlug,
			rehypeWrapTable,
			rehypeMermaid,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) =>
							AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [{ type: "text", value: "#" }],
					},
				},
			],
			rehypeImageWidth,
		],
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			// 静态资源处理优化，防止小图片转 base64 导致 HTML 体积过大
			assetsInlineLimit: 4096,
			// CSS 代码分割
			cssCodeSplit: true,
			cssMinify: "esbuild",
			// 内联小型 CSS 文件以减少网络请求
			inlineStylesheets: "auto",
			// 生产环境移除 console 和 debugger
			minify: "esbuild",
			rollupOptions: {
				onwarn(warning, warn) {
					if (
						warning.message.includes(
							"is dynamically imported by",
						) &&
						warning.message.includes(
							"but also statically imported by",
						)
					) {
						return;
					}
					warn(warning);
				},
			},
		},
		// 生产环境移除 console.log 和 debugger
		esbuildOptions: {
			drop:
				process.env.NODE_ENV === "production"
					? ["console", "debugger"]
					: [],
		},
	},
});

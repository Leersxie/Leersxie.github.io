import eslint from "@eslint/js";
import astroParser from "astro-eslint-parser";
import astroPlugin from "eslint-plugin-astro";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sveltePlugin from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

const browserGlobals = {
	...globals.browser,
	console: "readonly",
	MutationObserver: "readonly",
	setTimeout: "readonly",
	clearTimeout: "readonly",
	ImageMetadata: "readonly",
	URLSearchParams: "readonly",
	requestAnimationFrame: "readonly",
	HTMLElement: "readonly",
	Element: "readonly",
	Node: "readonly",
	Event: "readonly",
	KeyboardEvent: "readonly",
	CustomEvent: "readonly",
	EventListener: "readonly",
	MediaQueryList: "readonly",
	MediaQueryListEvent: "readonly",
	sessionStorage: "readonly",
	localStorage: "readonly",
	navigator: "readonly",
	CryptoJS: "readonly",
	Fancybox: "readonly",
	twikoo: "readonly",
};

export default tseslint.config(
	// Ignores
	{
		ignores: [
			"node_modules/**",
			"dist/**",
			".astro/**",
			"public/**",
			"scripts/**",
			"tests/**",
			"demo/**",
			"**/*.html",
			"**/*.md",
			"**/*.mdx",
			// 以下文件目前仍无法被 astro-eslint-parser 解析（多为内联 <script> 中的
			// `<style>` 属性或自闭合 <Fragment /> 触发），一旦上游解析器修复即可移出本列表。
			// 详见下方 "已知缺口" 说明。
			"src/components/atoms/custom-scrollbar/CustomScrollbar.astro",
			"src/components/atoms/typewriter-text/TypewriterText.astro",
			"src/components/features/posts/CategoryBar.astro",
			"src/components/features/posts/PostPage.astro",
			"src/components/features/toc/FloatingTOC.astro",
			"src/components/features/toc/SidebarTOC.astro",
			"src/components/misc/Markdown.astro",
			"src/components/organisms/navigation/DropdownMenu.astro",
			"src/components/widgets/announcement/Announcement.astro",
			"src/components/widgets/card-toc/CardTOC.astro",
			"src/components/widgets/common/WidgetLayout.astro",
			"src/layouts/Layout.astro",
		],
	},

	// Base config
	eslint.configs.recommended,
	{
		rules: {
			"no-undef": "off",
			"no-unused-vars": "off",
			"no-unreachable": "off",
			"prefer-const": "warn",
			"no-var": "error",
			eqeqeq: "warn",
			curly: "warn",
			"no-console": "warn",
			"no-debugger": "warn",
			"no-useless-assignment": "off",
			"no-redeclare": "off",
			"no-empty-pattern": "off",
			"no-empty": "off",
			"no-useless-escape": "off",
			"preserve-caught-error": "off",
		},
	},

	// TypeScript files - disable strict rules
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
			globals: {
				...globals.browser,
				console: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				URLSearchParams: "readonly",
				requestAnimationFrame: "readonly",
			},
		},
		rules: {
			// TypeScript specific rules - most are warnings or off
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/consistent-type-imports": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/prefer-for-of": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/triple-slash-reference": "off",
			"@typescript-eslint/consistent-indexed-object-style": "off",
			"@typescript-eslint/unified-signatures": "off",
		},
	},

	// Svelte files (browser environment)
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				svelteConfig: {
					parser: "svelte-eslint-parser",
				},
			},
			globals: browserGlobals,
		},
		plugins: {
			svelte: sveltePlugin,
		},
		processor: sveltePlugin.processors.svelte,
		rules: {
			...sveltePlugin.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-expressions": "off",
		},
	},

	// Astro files (browser environment)
	{
		files: ["**/*.astro"],
		languageOptions: {
			parser: astroParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: [".svelte"],
			},
			globals: browserGlobals,
		},
		plugins: {
			astro: astroPlugin,
		},
		processor: astroPlugin.processors.astro,
		rules: {
			...astroPlugin.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/prefer-for-of": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"astro/no-deprecated-astro-fetchcontent": "off",
			"astro/no-set-html-directive": "off",
			"astro/no-unused-define-vars-in-style": "off",
		},
	},

	// Import sorting
	{
		plugins: {
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"simple-import-sort/imports": "warn",
			"simple-import-sort/exports": "warn",
		},
	},
);

/**
 * 已知缺口（ESLint 覆盖盲区）
 *
 * 上方 ignores 中列出的 12 个 .astro 文件目前无法被 astro-eslint-parser 解析，
 * 因此不参与任何规则校验，其中包含 Layout.astro、Markdown.astro 等核心文件。
 * 触发原因主要是两类写法：
 *   1. 内联 <script> 区块中带有 `style="..."` 属性的自闭合标签（解析器会误判为 <style> 元素）；
 *   2. 模板表达式中出现自闭合的 <Fragment /> 等组件。
 * 这些文件目前只能依赖 `pnpm check`（astro check）与 `pnpm build` 兜底。
 * 后续升级 eslint-plugin-astro / astro-eslint-parser 后，应逐个移出该列表并重新验证。
 */

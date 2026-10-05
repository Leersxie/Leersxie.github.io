import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/** 把 URL 转成 Vite 可用的 POSIX 路径（Windows 下反斜杠会导致 alias 失效） */
const resolve = (p: string) =>
	fileURLToPath(new URL(p, import.meta.url)).replace(/\\/g, "/");

export default defineConfig({
	resolve: {
		// 与 tsconfig.json 中的 paths 保持一致
		alias: [
			{
				find: /^@components\/(.*)$/,
				replacement: `${resolve("./src/components")}/$1`,
			},
			{
				find: /^@assets\/(.*)$/,
				replacement: `${resolve("./src/assets")}/$1`,
			},
			{
				find: /^@constants\/(.*)$/,
				replacement: `${resolve("./src/constants")}/$1`,
			},
			{
				find: /^@utils\/(.*)$/,
				replacement: `${resolve("./src/utils")}/$1`,
			},
			{
				find: /^@i18n\/(.*)$/,
				replacement: `${resolve("./src/i18n")}/$1`,
			},
			{
				find: /^@layouts\/(.*)$/,
				replacement: `${resolve("./src/layouts")}/$1`,
			},
			{
				find: /^@\/(.*)$/,
				replacement: `${resolve("./src")}/$1`,
			},
		],
	},
	test: {
		include: ["tests/**/*.test.ts"],
		environment: "node",
	},
});

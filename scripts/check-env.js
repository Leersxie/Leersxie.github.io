/**
 * 环境变量自检脚本
 *
 * 用法：pnpm check-env
 *
 * 检查 .env 中的内容分离、IndexNow、B 站相关配置是否完整可用，
 * 并给出对应的修复提示。仅做校验与提示，不修改任何文件。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnv } from "./load-env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

const results = [];

function report(level, name, message, hint) {
	results.push({ level, name, message, hint });
}

function isPlaceholder(value) {
	if (!value) {
		return true;
	}
	return /your[-_]|example\.com|username|^asdf/i.test(value);
}

loadEnv();

console.log("Mizuki 环境变量自检\n===================\n");

if (!fs.existsSync(envPath)) {
	report(
		"info",
		".env",
		"未找到 .env 文件",
		"如需使用内容分离 / IndexNow / B 站数据，请复制 .env.example 为 .env 并填写",
	);
} else {
	report("ok", ".env", "已找到 .env 文件");
}

// --- 内容分离 ---
const syncEnabled = process.env.ENABLE_CONTENT_SYNC;
const contentRepoUrl = process.env.CONTENT_REPO_URL;
const contentDir = process.env.CONTENT_DIR || "./content";

if (syncEnabled === "true") {
	if (isPlaceholder(contentRepoUrl)) {
		report(
			"error",
			"ENABLE_CONTENT_SYNC",
			"已开启内容分离，但 CONTENT_REPO_URL 未正确配置",
			"填写指向内容仓库的 Git 地址（HTTPS 或 SSH）",
		);
	} else {
		report(
			"ok",
			"CONTENT_REPO_URL",
			`内容仓库：${contentRepoUrl}`,
			`内容目录：${contentDir}`,
		);
	}
} else {
	report(
		"info",
		"ENABLE_CONTENT_SYNC",
		"未开启内容分离，将直接使用仓库内的 src/content",
		"这是默认模式，个人博客通常无需改动",
	);
}

// --- IndexNow ---
const indexnowKey = process.env.INDEXNOW_KEY;
const indexnowHost = process.env.INDEXNOW_HOST;

if (isPlaceholder(indexnowKey) || isPlaceholder(indexnowHost)) {
	report(
		"info",
		"INDEXNOW_KEY / INDEXNOW_HOST",
		"未配置或仍为示例值，pnpm submit 将无法提交 URL",
		"如需主动向搜索引擎提交，请填写真实密钥与站点域名",
	);
} else {
	report("ok", "INDEXNOW", `提交目标主机：${indexnowHost}`);
}

// --- B 站 ---
if (isPlaceholder(process.env.BILI_SESSDATA)) {
	report(
		"info",
		"BILI_SESSDATA",
		"未配置，B 站观看进度数据将无法拉取",
		"仅在 anime.mode 为 bilibili 时必需；CI 中通过仓库 Secret 注入",
	);
} else {
	report("ok", "BILI_SESSDATA", "已配置");
}

// --- 输出 ---
const icons = { ok: "✓", warn: "!", error: "✗", info: "·" };
const order = { error: 0, warn: 1, ok: 2, info: 3 };
results.sort((a, b) => order[a.level] - order[b.level]);

for (const item of results) {
	console.log(`${icons[item.level]} ${item.name}`);
	console.log(`    ${item.message}`);
	if (item.hint) {
		console.log(`    → ${item.hint}`);
	}
}

const errors = results.filter((r) => r.level === "error").length;
const warnings = results.filter((r) => r.level === "warn").length;

console.log("\n===================");
console.log(
	`共 ${results.length} 项检查：${errors} 个错误，${warnings} 个警告`,
);

process.exit(errors > 0 ? 1 : 0);

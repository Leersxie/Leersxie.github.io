/**
 * 生成站点默认分享图（OG image）
 *
 * 用途：文章没有封面图时，社交平台（Discord / 微信 / Twitter 等）抓取到的预览图。
 * 用 satori + sharp 渲染，文字准确、可重复生成，且不依赖任何外部字体服务
 * —— 字体直接读 public/assets/font/ 下的本地文件。
 *
 * 用法：pnpm generate:og
 * 产物：public/assets/og-default.png（1200×630，可直接替换成自己设计的图）
 *
 * 站点标题 / 副标题 / 域名均从 src/config.ts 读取，改配置后重跑即可同步。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import satori from "satori";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const OUT_FILE = path.join(rootDir, "public/assets/og-default.png");
const FONT_FILE = path.join(
	rootDir,
	"public/assets/font/ZenMaruGothic-Medium.ttf",
);

/** 与站点主题（hue 210）保持一致的配色 */
const COLORS = {
	bg: "#EFF3F6", // ≈ oklch(0.95 0.01 210)
	ink: "#1F2933",
	muted: "#5C6B7A",
	primary: "#4A9AD0", // ≈ oklch(0.70 0.14 210)
	line: "#CBD5DE",
};

function readSiteConfig() {
	const src = fs.readFileSync(path.join(rootDir, "src/config.ts"), "utf-8");
	const pick = (key) => {
		const m = src.match(new RegExp(`${key}:\\s*"([^"]*)"`));
		return m ? m[1] : "";
	};
	return {
		title: pick("title") || "Leersxie's Blog",
		subtitle: pick("subtitle"),
		siteURL: pick("siteURL"),
	};
}

function stripProtocol(url) {
	return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

async function main() {
	const { title, subtitle, siteURL } = readSiteConfig();

	if (!fs.existsSync(FONT_FILE)) {
		throw new Error(`字体文件不存在：${FONT_FILE}`);
	}
	const fontData = fs.readFileSync(FONT_FILE);

	const text = (style, value) => ({
		type: "div",
		props: { style: { display: "flex", ...style }, children: value },
	});

	const svg = await satori(
		{
			type: "div",
			props: {
				style: {
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					backgroundColor: COLORS.bg,
					padding: "76px 84px",
					fontFamily: "ZenMaruGothic",
				},
				children: [
					// 顶部：强调色短条
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								width: "104px",
								height: "10px",
								backgroundColor: COLORS.primary,
								borderRadius: "5px",
							},
						},
					},
					// 中部：标题 + 副标题
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
							},
							children: [
								text(
									{
										fontSize: "84px",
										lineHeight: 1.15,
										color: COLORS.ink,
										letterSpacing: "-0.01em",
									},
									title,
								),
								subtitle
									? text(
											{
												fontSize: "34px",
												lineHeight: 1.4,
												color: COLORS.muted,
												marginTop: "22px",
											},
											subtitle,
										)
									: null,
							].filter(Boolean),
						},
					},
					// 底部：分隔线 + 域名
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
							},
							children: [
								{
									type: "div",
									props: {
										style: {
											display: "flex",
											width: "100%",
											height: "2px",
											backgroundColor: COLORS.line,
											marginBottom: "24px",
										},
									},
								},
								text(
									{ fontSize: "28px", color: COLORS.muted },
									stripProtocol(siteURL),
								),
							],
						},
					},
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "ZenMaruGothic",
					data: fontData,
					weight: 500,
					style: "normal",
				},
			],
		},
	);

	const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

	fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
	fs.writeFileSync(OUT_FILE, png);

	console.log("✓ 已生成默认分享图");
	console.log(`  标题：${title}`);
	console.log(`  副标题：${subtitle}`);
	console.log(`  域名：${stripProtocol(siteURL)}`);
	console.log(
		`  输出：${path.relative(rootDir, OUT_FILE)}（${(png.length / 1024).toFixed(1)} KB，1200×630）`,
	);
}

main().catch((err) => {
	console.error("生成默认分享图失败：", err);
	process.exit(1);
});

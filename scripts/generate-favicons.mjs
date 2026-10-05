/**
 * 从一张源图生成完整的站点图标集
 *
 * 用法：pnpm generate:icons
 * 源图：design/icon-source.png（放任意正方形或横版 PNG，带透明底最好）
 * 产物：public/favicon/
 *   favicon.ico               16 / 32 / 48 三尺寸（内嵌 PNG）
 *   favicon-16x16.png
 *   favicon-32x32.png
 *   favicon-48x48.png
 *   apple-touch-icon.png      180×180，白底（iOS 会把透明渲染成黑色，故必须铺底）
 *   android-chrome-192x192.png
 *   android-chrome-512x512.png
 *   manifest.json
 *
 * 说明：
 * - 会先按透明边界裁掉多余留白，再补成正方形，使图形在图标里占比一致（约 86%），
 *   否则横版字标直接塞进正方形会显得又小又偏。
 * - 小尺寸采用阶梯式降采样，减少一次性缩小带来的糊边。
 * - 换新图标：把新图覆盖到 design/icon-source.png 后重跑即可。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const SOURCE = path.join(rootDir, "design/icon-source.png");
const OUT_DIR = path.join(rootDir, "public/favicon");

/** 图形在正方形画布里的占比；太小会显小，太大会贴边 */
const CONTENT_RATIO = 0.86;
/** apple-touch-icon 的底色（iOS 不支持透明） */
const TOUCH_BG = "#FFFFFF";

/**
 * 可选：给图标铺一层圆角浅色底。
 * 背景色通过 `--bg=#F5F3FB` 传入；不传则保持透明。
 *
 * 为什么需要这个选项：本项目图标里有一个深墨蓝的 "X"，
 * 在浏览器深色标签栏上几乎看不见（实测预览可复现）。
 * 铺浅色圆角底后可同时适配明暗两种标签栏，代价是图标变成「应用图标」样式。
 */
const bgArg = process.argv.find((a) => a.startsWith("--bg="));
const BG_COLOR = bgArg ? bgArg.slice("--bg=".length) : null;
/** 圆角半径占画布比例；取 12% 时不会裁到 86% 占比的图形 */
const BG_RADIUS_RATIO = 0.12;

function readSiteConfig() {
	const src = fs.readFileSync(path.join(rootDir, "src/config.ts"), "utf-8");
	const pick = (key) => {
		const m = src.match(new RegExp(`${key}:\\s*"([^"]*)"`));
		return m ? m[1] : "";
	};
	return {
		title: pick("title") || "Blog",
		navbarText: (() => {
			const m = src.match(/navbarTitle:\s*\{[\s\S]*?text:\s*"([^"]*)"/);
			return m ? m[1] : "";
		})(),
	};
}

/**
 * 组装 ICO 容器。
 * Vista 之后 ICO 允许直接内嵌 PNG，因此无需引入额外依赖。
 */
function buildIco(images) {
	const count = images.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type = icon
	header.writeUInt16LE(count, 4);

	const entries = Buffer.alloc(16 * count);
	let offset = 6 + 16 * count;

	images.forEach((img, i) => {
		const e = 16 * i;
		const dim = img.size >= 256 ? 0 : img.size; // 0 表示 256
		entries.writeUInt8(dim, e + 0);
		entries.writeUInt8(dim, e + 1);
		entries.writeUInt8(0, e + 2); // 调色板数
		entries.writeUInt8(0, e + 3); // 保留
		entries.writeUInt16LE(1, e + 4); // color planes
		entries.writeUInt16LE(32, e + 6); // bits per pixel
		entries.writeUInt32LE(img.data.length, e + 8);
		entries.writeUInt32LE(offset, e + 12);
		offset += img.data.length;
	});

	return Buffer.concat([header, entries, ...images.map((i) => i.data)]);
}

/** 阶梯式降采样：逐级减半到目标的 2~4 倍，再最终缩放，减少糊边 */
async function resizeStepped(buffer, fromSize, toSize) {
	let current = buffer;
	let size = fromSize;
	while (size > toSize * 2) {
		size = Math.max(toSize * 2, Math.round(size / 2));
		current = await sharp(current).resize(size, size).png().toBuffer();
	}
	return sharp(current).resize(toSize, toSize).png().toBuffer();
}

async function main() {
	if (!fs.existsSync(SOURCE)) {
		throw new Error(
			`找不到源图：${path.relative(rootDir, SOURCE)}\n请把图标放到该路径后重跑。`,
		);
	}

	fs.mkdirSync(OUT_DIR, { recursive: true });

	// 1) 裁掉透明留白
	const trimmed = await sharp(SOURCE)
		.trim({ threshold: 1 })
		.toBuffer({ resolveWithObject: true });
	const { width: cw, height: ch } = trimmed.info;

	// 2) 补成正方形，并留出边距
	const side = Math.ceil(Math.max(cw, ch) / CONTENT_RATIO);
	const square = await sharp({
		create: {
			width: side,
			height: side,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite([
			{
				input: trimmed.data,
				left: Math.round((side - cw) / 2),
				top: Math.round((side - ch) / 2),
			},
		])
		.png()
		.toBuffer();

	console.log(`源图内容 ${cw}×${ch} → 正方形画布 ${side}×${side}`);

	// 2.5) 可选：铺圆角浅色底（图形占比 86%，圆角 12%，不会裁到图形）
	let base = square;
	if (BG_COLOR) {
		const r = Math.round(side * BG_RADIUS_RATIO);
		const bgSvg = Buffer.from(
			`<svg width="${side}" height="${side}" xmlns="http://www.w3.org/2000/svg">` +
				`<rect width="${side}" height="${side}" rx="${r}" ry="${r}" fill="${BG_COLOR}"/></svg>`,
		);
		base = await sharp(bgSvg)
			.composite([{ input: square, left: 0, top: 0 }])
			.png()
			.toBuffer();
		console.log(`  · 已铺圆角底色 ${BG_COLOR}（半径 ${r}px）`);
	}
	// 3) 输出各尺寸 PNG
	const pngSizes = [16, 32, 48];
	const pngs = {};
	for (const size of pngSizes) {
		pngs[size] = await resizeStepped(base, side, size);
		fs.writeFileSync(path.join(OUT_DIR, `favicon-${size}x${size}.png`), pngs[size]);
		console.log(`  ✓ favicon-${size}x${size}.png`);
	}

	// 4) ICO（内嵌 16/32/48 的 PNG）
	const ico = buildIco(pngSizes.map((size) => ({ size, data: pngs[size] })));
	fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), ico);
	console.log(`  ✓ favicon.ico（含 ${pngSizes.join("/")}）`);

	// 5) apple-touch-icon：必须铺底，iOS 会把透明渲染成黑
	const touch = await sharp(base)
		.resize(180, 180)
		.flatten({ background: TOUCH_BG })
		.png()
		.toBuffer();
	fs.writeFileSync(path.join(OUT_DIR, "apple-touch-icon.png"), touch);
	console.log("  ✓ apple-touch-icon.png（180×180，白底）");

	// 6) Android / PWA 用的大图
	for (const size of [192, 512]) {
		const buf = await resizeStepped(base, side, size);
		fs.writeFileSync(path.join(OUT_DIR, `android-chrome-${size}x${size}.png`), buf);
		console.log(`  ✓ android-chrome-${size}x${size}.png`);
	}

	// 7) webmanifest
	const { title, navbarText } = readSiteConfig();
	const manifest = {
		name: title,
		short_name: navbarText || title,
		icons: [192, 512].map((size) => ({
			src: `/favicon/android-chrome-${size}x${size}.png`,
			sizes: `${size}x${size}`,
			type: "image/png",
		})),
		display: "standalone",
	};
	fs.writeFileSync(
		path.join(OUT_DIR, "manifest.json"),
		`${JSON.stringify(manifest, null, "\t")}\n`,
	);
	console.log("  ✓ manifest.json");

	console.log(`\n全部输出到 ${path.relative(rootDir, OUT_DIR)}/`);
	console.log(
		"提示：图标清单在 src/config.ts 的 siteConfig.favicon 里维护；换图后记得重新构建。",
	);
}

main().catch((err) => {
	console.error("生成图标失败：", err.message);
	process.exit(1);
});

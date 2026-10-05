/**
 * 横幅图片一次性优化脚本
 *
 * 背景：
 *   public/ 目录下的文件在构建时被原样拷贝到 dist/，不经过 astro:assets 的压缩管线。
 *   站内两张横幅（mobile-banner/1.webp 约 7.9MB、desktop-banner/5.webp 约 3.9MB）
 *   分辨率远超实际展示尺寸，会直接拖累移动端 LCP。
 *
 * 用法：
 *   pnpm optimize:images          # 实际执行（原地覆盖，原文件可从 git 历史恢复）
 *   pnpm optimize:images --dry    # 仅报告，不写盘
 *
 * 说明：
 *   - 仅在「新文件更小」时才覆盖，避免画质与体积双输。
 *   - 不改变文件名，因此无需同步修改任何引用。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DRY_RUN = process.argv.includes("--dry");

/** 待优化目录及目标参数 */
const TARGETS = [
	// 桌面横幅为全宽展示，3200px 可覆盖高分屏（DPR 2 下的常见窗口宽度）
	{ dir: "public/assets/desktop-banner", maxWidth: 3200, quality: 82 },
	// 移动端 CSS 宽度通常不超过 430px，1280px 已有约 3 倍余量
	{ dir: "public/assets/mobile-banner", maxWidth: 1280, quality: 80 },
	{ dir: "public/assets/home", maxWidth: 1600, quality: 85 },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function formatSize(bytes) {
	return bytes >= 1024 * 1024 ? mb(bytes) : kb(bytes);
}

async function listImages(dir) {
	if (!fs.existsSync(dir)) {
		return [];
	}
	return fs
		.readdirSync(dir)
		.filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
		.map((f) => path.join(dir, f));
}

async function main() {
	let savedTotal = 0;
	let changed = 0;

	for (const target of TARGETS) {
		const absDir = path.join(rootDir, target.dir);
		const files = await listImages(absDir);

		if (files.length === 0) {
			console.log(`\n跳过（目录不存在或没有图片）：${target.dir}`);
			continue;
		}

		console.log(`\n=== ${target.dir} ===`);

		for (const file of files) {
			const originalSize = fs.statSync(file).size;

			try {
				// 先把源文件读入内存，避免 sharp 持有文件句柄导致后续写入被占用
				const inputBuffer = fs.readFileSync(file);
				const meta = await sharp(inputBuffer, {
					animated: true,
				}).metadata();

				const needResize = meta.width && meta.width > target.maxWidth;
				const pipeline = sharp(inputBuffer, { animated: true });
				if (needResize) {
					pipeline.resize({
						width: target.maxWidth,
						withoutEnlargement: true,
					});
				}

				const ext = path.extname(file).toLowerCase();
				if (ext === ".webp") {
					pipeline.webp({
						quality: target.quality,
						effort: 5,
					});
				} else if (ext === ".png") {
					pipeline.png({
						quality: target.quality,
						compressionLevel: 9,
						palette: true,
					});
				} else {
					pipeline.jpeg({
						quality: target.quality,
						mozjpeg: true,
					});
				}

				const buffer = await pipeline.toBuffer();
				// 显式释放 sharp 内部缓存，尽快释放文件句柄
				pipeline.destroy();
				const name = path.basename(file);

				if (buffer.length >= originalSize) {
					console.log(
						`  · ${name}  ${formatSize(originalSize)} → 已是最优，跳过`,
					);
					continue;
				}

				if (!DRY_RUN) {
					// 先写临时文件再原子替换，避免写入过程中被其他进程（杀软等）占用
					const tmpFile = `${file}.tmp`;
					fs.writeFileSync(tmpFile, buffer);
					fs.renameSync(tmpFile, file);
				}

				const reduction = (
					(1 - buffer.length / originalSize) *
					100
				).toFixed(1);

				console.log(
					`  ${DRY_RUN ? "·" : "✓"} ${name}  ${meta.width}x${meta.height}${needResize ? ` → ${target.maxWidth}px` : ""}  ${formatSize(originalSize)} → ${formatSize(buffer.length)}  (-${reduction}%)`,
				);

				savedTotal += originalSize - buffer.length;
				changed++;
			} catch (error) {
				console.log(
					`  ⚠ ${path.basename(file)} 处理失败：${error.message}`,
				);
			}
		}
	}

	console.log("\n=== 汇总 ===");
	if (changed === 0) {
		console.log("没有需要优化的图片。");
		return;
	}
	console.log(
		`${DRY_RUN ? "预计" : "实际"}优化 ${changed} 个文件，${DRY_RUN ? "可" : ""}节省 ${formatSize(savedTotal)}`,
	);
	if (DRY_RUN) {
		console.log("（当前为 --dry 模式，未写入磁盘）");
	}
}

main().catch((error) => {
	console.error("图片优化脚本执行失败：", error);
	process.exit(1);
});

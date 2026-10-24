/**
 * 字体子集化（prebuild）：source-assets/fonts/*.ttf|otf → public/fonts/*.woff2
 * 内核 subset-font（harfbuzzjs）：支持 CFF / 可变字体，直接输出 woff2。
 * 中文字符集 = 扫描 content/ + app|components|lib 源码字符串 + 常用标点。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(root, "source-assets", "fonts");
const outDir = path.join(root, "public", "fonts");

const ASCII =
	" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

function collectCjkText() {
	const chars = new Set(ASCII + "0123456789");
	const common =
		"，。！？；：、·—…（）【】《》「」『』“”‘’～￥％＋＝｜　";
	for (const c of common) chars.add(c);

	const roots = ["content", "app", "components", "lib"].map((d) =>
		path.join(root, d),
	);
	const walk = (dir) => {
		if (!fs.existsSync(dir)) return;
		for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, f.name);
			if (f.isDirectory()) walk(p);
			else if (/\.(md|tsx?|ts)$/.test(f.name)) {
				const content = fs.readFileSync(p, "utf8");
				for (const ch of content) chars.add(ch);
			}
		}
	};
	roots.forEach(walk);
	return [...chars].join("");
}

const JOBS = [
	{
		src: "NotoSansSC-Regular.otf",
		out: "NotoSansSC-Regular.woff2",
		family: "cjk",
	},
	{
		src: "instrument-sans-v4-latin-regular.ttf",
		out: "InstrumentSans-Regular.woff2",
		family: "latin",
	},
	{
		src: "instrument-sans-v4-latin-600.ttf",
		out: "InstrumentSans-SemiBold.woff2",
		family: "latin",
	},
	{
		src: "jost-v20-latin-regular.ttf",
		out: "Jost-Regular.woff2",
		family: "latin",
	},
	{
		src: "JetBrainsMono-Regular.ttf",
		out: "JetBrainsMono-Regular.woff2",
		family: "mono",
	},
];

async function main() {
	fs.mkdirSync(outDir, { recursive: true });
	const cjkText = collectCjkText();
	for (const job of JOBS) {
		const src = path.join(srcDir, job.src);
		const dest = path.join(outDir, job.out);
		if (!fs.existsSync(src)) {
			console.warn(`⚠ 缺少字体源文件：${job.src}（跳过）`);
			continue;
		}
		if (
			fs.existsSync(dest) &&
			fs.statSync(dest).mtimeMs > fs.statSync(src).mtimeMs
		) {
			console.log(`✓ ${job.out} 已是最新，跳过`);
			continue;
		}
		const text = job.family === "cjk" ? cjkText : ASCII;
		const buf = await subsetFont(fs.readFileSync(src), text, {
			targetFormat: "woff2",
		});
		fs.writeFileSync(dest, buf);
		console.log(
			`✓ ${job.src} → ${job.out} (${(buf.length / 1024).toFixed(1)} KB)`,
		);
	}
}

main().catch((e) => {
	// 字体子集化失败不阻断构建：@font-face 拉不到就回退系统字体
	console.warn(`⚠ 字体子集化失败（非致命）：${e.message}`);
});

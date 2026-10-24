/**
 * postbuild 校验：确认静态导出产物完整（out/ 存在、关键页面/资源就位）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "out");

const mustExist = [
	"index.html",
	"posts/guestbook/index.html",
	"guestbook/index.html",
	"archive/index.html",
	"rss.xml",
	"sitemap.xml",
	"fonts/NotoSansSC-Regular.woff2",
	"fonts/SpaceGrotesk.woff2",
	"fonts/JetBrainsMono-Regular.woff2",
];

const missing = mustExist.filter((f) => !fs.existsSync(path.join(out, f)));
if (missing.length > 0) {
	console.error(`✗ 静态导出不完整，缺少：\n  - ${missing.join("\n  - ")}`);
	process.exit(1);
}
console.log(
	`✓ 静态导出完整（out/，${fs
		.readdirSync(out)
		.length} 个顶层条目，关键页面与字体就位）`,
);

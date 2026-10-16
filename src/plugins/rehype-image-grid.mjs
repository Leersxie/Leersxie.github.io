import { h } from "hastscript";
import { visit } from "unist-util-visit";

/**
 * 连续图片自动网格。
 *
 * 「独占一段的图片」在正文里会各自占满一行、上下留白很大；把**连续多张**这样的
 * 图片收进一个 `.image-grid` 容器，交给 CSS 排成等宽网格。
 *
 * 规则：
 * - 段落（p）里只有图片（可含空白文本）才参与，段落里夹着文字的一概不动；
 * - **连续**（相邻兄弟节点）的图片段落合并成一个网格；
 * - 单张图片段落保持原样（大图展示）；
 * - 显式写了 grid 指令或图片宽度属性的场景不受影响。
 *
 * 样式在 src/styles/markdown-extend.styl 的 `.image-grid` 下。
 */

/** 段落是否「只由图片组成」（允许空白文本节点） */
function isImageOnlyParagraph(node) {
	if (node.type !== "element" || node.tagName !== "p") {return false;}
	let images = 0;
	for (const child of node.children) {
		if (child.type === "text") {
			if (child.value.trim() !== "") {return false;}
			continue;
		}
		if (child.type === "element" && child.tagName === "img") {
			images += 1;
			continue;
		}
		// 图片被 <a> 包住（灯箱）也算
		if (
			child.type === "element" &&
			child.tagName === "a" &&
			child.children?.length === 1 &&
			child.children[0].type === "element" &&
			child.children[0].tagName === "img"
		) {
			images += 1;
			continue;
		}
		return false;
	}
	return images > 0 ? images : false;
}

export function rehypeImageGrid() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (!parent || index === undefined) {return;}
			if (!Array.isArray(node.children)) {return;}

			const count = isImageOnlyParagraph(node);
			if (!count) {return;}

			// 向前看：把紧随其后的图片段落一起收进来
			const group = [node];
			let cursor = index + 1;
			while (cursor < parent.children.length) {
				const next = parent.children[cursor];
				if (next.type === "element" && next.tagName === "p") {
					const nextCount = isImageOnlyParagraph(next);
					if (nextCount) {
						group.push(next);
						cursor += 1;
						continue;
					}
				}
				break;
			}

			// 只有一张图就不动它（单独大图更好看）
			const totalImages = group.reduce(
				(sum, p) => sum + isImageOnlyParagraph(p),
				0,
			);
			if (totalImages < 2) {return;}

			const grid = h(
				"div",
				{ class: "image-grid", "data-count": String(totalImages) },
				group.flatMap((p) => p.children),
			);

			parent.children.splice(index, group.length, grid);
			// 跳过刚插入的节点，避免重复处理
			return index + 1;
		});
	};
}

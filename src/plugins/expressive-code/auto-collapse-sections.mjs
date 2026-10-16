import { definePlugin } from "@expressive-code/core";

/**
 * Expressive Code 插件：长代码块按行数自动折叠。
 *
 * 复用仓库里已装的 @expressive-code/plugin-collapsible-sections，不自己造折叠 UI：
 * 本插件只负责给超长代码块补上 `collapse` 属性（等价于手写 ```js collapse=13-41），
 * 折叠交互、无障碍播报、样式全由官方插件提供。
 *
 * ⚠️ 两个必须遵守的点（实测踩出来的）：
 * 1. 钩子必须是 **preprocessMetadata**，不能用 preprocessCode ——
 *    collapsible-sections 在它自己的 preprocessMetadata 里就读取 props.collapse
 *    并据此切分段落了（钩子顺序 preprocessMetadata → preprocessCode → …），
 *    写晚了完全不生效（构建不报错，但什么都不折叠）。
 * 2. 本插件在 expressiveCode({ plugins: [...] }) 中要排在 pluginCollapsibleSections **之前**，
 *    同一钩子内按插件数组顺序执行。
 *
 * 作者手写的 `collapse=…` 不会被覆盖。
 */

/** 超过这个行数才自动折叠 */
const AUTO_COLLAPSE_MIN_LINES = 30;
/** 折叠后仍可见的预览行数 */
const AUTO_COLLAPSE_PREVIEW_LINES = 12;

export function pluginAutoCollapseSections() {
	return definePlugin({
		name: "Auto collapse sections",
		hooks: {
			preprocessMetadata: ({ codeBlock }) => {
				// 作者显式写了 collapse，尊重作者
				let authorRanges = [];
				try {
					authorRanges = codeBlock.metaOptions.getRanges("collapse") ?? [];
				} catch {
					authorRanges = [];
				}
				if (authorRanges.length > 0 || codeBlock.props?.collapse) {return;}

				const lineCount = codeBlock.getLines().length;
				if (lineCount <= AUTO_COLLAPSE_MIN_LINES) {return;}

				codeBlock.props.collapse = `${AUTO_COLLAPSE_PREVIEW_LINES + 1}-${lineCount}`;
			},
		},
	});
}

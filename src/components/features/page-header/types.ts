export interface PageHeaderProps {
	title: string;
	subtitle?: string;
	/**
	 * 标题上方的小标签（大写、宽字距，前面带一道短横线）。
	 * 与首页 Banner 的 eyebrow 是同一套视觉语言；不传则只渲染「标题 + 细线」。
	 */
	eyebrow?: string;
	class?: string;
}

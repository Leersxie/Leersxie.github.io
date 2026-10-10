export interface SectionTitleProps {
	title: string;
	/**
	 * 标题上方的小标签（大写、宽字距，前面带一道短横线）。
	 * 不传则只渲染「标题 + 细线」，与旧版观感兼容。
	 */
	eyebrow?: string;
	count?: number;
	icon?: string;
	class?: string;
}

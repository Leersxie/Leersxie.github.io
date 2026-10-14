/**
 * 卡片聚光（.spotlight-card）：指针移动时在卡片上更新 --spotlight-x/y，
 * 由 motion.css 的 ::before 径向渐变渲染光斑。
 *
 * 与 card-tilt.ts 同思路：document 级事件委托，Swup 换页替换卡片后依然生效，
 * rAF 节流；仅精细指针设备启用（触屏不介入）。
 * 比 .tilt-card 轻：只写两个 CSS 变量，不做 transform —— 文章列表卡片密集，
 * 3D 倾斜会引入布局抖动，这里只要「温度」。
 */

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (finePointer.matches) {
	let rafId: number | null = null;
	let lastEvent: PointerEvent | null = null;

	function applySpotlight(): void {
		rafId = null;
		const event = lastEvent;
		if (!event) {return;}
		const target = event.target as HTMLElement | null;
		const card = target?.closest?.(".spotlight-card");
		if (card instanceof HTMLElement) {
			const rect = card.getBoundingClientRect();
			card.style.setProperty(
				"--spotlight-x",
				`${Math.round(event.clientX - rect.left)}px`,
			);
			card.style.setProperty(
				"--spotlight-y",
				`${Math.round(event.clientY - rect.top)}px`,
			);
		}
	}

	document.addEventListener("pointermove", (event: PointerEvent) => {
		lastEvent = event;
		if (rafId === null) {
			rafId = requestAnimationFrame(applySpotlight);
		}
	});
}

/**
 * 磁性按钮（`[data-magnetic]`）：指针靠近时元素轻微朝指针偏移，移开归位。
 *
 * 关键实现选择：**写 `translate` 变量、不用 `transform`**。
 * 悬浮控件自身的显隐动画用的是 `transform`（`translateY/scale`），
 * 两者若都走 `transform` 会互相覆盖（本项目踩过「CSS 动画把 transform 锁死」的坑）。
 * CSS 的独立 `translate` 属性与 `transform` 叠加生效，互不干扰。
 *
 * 仅精细指针设备；`prefers-reduced-motion` 下完全不介入。
 */

// 纯副作用模块：显式 export 让它成为模块，避免与其他副作用脚本的顶层声明冲突
export {};

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (finePointer.matches && !reducedMotion.matches) {
	/** 触发半径（px） */
	const RADIUS = 72;
	/** 跟随强度（0-1，越小越含蓄） */
	const STRENGTH = 0.28;
	/** 最大位移（px） */
	const MAX_OFFSET = 6;

	let rafId: number | null = null;
	let pointerX = 0;
	let pointerY = 0;

	function reset(element: HTMLElement): void {
		if (element.style.getPropertyValue("--magnetic-x")) {
			element.style.setProperty("--magnetic-x", "0px");
			element.style.setProperty("--magnetic-y", "0px");
		}
	}

	function apply(): void {
		rafId = null;
		const elements = document.querySelectorAll<HTMLElement>("[data-magnetic]");

		for (const element of elements) {
			const rect = element.getBoundingClientRect();
			// 隐藏/收起的控件（尺寸为 0）不参与
			if (rect.width === 0 && rect.height === 0) {continue;}

			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const dx = pointerX - centerX;
			const dy = pointerY - centerY;
			const distance = Math.hypot(dx, dy);

			if (distance > RADIUS) {
				reset(element);
				continue;
			}

			// 越近越强（线性衰减），并夹在最大位移内
			const falloff = 1 - distance / RADIUS;
			const offsetX = Math.max(
				-MAX_OFFSET,
				Math.min(MAX_OFFSET, dx * STRENGTH * falloff),
			);
			const offsetY = Math.max(
				-MAX_OFFSET,
				Math.min(MAX_OFFSET, dy * STRENGTH * falloff),
			);

			element.style.setProperty("--magnetic-x", `${offsetX.toFixed(2)}px`);
			element.style.setProperty("--magnetic-y", `${offsetY.toFixed(2)}px`);
		}
	}

	document.addEventListener("pointermove", (event: PointerEvent) => {
		pointerX = event.clientX;
		pointerY = event.clientY;
		if (rafId === null) {
			rafId = requestAnimationFrame(apply);
		}
	});

	// 指针离开文档（去浏览器 UI、切标签）时归位，避免残留偏移
	document.addEventListener("pointerleave", () => {
		for (const element of document.querySelectorAll<HTMLElement>(
			"[data-magnetic]",
		)) {
			reset(element);
		}
	});
}

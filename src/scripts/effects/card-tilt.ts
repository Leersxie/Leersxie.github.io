/**
 * 卡片 3D 倾斜跟随。
 *
 * 通过在 document 上做事件委托实现，而不是给每张卡片单独绑监听 ——
 * Swup 换页会替换卡片节点，委托的监听器挂在 document 上天然存活。
 *
 * 只写入 CSS 变量（--tilt-x / --tilt-y / --tilt-ox / --tilt-oy / --tilt-px / --tilt-py），
 * transform 的合成交给 motion.css 里的 .tilt-card —— 这样 CSS 关闭或 JS 未加载时，
 * 卡片会退回静止态而不会错位。
 *
 * 刻意不做的事：
 * - 不绑 touch/pen：移动端没有 hover，倾斜只会晃。
 * - 幅度限制在 ±6°：再大卡片边缘会明显变形，文字开始发虚。
 * - 不覆盖卡片的 transition：跟随期间只关 transform 过渡（.is-tilting），
 *   否则会有明显滞后感。
 */

const SELECTOR = ".tilt-card";
const MAX_DEG = 6;

let current: HTMLElement | null = null;
let raf = 0;
let pending: { card: HTMLElement; x: number; y: number } | null = null;

function reset(card: HTMLElement | null): void {
	if (!card) {
		return;
	}
	card.classList.remove("is-tilting");
	for (const prop of [
		"--tilt-x",
		"--tilt-y",
		"--tilt-ox",
		"--tilt-oy",
		"--tilt-px",
		"--tilt-py",
	]) {
		card.style.removeProperty(prop);
	}
}

function flush(): void {
	raf = 0;
	const p = pending;
	pending = null;
	if (!p) {
		return;
	}
	const { card, x, y } = p;
	const rect = card.getBoundingClientRect();
	if (!rect.width || !rect.height) {
		return;
	}
	// 指针在卡片内的归一化位置：0~1
	const fx = (x - rect.left) / rect.width;
	const fy = (y - rect.top) / rect.height;

	card.style.setProperty("--tilt-px", `${(fx * 100).toFixed(2)}%`);
	card.style.setProperty("--tilt-py", `${(fy * 100).toFixed(2)}%`);
	card.style.setProperty("--tilt-y", `${((fx - 0.5) * 2 * MAX_DEG).toFixed(3)}deg`);
	card.style.setProperty("--tilt-x", `${(-(fy - 0.5) * 2 * MAX_DEG).toFixed(3)}deg`);
	// transform-origin 跟着指针走，旋转手感最自然
	card.style.setProperty("--tilt-ox", `${(fx * 100).toFixed(2)}%`);
	card.style.setProperty("--tilt-oy", `${(fy * 100).toFixed(2)}%`);
	card.classList.add("is-tilting");
}

function boot(): void {
	// 触屏 / 无悬停能力：完全不启用
	if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
		return;
	}
	if (document.documentElement.dataset.tiltBound === "1") {
		return;
	}
	document.documentElement.dataset.tiltBound = "1";

	document.addEventListener("pointermove", (e) => {
		if (e.pointerType !== "mouse") {
			return;
		}
		const target = e.target as HTMLElement | null;
		const card =
			target && typeof target.closest === "function"
				? (target.closest(SELECTOR) as HTMLElement | null)
				: null;

		if (card !== current) {
			reset(current);
			current = card;
		}
		if (!card) {
			return;
		}
		pending = { card, x: e.clientX, y: e.clientY };
		if (!raf) {
			raf = requestAnimationFrame(flush);
		}
	});

	// 指针移出窗口 / 窗口失焦时复位，否则卡片会一直斜着
	document.addEventListener("pointerleave", () => {
		reset(current);
		current = null;
	});
	window.addEventListener("blur", () => {
		reset(current);
		current = null;
	});
}

if (document.readyState === "complete") {
	boot();
} else {
	document.addEventListener("DOMContentLoaded", boot, { once: true });
}

// 声明为模块，避免 boot() 污染全局作用域与其他脚本重名
export {};
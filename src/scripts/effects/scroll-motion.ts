/**
 * 滚动触发动效模块（anime.js v4）
 *
 * 职责：
 *  1. 列表项 / 卡片进入视口时错峰浮现
 *     —— 解决原有的问题：错峰动画只在「首屏加载」那一刻播一次，
 *        视口外的条目早已播完，滚动下去完全没有变化。
 *  2. 站点统计数字进入视口时从 0 滚到目标值。
 *
 * 实现取舍：
 *  - 动画与 stagger 用 anime.js；滚动检测用原生 IntersectionObserver，
 *    以便 disconnect() 时能确定性回收（换页不泄漏）。
 *  - 仅接管「初始化时位于视口外」的元素：视口内的元素保留原有 CSS 首屏动画，
 *    避免同一元素被 CSS 与 JS 同时驱动产生闪烁。
 *  - 接管时用内联 animation:none 解掉 CSS 动画、临时关闭 transition
 *    （该元素自身带 `transition: all .4s`，不关闭会与逐帧内联样式互相拉扯），
 *    动画结束后再恢复。
 *  - prefers-reduced-motion 下整体跳过，保持原有静态呈现。
 */

import { animate, stagger } from "animejs";

/** 列表项与卡片：文章列表容器子元素 + 显式标记的元素 */
const REVEAL_SELECTOR = "#post-list-container > *, [data-reveal]";
/** 数字滚动目标 */
const COUNTUP_SELECTOR = "[data-countup], [data-countup-dyn]";

/** 元素露出约 72px 后再触发，避免贴着底边就开始动 */
const REVEAL_OPTIONS: IntersectionObserverInit = {
	rootMargin: "0px 0px -72px 0px",
	threshold: 0,
};

const COUNTUP_OPTIONS: IntersectionObserverInit = {
	rootMargin: "0px 0px -60px 0px",
	threshold: 0,
};

let revealObserver: IntersectionObserver | null = null;
let countObserver: IntersectionObserver | null = null;

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 是否位于初始视口下方（视口内的交给 CSS 首屏动画） */
function isBelowFold(el: HTMLElement): boolean {
	return el.getBoundingClientRect().top > window.innerHeight * 0.85;
}

/** 是否已真正参与渲染（display:none 的隐藏副本返回 false） */
function isRendered(el: HTMLElement): boolean {
	return el.getClientRects().length > 0;
}

/** 从 CSS 手中接管元素的初始状态 */
function takeOver(el: HTMLElement): void {
	el.style.animation = "none";
	el.classList.remove("onload-animation");
	el.dataset.revealTransition = el.style.transition;
	el.style.transition = "none";
	el.style.opacity = "0";
	el.style.transform = "translateY(24px)";
}

function restoreTransition(el: HTMLElement): void {
	el.style.transition = el.dataset.revealTransition ?? "";
	delete el.dataset.revealTransition;

	// 只清 transform / will-change，把形变控制权交回 CSS。
	// 必须保留 opacity 与 animation 的内联值：#post-list-container > *
	// 的静态规则是 opacity:0 + animation 填充到 1，一旦交还给 CSS 就会重新变透明。
	// 而内联 transform 会永久压制 active:scale-* 之类的交互形变，故需清除。
	el.style.transform = "";
	el.style.willChange = "";
}

function setupReveal(): void {
	const targets = Array.from(
		document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
	).filter((el) => !el.dataset.revealBound && isBelowFold(el));

	if (targets.length === 0) {
		return;
	}

	revealObserver = new IntersectionObserver((entries, observer) => {
		const entering = entries
			.filter((entry) => entry.isIntersecting)
			.map((entry) => entry.target as HTMLElement);

		if (entering.length === 0) {
			return;
		}

		entering.forEach((el) => observer.unobserve(el));

		animate(entering, {
			opacity: [0, 1],
			y: [24, 0],
			duration: 620,
			ease: "out(3)",
			delay: stagger(70),
			onComplete: () => entering.forEach(restoreTransition),
		});
	}, REVEAL_OPTIONS);

	targets.forEach((el) => {
		el.dataset.revealBound = "1";
		takeOver(el);
		revealObserver?.observe(el);
	});
}

function setupCountUp(): void {
	const targets = Array.from(
		document.querySelectorAll<HTMLElement>(COUNTUP_SELECTOR),
	).filter((el) => {
		if (el.dataset.countupBound) {
			return false;
		}
		return true;
	});

	if (targets.length === 0) {
		return;
	}

	countObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}

			const el = entry.target as HTMLElement;
			observer.unobserve(el);

			// 动态项（站点统计里的「运行时长」「最后更新」）的值是页面脚本在运行时
			// 算出来写进 textContent 的，没有 data-countup。
			// IntersectionObserver 的回调必然晚于该脚本执行，所以这里直接读 textContent
			// 就是准的 —— 前提是初始化时没有把它的文本清零（见下方 targets.forEach）。
			const isDynamic = el.dataset.countup === undefined;
			const target = isDynamic
				? Number(el.textContent)
				: Number(el.dataset.countup);
			if (!Number.isFinite(target) || target <= 0) {
				return;
			}

			// 归零放在真正开始计数之前：隐藏副本（如抽屉里的同一组件）
			// 在初始化时不会被归零，只有真正进入视口走上台前才从 0 开始。
			el.textContent = "0";

			const counter = { value: 0 };
			animate(counter, {
				value: target,
				duration: 1100,
				ease: "out(4)",
				onUpdate: () => {
					el.textContent = Math.round(counter.value).toLocaleString();
				},
			});
		});
	}, COUNTUP_OPTIONS);

	targets.forEach((el) => {
		el.dataset.countupBound = "1";
		// 已渲染的（视口内或视口下方）先归零：此刻站点统计卡片多处于
		// onload 淡入的起始阶段，归零与淡入同步，视觉上不构成跳变。
		// 未渲染的隐藏副本保持原始数值，等它真正出现时再开始计数。
		// 动态项例外：它的目标值就写在 textContent 里，归零等于把目标抹掉。
		if (el.dataset.countup !== undefined && isRendered(el)) {
			el.textContent = "0";
		}
		countObserver?.observe(el);
	});
}

/** 断开上一轮的观察器（换页 / 重复初始化时调用） */
export function cleanupScrollMotion(): void {
	revealObserver?.disconnect();
	countObserver?.disconnect();
	revealObserver = null;
	countObserver = null;
}

/**
 * 初始化滚动动效。
 *
 * 幂等：重复调用时，已绑定的元素会被 `data-*-bound` 标记跳过，观察器保持存活，
 * 因此首屏初始化与 Swup 首次 `page:view` 同时触发也不会互相破坏。
 * 换页时的回收由 `cleanupScrollMotion()`（挂在 visit:start）负责。
 */
export function initScrollMotion(): void {
	if (typeof window === "undefined" || prefersReducedMotion()) {
		return;
	}

	requestAnimationFrame(() => {
		try {
			setupReveal();
			setupCountUp();
		} catch (error) {
			console.error("ScrollMotion: 初始化失败", error);
		}
	});
}

/** 把动效挂到 Swup 生命周期上；Swup 尚未就绪时等它的 enable 事件 */
function registerSwupHooks(): void {
	const attach = () => {
		const swup = (
			window as unknown as {
				swup?: {
					hooks?: {
						on: (event: string, handler: () => void) => void;
					};
				};
			}
		).swup;

		if (!swup?.hooks) {
			return false;
		}

		swup.hooks.on("page:view", () => initScrollMotion());
		swup.hooks.on("visit:start", () => cleanupScrollMotion());
		return true;
	};

	if (attach()) {
		return;
	}

	document.addEventListener(
		"swup:enable",
		() => {
			attach();
		},
		{ once: true },
	);
}

/**
 * 启动滚动动效。
 *
 * 独立于 SwupManager 的初始化链路：后者的 `init()` 需要 `await` 面板处理器
 * （会动态加载较重的模块），一旦被拖慢就会连带推迟动效挂载。这里直接自启动，
 * 只借用 Swup 的事件做换页重建。
 */
export function bootScrollMotion(): void {
	if (typeof window === "undefined") {
		return;
	}

	const start = () => {
		initScrollMotion();
		registerSwupHooks();
	};

	if (document.readyState === "complete") {
		start();
	} else {
		document.addEventListener("DOMContentLoaded", start, { once: true });
	}
}

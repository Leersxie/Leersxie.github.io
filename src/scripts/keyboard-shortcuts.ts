/**
 * 博客级键盘快捷键。
 *
 *   /      聚焦搜索框（点击导航栏的搜索触发器，比直接 focus input 稳）
 *   t      回到顶部
 *   j / k  下一篇 / 上一篇（仅在文章页生效）
 *   ?      打开 / 关闭快捷键说明面板
 *   Esc    关闭面板
 *
 * 实现要点：
 * - keydown 挂在 document 上，**天然跨 Swup 换页存活**，不需要重新绑定；
 *   面板元素每次按键时懒查询即可（Swup 会替换它）。
 * - 用户在输入框 / textarea / contenteditable 里打字时一律不劫持。
 * - 带 Ctrl / Cmd / Alt 的组合键不处理（留给浏览器快捷键）。
 * - 文章列表从页面里的 <script type="application/json"> 读取，Swup 换页后自动取到新的。
 */

const POST_LIST_ID = "shortcut-post-list";
const PANEL_ID = "shortcut-help";

function readPostList(): string[] {
	const el = document.getElementById(POST_LIST_ID);
	if (!el?.textContent) {
		return [];
	}
	try {
		const v = JSON.parse(el.textContent);
		return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
	} catch {
		return [];
	}
}

function isTyping(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	if (target.isContentEditable) {
		return true;
	}
	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

const normalizePath = (p: string): string =>
	p.endsWith("/") ? p : `${p}/`;

function currentPostIndex(list: string[]): number {
	const here = normalizePath(window.location.pathname);
	return list.findIndex((u) => normalizePath(u) === here);
}

function getPanel(): HTMLElement | null {
	return document.getElementById(PANEL_ID);
}

function isPanelOpen(): boolean {
	const panel = getPanel();
	return !!panel && !panel.hasAttribute("hidden");
}

function setPanel(open: boolean): void {
	const panel = getPanel();
	if (!panel) {
		return;
	}
	if (open) {
		panel.removeAttribute("hidden");
	} else {
		panel.setAttribute("hidden", "");
	}
}

function boot(): void {
	// 只绑一次；Swup 换页不重绑（监听器挂在 document 上）。
	if (document.documentElement.dataset.kbdBound === "1") {
		return;
	}
	document.documentElement.dataset.kbdBound = "1";

	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey || e.metaKey || e.altKey) {
			return;
		}
		if (isTyping(e.target)) {
			return;
		}

		if (e.key === "Escape") {
			if (isPanelOpen()) {
				e.preventDefault();
				setPanel(false);
			}
			return;
		}

		switch (e.key) {
			case "?":
				e.preventDefault();
				setPanel(!isPanelOpen());
				break;

			case "/": {
				e.preventDefault();
				const trigger = document.querySelector<HTMLElement>(
					'[aria-label="Search"], [aria-label="搜索"], [aria-label="搜尋"]',
				);
				trigger?.click();
				break;
			}

			case "t":
			case "T":
				if (isPanelOpen()) {
					return;
				}
				e.preventDefault();
				window.scrollTo({ top: 0, behavior: "smooth" });
				break;

			case "j":
			case "J":
			case "k":
			case "K": {
				if (isPanelOpen()) {
					return;
				}
				const list = readPostList();
				if (list.length === 0) {
					return;
				}
				const idx = currentPostIndex(list);
				if (idx < 0) {
					return; // 不在文章页，不做反应
				}
				const target = e.key.toLowerCase() === "j" ? idx + 1 : idx - 1;
				if (target < 0 || target >= list.length) {
					return; // 已到首/末篇
				}
				e.preventDefault();
				window.location.href = list[target];
				break;
			}
		}
	});

	// 点遮罩或关闭按钮关闭面板
	document.addEventListener("click", (e) => {
		if (!isPanelOpen()) {
			return;
		}
		const target = e.target;
		if (
			target instanceof HTMLElement &&
			(target.closest("[data-shortcut-close]") ||
				target.classList.contains("shortcut-help__backdrop"))
		) {
			setPanel(false);
		}
	});
}

if (document.readyState === "complete") {
	boot();
} else {
	document.addEventListener("DOMContentLoaded", boot, { once: true });
}

// 声明为模块，避免 boot() 污染全局作用域与其他脚本重名
export {};
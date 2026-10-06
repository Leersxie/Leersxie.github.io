<script lang="ts">
	import { DARK_MODE, DEFAULT_THEME, LIGHT_MODE } from "@constants/constants";
	import Icon from "@iconify/svelte";
	import { getStoredTheme, setTheme } from "@utils/setting-utils";
	import { onMount } from "svelte";

	import type { LIGHT_DARK_MODE } from "@/types/config.ts";

	const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE];
	let mode: LIGHT_DARK_MODE = $state(DEFAULT_THEME);
	let isChanging = false;

	onMount(() => {
		mode = getStoredTheme();
	});

	function switchScheme(newMode: LIGHT_DARK_MODE) {
		// 防止连续快速点击
		if (isChanging) {
			return;
		}

		isChanging = true;
		mode = newMode;
		setTheme(newMode);

		// 50ms 后重置状态，防止过快切换
		setTimeout(() => {
			isChanging = false;
		}, 50);
	}

	function toggleScheme() {
		if (isChanging) {
			return;
		}

		let i = 0;
		for (; i < seq.length; i++) {
			if (seq[i] === mode) {
				break;
			}
		}
		switchScheme(seq[(i + 1) % seq.length]);
	}

	// 添加 Swup 钩子监听，确保在页面切换后同步主题状态
	if (typeof window !== "undefined") {
		// 监听 Swup 的内容替换事件
		const handleContentReplace = () => {
			// 使用 requestAnimationFrame 确保在下一帧更新状态，避免渲染冲突
			requestAnimationFrame(() => {
				const newMode = getStoredTheme();
				if (mode !== newMode) {
					mode = newMode;
				}
			});
		};

		// 检查 Swup 是否已经加载
		if ((window as any).swup && (window as any).swup.hooks) {
			(window as any).swup.hooks.on(
				"content:replace",
				handleContentReplace,
			);
		} else {
			document.addEventListener("swup:enable", () => {
				if ((window as any).swup && (window as any).swup.hooks) {
					(window as any).swup.hooks.on(
						"content:replace",
						handleContentReplace,
					);
				}
			});
		}

		// 页面加载完成后也同步一次状态
		document.addEventListener("DOMContentLoaded", () => {
			requestAnimationFrame(() => {
				const newMode = getStoredTheme();
				if (mode !== newMode) {
					mode = newMode;
				}
			});
		});
	}
</script>

<button
	aria-label="Light/Dark Mode"
	class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn z-50 flex items-center justify-center"
	id="scheme-switch"
	onclick={toggleScheme}
	data-mode={mode}
>
	<span class="theme-toggle-track">
		<span class="theme-toggle-ghost theme-toggle-ghost--sun">
			<Icon icon="material-symbols:wb-sunny-outline-rounded"></Icon>
		</span>
		<span class="theme-toggle-ghost theme-toggle-ghost--moon">
			<Icon icon="material-symbols:dark-mode-outline-rounded"></Icon>
		</span>
		<span class="theme-toggle-thumb">
			<Icon
				icon={mode === LIGHT_MODE
					? "material-symbols:wb-sunny-rounded"
					: "material-symbols:dark-mode-rounded"}
			></Icon>
		</span>
	</span>
</button>

<style>
	/* 确保主题切换按钮的背景色即时更新 */
	.theme-switch-btn::before {
		transition:
			transform 75ms ease-out,
			background-color 0ms !important;
	}

	.theme-toggle-track {
		position: relative;
		display: block;
		width: 2.6rem;
		height: 1.5rem;
		border-radius: 999px;
		background: var(--btn-regular-bg);
		border: 1px solid var(--line-divider);
		transition: background-color 0.25s ease;
	}

	.theme-switch-btn:hover .theme-toggle-track {
		background: var(--btn-regular-bg-hover);
	}

	.theme-toggle-ghost {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		font-size: 0.8rem;
		color: var(--btn-content);
		opacity: 0.5;
		transition: opacity 0.25s ease;
	}

	.theme-toggle-ghost--sun {
		left: 0.28rem;
	}

	.theme-toggle-ghost--moon {
		right: 0.28rem;
	}

	/* 滑块：亮色靠左、暗色靠右。
	   用 left 而非 translateX，左右留白完全对称（各 0.15rem）。 */
	.theme-toggle-thumb {
		position: absolute;
		top: 50%;
		left: 0.15rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.2rem;
		height: 1.2rem;
		margin-top: -0.6rem;
		border-radius: 50%;
		background: var(--primary);
		color: var(--card-bg);
		font-size: 0.75rem;
		box-shadow: 0 1px 4px oklch(from var(--primary) l c h / 0.4);
		transition: left 0.32s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.theme-switch-btn[data-mode="dark"] .theme-toggle-thumb {
		left: calc(100% - 1.35rem);
	}

	/* 亮色时太阳滑块压住左侧幽灵图标，降低右侧月亮的存在感（反之亦然） */
	.theme-switch-btn[data-mode="light"] .theme-toggle-ghost--moon,
	.theme-switch-btn[data-mode="dark"] .theme-toggle-ghost--sun {
		opacity: 0.32;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-toggle-thumb,
		.theme-toggle-track,
		.theme-toggle-ghost {
			transition: none;
		}
	}
</style>

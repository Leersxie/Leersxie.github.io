<script lang="ts">
	import type { TagChipProps } from "./types";

	interface Props extends TagChipProps {}
	const { href, label, class: className = "" }: Props = $props();
</script>

{#if href}
	<a {href} aria-label={label} class="tag-chip {className}">
		<slot />
	</a>
{:else}
	<span class="tag-chip {className}">
		<slot />
	</span>
{/if}

<style>
	.tag-chip {
		display: inline-flex;
		align-items: center;
		height: 2rem;
		padding: 0 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		background-color: var(--btn-plain-bg-hover);
		color: var(--btn-content);
		/* 悬停「描边扩散 + 文字上浮」（视觉方案 P1-10⑤）：不再整块填色，更克制 */
		transition:
			transform 0.25s var(--tech-ease-out, ease),
			box-shadow 0.25s var(--tech-ease-out, ease),
			color 0.2s ease,
			background-color 0.2s ease;
		text-decoration: none;
		cursor: pointer;
	}

	.tag-chip:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 0 1.5px var(--primary),
			0 6px 16px rgb(var(--tech-accent, 120 170 255) / 0.15);
		color: var(--primary);
	}

	:global(.dark) .tag-chip {
		background-color: var(--card-bg);
		color: var(--text-color);
	}

	:global(.dark) .tag-chip:hover {
		background-color: var(--primary);
		color: white;
	}
</style>

<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import { onMount } from "svelte";

	const { hint = "" } = $props();

	let errorMessage = $state("");
	let isLoading = $state(false);
	let password = $state("");

	function dispatchUnlock(pwd: string) {
		const event = new CustomEvent("password:unlock", {
			detail: { password: pwd },
			bubbles: true,
			composed: true,
		});
		document.dispatchEvent(event);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (password.trim()) {
			dispatchUnlock(password);
		}
	}

	function handleKeypress(e: KeyboardEvent) {
		if (e.key === "Enter" && password.trim()) {
			dispatchUnlock(password);
		}
	}

	onMount(() => {
		const handleLoading = ((e: CustomEvent<boolean>) => {
			isLoading = e.detail;
		}) as EventListener;

		const handleError = ((e: CustomEvent<string>) => {
			errorMessage = e.detail;
			isLoading = false;
		}) as EventListener;

		const handleClearError = (() => {
			errorMessage = "";
		}) as EventListener;

		document.addEventListener("password:loading", handleLoading);
		document.addEventListener("password:error", handleError);
		document.addEventListener("password:clear-error", handleClearError);

		return () => {
			document.removeEventListener("password:loading", handleLoading);
			document.removeEventListener("password:error", handleError);
			document.removeEventListener(
				"password:clear-error",
				handleClearError,
			);
		};
	});
</script>

<div class="password-protection">
	<div class="password-container card-base">
		<div class="lock-icon">
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="w-20 h-20"
			>
				<path
					d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"
					fill="currentColor"
				></path>
			</svg>
		</div>

		<h2>{i18n(I18nKey.passwordProtected)}</h2>
		<p class="description">{i18n(I18nKey.passwordProtectedDescription)}</p>

		{#if hint}
			<p class="hint-text">{i18n(I18nKey.passwordHint)}: {hint}</p>
		{/if}

		<form class="password-form" onsubmit={handleSubmit}>
			<div class="input-underline">
				<input
					type="password"
					id="password-input"
					placeholder={i18n(I18nKey.passwordPlaceholder)}
					class="password-input"
					bind:value={password}
					onkeypress={handleKeypress}
					disabled={isLoading}
					autocomplete="off"
				/>
			</div>
			<button
				id="unlock-btn"
				class="unlock-button btn-shine"
				type="submit"
				disabled={isLoading}
			>
				{isLoading
					? i18n(I18nKey.passwordUnlocking)
					: i18n(I18nKey.passwordUnlock)}
			</button>
		</form>

		{#if errorMessage}
			<p class="error-message">{errorMessage}</p>
		{/if}
	</div>
</div>

<style>
	.password-protection {
		display: flex;
		justify-content: center;
		padding: 4rem 1rem;
	}

	.password-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		max-width: 25rem;
		width: 100%;
		padding: 2rem;
		text-align: center;
	}

	.lock-icon {
		color: var(--primary);
	}

	.lock-icon svg {
		width: 5rem;
		height: 5rem;
	}

	.password-container h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.8);
	}

	:global(.dark) .password-container h2 {
		color: rgba(255, 255, 255, 0.8);
	}

	.description {
		margin: 0;
		font-size: 0.875rem;
		color: rgba(0, 0, 0, 0.4);
	}

	:global(.dark) .description {
		color: rgba(255, 255, 255, 0.4);
	}

	.hint-text {
		margin: 0;
		font-size: 0.75rem;
		color: rgba(0, 0, 0, 0.5);
	}

	:global(.dark) .hint-text {
		color: rgba(255, 255, 255, 0.5);
	}

	.password-form {
		width: 100%;
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-underline {
		position: relative;
		width: 100%;
	}

	.password-input {
		width: 100%;
		padding: 0.6rem 0.15rem;
		border: none;
		border-bottom: 2px solid var(--line-color);
		border-radius: 0;
		font-size: 0.875rem;
		background: transparent;
		color: rgba(0, 0, 0, 0.8);
		outline: none;
		transition: border-color 0.25s ease;
	}

	:global(.dark) .password-input {
		color: rgba(255, 255, 255, 0.85);
	}

	.password-input::placeholder {
		color: rgba(0, 0, 0, 0.25);
	}

	:global(.dark) .password-input::placeholder {
		color: rgba(255, 255, 255, 0.25);
	}

	/* 聚焦时主色下划线自左向右铺开 */
	.input-underline::after {
		content: "";
		position: absolute;
		left: 0;
		bottom: 0;
		height: 2px;
		width: 0;
		background: var(--primary);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.input-underline:focus-within::after {
		width: 100%;
	}

	.unlock-button {
		width: 100%;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		background: var(--primary);
		color: white;
		border: none;
		cursor: pointer;
		transition:
			opacity 0.2s,
			transform 0.1s;
	}

	:global(.dark) .unlock-button {
		color: rgba(0, 0, 0, 0.7);
	}

	.unlock-button:hover:not(:disabled) {
		opacity: 0.85;
	}

	.unlock-button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.unlock-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		margin: 0;
		font-size: 0.75rem;
		color: #ef4444;
	}

	:global(.dark) .error-message {
		color: #f87171;
	}

	@media (max-width: 768px) {
		.password-protection {
			padding: 2rem 1rem;
		}

		.password-container {
			padding: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.input-underline::after {
			transition: none;
		}
	}
</style>

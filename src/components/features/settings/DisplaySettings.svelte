<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import Icon from "@iconify/svelte";
	import {
		applyHue,
		clearHue,
		getDefaultHue,
		getHue,
		setHue,
	} from "@utils/setting-utils";
	import { onMount } from "svelte";

	import type { DisplaySettingsProps } from "./types";

	export let className = "";

	let hue = 250;
	let defaultHue = 250;
	let isMounted = false;

	function resetHue() {
		hue = defaultHue;
		// 清除存储而不是写入默认值：以后调整 config 默认色相时能自动生效
		clearHue();
		applyHue(hue);
	}

	onMount(() => {
		isMounted = true;
		defaultHue = getDefaultHue();
		// 只读取应用，不回写——避免把「当前默认值」持久化成用户偏好
		hue = getHue();
	});

	// 拖动滑块时实时预览；持久化只发生在下面的 on:input
	$: if (isMounted && (hue || hue === 0)) {
		applyHue(hue);
	}
</script>

<div
	id="display-setting"
	class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4"
	class:list={[className]}
>
	<div class="flex flex-row gap-2 mb-3 items-center justify-between">
		<div
			class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
		>
			{i18n(I18nKey.themeColor)}
			<button
				aria-label="Reset to Default"
				class="btn-regular w-7 h-7 rounded-md active:scale-90"
				class:opacity-0={hue === defaultHue}
				class:pointer-events-none={hue === defaultHue}
				on:click={resetHue}
			>
				<div class="text-[var(--btn-content)]">
					<Icon
						icon="fa7-solid:arrow-rotate-left"
						class="text-[0.875rem]"
					></Icon>
				</div>
			</button>
		</div>
		<div class="flex gap-1">
			<div
				id="hueValue"
				class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]"
			>
				{hue}
			</div>
		</div>
	</div>
	<div
		class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none"
	>
		<input
			aria-label={i18n(I18nKey.themeColor)}
			type="range"
			min="0"
			max="360"
			bind:value={hue}
			on:input={() => setHue(hue)}
			class="slider"
			id="colorSlider"
			step="5"
			style="width: 100%"
		/>
	</div>
</div>

<style lang="stylus">
    #display-setting
      input[type="range"]
        -webkit-appearance none
        height 1.5rem
        background-image var(--color-selection-bar)
        transition background-image 0.15s ease-in-out

        /* Input Thumb */
        &::-webkit-slider-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-moz-range-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          border-width 0
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-ms-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

</style>

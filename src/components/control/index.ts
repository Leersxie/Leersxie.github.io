/**
 * Control Components
 *
 * Interactive components for user controls and UI variants.
 *
 * @deprecated These are legacy wrapper components.
 * For new development, prefer atoms/Button with appropriate variants.
 */

export { default as BackToTop } from "./BackToTop.astro";
export { default as ButtonLink } from "./ButtonLink.astro";
export { default as ButtonTag } from "./ButtonTag.astro";
export { default as LayoutSwitch } from "./LayoutSwitch.svelte";
export { default as PageProgressBar } from "./PageProgressBar/PageProgressBar.astro";
export { default as Pagination } from "./Pagination.astro";
export { default as ThemeSwitch } from "./ThemeSwitch.svelte";

// 注意：FloatingTOC 的唯一实现在 @components/features/toc/FloatingTOC.astro。
// 此前本目录下存在一份同名副本，已移除以免混淆。
// Note: Types are defined locally in their respective components

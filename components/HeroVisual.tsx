"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ArchiveArray from "@/components/ArchiveArray";

/** 真 3D 版本：纯客户端懒加载（three 约 1MB，首帧稳定后才拉取） */
const ArchiveArrayGL = dynamic(() => import("@/components/ArchiveArrayGL"), {
	ssr: false,
});

/**
 * 英雄视觉编排：CSS 3D 阵列作底（立即可见、无条件可用），
 * 能力检测通过的桌面设备上，Three.js 玻璃阵列淡入接管；
 * 移动端 / 触屏 / reduced-motion / WebGL 失败 → 永远停在 CSS 版本。
 * forceDark：英雄彩底面板（.hero-panel）恒为深底，GL 场景按暗色渲染。
 */
export default function HeroVisual({
	labels,
	forceDark = false,
}: {
	labels: string[];
	forceDark?: boolean;
}) {
	const [dark, setDark] = useState(forceDark);
	const [capable, setCapable] = useState(false);
	const [glVisible, setGlVisible] = useState(false);

	useEffect(() => {
		if (forceDark) {
			setDark(true);
			return;
		}
		const sync = () =>
			setDark(document.documentElement.classList.contains("dark"));
		sync();
		const mo = new MutationObserver(sync);
		mo.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => mo.disconnect();
	}, [forceDark]);

	useEffect(() => {
		const ok =
			window.matchMedia("(pointer: fine)").matches &&
			window.innerWidth >= 768 &&
			!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (ok) {
			const t1 = setTimeout(() => setCapable(true), 600);
			const t2 = setTimeout(() => setGlVisible(true), 1500);
			return () => {
				clearTimeout(t1);
				clearTimeout(t2);
			};
		}
	}, []);

	return (
		<>
			<ArchiveArray labels={labels} />
			{capable && (
				<div
					className={`absolute inset-0 transition-opacity duration-1000 ${glVisible ? "opacity-100" : "opacity-0"}`}
				>
					<ArchiveArrayGL labels={labels} dark={dark} />
				</div>
			)}
		</>
	);
}

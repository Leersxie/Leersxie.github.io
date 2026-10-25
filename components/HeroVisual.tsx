"use client";

import ArchiveArray from "@/components/ArchiveArray";

/**
 * v6 S2 方案 A：GL 场景已删（ArchiveArrayGL 的紫色硬编码绕过 token 系统，
 * 且对照实验证明 CSS 版观感更好、噪音更低）。保留 CSS 3D 阵列为唯一背景层，
 * 观感 = 档案终端底纹。
 */
export default function HeroVisual({
	labels,
}: {
	labels: string[];
}) {
	return <ArchiveArray labels={labels} />;
}

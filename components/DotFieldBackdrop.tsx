"use client";

import dynamic from "next/dynamic";

import DotField from "@/components/reactbits/DotField";

/** v4 7.2 避坑：Canvas 组件必须 ssr:false（防 window 未定义） */
const DotFieldCanvas = dynamic(() => import("@/components/reactbits/DotField"), {
	ssr: false,
});

/**
 * B6：Dot Field 接入 hero（v4 6.2 hero 预设参数）。
 * 职责：替代 os-grid + blob（B6 步骤 3），给 hero 加材质 + 鼠标呼吸。
 * 主题适配：亮色模式切 light 预设（暗金 glow，纯黄在白底不可见）。
 */
export default function DotFieldBackdrop({ dark }: { dark: boolean }) {
	return dark ? (
		<div className="pointer-events-none absolute inset-0" aria-hidden>
			<DotFieldCanvas
				dotRadius={1.15}
				dotSpacing={34}
				gradientFrom="rgba(233,234,238,0.13)"
				gradientTo="rgba(233,234,238,0.05)"
				glowColor="#f1c644"
				glowRadius={190}
				glowIntensity={0.3}
				baseOpacity={0.34}
				cursorRadius={280}
				bulgeStrength={0.22}
				waveAmplitude={1.5}
				speed={0.5}
				interactive
				intro
				opacity={0.5}
			/>
		</div>
	) : (
		<div className="pointer-events-none absolute inset-0" aria-hidden>
			<DotFieldCanvas
				dotRadius={1.15}
				dotSpacing={34}
				gradientFrom="rgba(17,19,24,0.10)"
				gradientTo="rgba(17,19,24,0.04)"
				glowColor="#b58900"
				glowRadius={160}
				glowIntensity={0.18}
				baseOpacity={0.3}
				cursorRadius={240}
				bulgeStrength={0.18}
				waveAmplitude={0}
				speed={0.4}
				interactive
				intro
				opacity={0.6}
			/>
		</div>
	);
}

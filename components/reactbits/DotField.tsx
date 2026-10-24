"use client";

import { useEffect, useRef } from "react";

/**
 * B6 Dot Field（自写实现，reactbits 官方 CSS + v4 说明书 6.2 参数表）。
 * 行为：网格点阵 + 光标透镜（lens 内鼓起 + 信号色辉光 + 提亮），
 * intro = 按距离错落的入场，speed = 全局时间倍率。
 * 性能契约：DPR 封顶 1.75；离屏 / visibilitychange 双暂停；
 * interactive=false 时忽略指针（移动端降级）。SSR 安全（只在 effect 触碰 window）。
 */

export interface DotFieldProps {
	dotRadius?: number;
	dotSpacing?: number;
	gradientFrom?: string;
	gradientTo?: string;
	gradientAngle?: number;
	glowColor?: string;
	glowRadius?: number;
	glowIntensity?: number;
	baseOpacity?: number;
	cursorRadius?: number;
	bulgeStrength?: number;
	twist?: number;
	waveAmplitude?: number;
	sparkle?: boolean;
	speed?: number;
	interactive?: boolean;
	intro?: boolean;
	opacity?: number;
	className?: string;
}

export default function DotField({
	dotRadius = 1.15,
	dotSpacing = 34,
	gradientFrom = "rgba(233,234,238,0.13)",
	gradientTo = "rgba(233,234,238,0.05)",
	glowColor = "#f1c644",
	glowRadius = 190,
	glowIntensity = 0.3,
	baseOpacity = 0.34,
	cursorRadius = 280,
	bulgeStrength = 0.22,
	waveAmplitude = 1.5,
	speed = 0.5,
	interactive = true,
	intro = true,
	opacity = 0.85,
	className = "",
}: DotFieldProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const host = canvas?.parentElement;
		if (!canvas || !host) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let raf = 0;
		let running = true;
		let w = 0;
		let h = 0;
		let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
		const bornAt = performance.now();
		const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999 };

		const parseRGBA = (
			rgba: string,
		): readonly [number, number, number, number] => {
			const m = rgba.match(/rgba?\(([^)]+)\)/);
			if (!m) return [233, 234, 238, 1] as const;
			const parts = m[1].split(",").map((v) => Number(v.trim()));
			return [
				parts[0] ?? 233,
				parts[1] ?? 234,
				parts[2] ?? 238,
				parts[3] ?? 1,
			] as const;
		};
		const from = parseRGBA(gradientFrom);
		const to = parseRGBA(gradientTo);
		const glowRGB = (() => {
			const m = glowColor.match(/^#([0-9a-f]{6})$/i);
			if (!m) return [241, 198, 68] as const;
			const n = parseInt(m[1], 16);
			return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
		})();

		const resize = () => {
			w = host.clientWidth;
			h = host.clientHeight;
			if (!w || !h) return;
			dpr = Math.min(window.devicePixelRatio || 1, 1.75);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
		};
		resize();

		const onPointer = (e: PointerEvent) => {
			if (!interactive) return;
			const r = canvas.getBoundingClientRect();
			pointer.x = e.clientX - r.left;
			pointer.y = e.clientY - r.top;
		};
		const onLeave = () => {
			pointer.x = -9999;
			pointer.y = -9999;
		};

		const draw = (t: number) => {
			if (!running) return;
			raf = requestAnimationFrame(draw);
			if (!w || !h) return;

			const time = (t - bornAt) * speed * 0.001;
			pointer.sx += (pointer.x - pointer.sx) * 0.12;
			pointer.sy += (pointer.y - pointer.sy) * 0.12;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);

			// intro：按距离错落的入场系数
			const introK = intro ? Math.min(1, (t - bornAt) / 1400) : 1;

			const cols = Math.ceil(w / dotSpacing) + 1;
			const rows = Math.ceil(h / dotSpacing) + 1;

			for (let ix = 0; ix < cols; ix++) {
				for (let iy = 0; iy < rows; iy++) {
					const x = ix * dotSpacing + dotSpacing / 2;
					const y = iy * dotSpacing + dotSpacing / 2;

					// 垂直渐变底色（gradientFrom → gradientTo）
					const vk = Math.min(1, Math.max(0, y / h));
					const r0 = from[0] + (to[0] - from[0]) * vk;
					const g0 = from[1] + (to[1] - from[1]) * vk;
					const b0 = from[2] + (to[2] - from[2]) * vk;
					const a0 = (from[3] + (to[3] - from[3]) * vk) * baseOpacity;

					// 光标透镜：距离 → 鼓起 + 提亮 + 信号色
					const dx = x - pointer.sx;
					const dy = y - pointer.sy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					let a = a0;
					let radius = dotRadius;
					let cr = r0;
					let cg = g0;
					let cb = b0;
					if (dist < cursorRadius) {
						const k = 1 - dist / cursorRadius; // 1 = 光标中心
						radius = dotRadius * (1 + bulgeStrength * k * 2.2);
						a = a0 + (1 - a0) * k * glowIntensity * 2.4;
						cr = r0 + (glowRGB[0] - r0) * k * glowIntensity * 1.6;
						cg = g0 + (glowRGB[1] - g0) * k * glowIntensity * 1.6;
						cb = b0 + (glowRGB[2] - b0) * k * glowIntensity * 1.6;
					}

					// 微波浪（呼吸感）
					const wave =
						waveAmplitude > 0
							? Math.sin(time * 2 + ix * 0.7 + iy * 0.5) * waveAmplitude
							: 0;

					// intro：从中心向外错落浮现
					if (introK < 1) {
						const dCenter = Math.sqrt(
							(x - w / 2) ** 2 + (y - h / 2) ** 2,
						);
						const local = Math.max(
							0,
							Math.min(1, introK * 1.8 - dCenter / (w * 0.9)),
						);
						if (local <= 0) continue;
						a *= local;
					}

					ctx.beginPath();
					ctx.fillStyle = `rgba(${cr.toFixed(0)},${cg.toFixed(0)},${cb.toFixed(0)},${Math.min(1, a).toFixed(3)})`;
					ctx.arc(x, y + wave, Math.max(0.2, radius), 0, Math.PI * 2);
					ctx.fill();
				}
			}
		};
		raf = requestAnimationFrame(draw);

		// —— 双暂停契约：离屏 + 标签页隐藏 ——
		const setRunning = (v: boolean) => {
			if (running === v) return;
			running = v;
			if (v) raf = requestAnimationFrame(draw);
			else cancelAnimationFrame(raf);
		};
		const io = new IntersectionObserver((entries) => {
			setRunning(entries[0].isIntersecting && !document.hidden);
		});
		const onVis = () => setRunning(!document.hidden);
		const ro = new ResizeObserver(() => resize());
		io.observe(host);
		document.addEventListener("visibilitychange", onVis);
		ro.observe(host);
		if (interactive) {
			window.addEventListener("pointermove", onPointer);
			host.addEventListener("pointerleave", onLeave);
		}

		return () => {
			running = false;
			cancelAnimationFrame(raf);
			io.disconnect();
			ro.disconnect();
			document.removeEventListener("visibilitychange", onVis);
			window.removeEventListener("pointermove", onPointer);
			host.removeEventListener("pointerleave", onLeave);
		};
	}, [
		dotRadius,
		dotSpacing,
		gradientFrom,
		gradientTo,
		glowColor,
		glowRadius,
		glowIntensity,
		baseOpacity,
		cursorRadius,
		bulgeStrength,
		waveAmplitude,
		speed,
		interactive,
		intro,
		opacity,
	]);

	return (
		<div className={`dot-field ${className}`} style={{ opacity }} aria-hidden>
			<canvas ref={canvasRef} className="dot-field__canvas" />
		</div>
	);
}

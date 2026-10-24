"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 开屏启动序列（无确认直接运行，每会话一次）：
 * 品牌色面板 → 逐行启动日志 → LX 标识描线 → ACCESS GRANTED → 上滑揭示。
 * 总时长约 1.9s；点击/任意键跳过；sessionStorage 记录，会话内不重播；
 * prefers-reduced-motion 直接跳过。
 * 动画内核 = anime.js v4（ease: outExpo / outQuart 曲线）。
 */
export default function BootSequence() {
	const [mounted, setMounted] = useState(false);
	const overlay = useRef<HTMLDivElement>(null);

	useEffect(() => {
		try {
			if (sessionStorage.getItem("raos-boot")) return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				sessionStorage.setItem("raos-boot", "1");
				return;
			}
		} catch {
			return;
		}
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !overlay.current) return;
		let finished = false;
		const el = overlay.current;
		document.body.style.overflow = "hidden";

		const finish = () => {
			if (finished) return;
			finished = true;
			try {
				sessionStorage.setItem("raos-boot", "1");
			} catch {}
			document.body.style.overflow = "";
			import("animejs").then(({ animate, stagger }) => {
				animate(el, {
					translateY: ["0%", "-100%"],
					duration: 520,
					ease: "inOutQuart",
					onComplete: () => setMounted(false),
				});
			});
		};
		const onSkip = () => finish();
		window.addEventListener("keydown", onSkip);
		el.addEventListener("pointerdown", onSkip);

		import("animejs").then(({ animate, stagger }) => {
			// 启动日志逐行浮现
			animate(".boot-line", {
				opacity: [0, 1],
				translateX: [-10, 0],
				delay: stagger(180, { start: 140 }),
				duration: 420,
				ease: "outExpo",
			});
			// LX 标识描线（pathLength=100 归一化）
			animate(".boot-logo path", {
				strokeDashoffset: [100, 0],
				delay: stagger(160, { start: 420 }),
				duration: 640,
				ease: "outQuart",
			});
			// ACCESS GRANTED
			animate(".boot-grant", {
				opacity: [0, 1],
				scale: [0.9, 1],
				delay: 1250,
				duration: 300,
				ease: "outExpo",
			});
		});
		const doneTimer = setTimeout(finish, 1900);

		return () => {
			clearTimeout(doneTimer);
			window.removeEventListener("keydown", onSkip);
			document.body.style.overflow = "";
		};
	}, [mounted]);

	if (!mounted) return null;
	return (
		<div
			ref={overlay}
			className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-bg)]"
			role="presentation"
		>
			<div className="os-grid absolute inset-0 opacity-60" aria-hidden />
			<svg
				viewBox="0 0 64 64"
				className="relative mb-6 h-16 w-16"
				fill="none"
				aria-hidden
			>
				<path
					d="M32 4 58 18v28L32 60 6 46V18z"
					stroke="var(--color-brand)"
					strokeWidth="2"
					pathLength={100}
					strokeDasharray={100}
				/>
				<path
					d="M22 26l8 12 12-18"
					stroke="var(--color-brand)"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					pathLength={100}
					strokeDasharray={100}
				/>
			</svg>
			<div className="relative space-y-1.5 font-mono text-xs text-[var(--color-ink-soft)]">
				<p className="boot-line opacity-0">
					<span className="text-[var(--color-brand)]">▸</span> RHINE ARCHIVE
					OS // BOOT SEQUENCE
				</p>
				<p className="boot-line opacity-0">
					<span className="text-[var(--color-brand)]">▸</span> LOADING
					ARCHIVES ...... <span className="text-[var(--color-ink)]">OK</span>
				</p>
				<p className="boot-line opacity-0">
					<span className="text-[var(--color-brand)]">▸</span>{" "}
					AUTHENTICATING ▓▓▓{" "}
					<span className="text-[var(--color-ink)]">OK</span>
				</p>
			</div>
			<p className="boot-grant relative mt-6 rounded border border-[var(--color-brand)] bg-[var(--color-brand-dim)] px-3 py-1 font-mono text-[11px] tracking-[0.2em] text-[var(--color-brand)] opacity-0">
				ACCESS GRANTED
			</p>
			<p className="absolute bottom-6 font-mono text-[10px] text-[var(--color-muted)]">
				按任意键跳过 / PRESS ANY KEY TO SKIP
			</p>
		</div>
	);
}

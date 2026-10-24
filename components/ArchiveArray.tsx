"use client";

import { useEffect, useRef } from "react";

/**
 * 三维档案阵列：参照 RhineLabUI（莱茵生命终端 PV 5–40s）的五列循环档案阵列。
 * 实现路线：CSS 3D 透视平面 + 每列无限上移（transform/opacity 合成器层），
 * 指针移动做视差（rAF lerp），离屏/hidden 标签页暂停，reduced-motion 静止。
 * 纯 DOM，无 WebGL —— 帧率稳、体积零。
 */
export default function ArchiveArray({ labels }: { labels: string[] }) {
	const wrap = useRef<HTMLDivElement>(null);
	const plane = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wrapper = wrap.current;
		const pl = plane.current;
		if (!wrapper || !pl) return;

		// B5-2：createScope 收敛媒体查询（reduced/desktop），
		// scope.revert() 统一清理。CSS 漂移动画保持原样（零视觉变化）。
		let cleanup: (() => void) | undefined;
		let disposed = false;

		(async () => {
			const { createScope } = await import("animejs");
			if (disposed || !wrapper || !pl) return;

			const scope = createScope({
				root: wrapper,
				mediaQueries: {
					reduced: "(prefers-reduced-motion: reduce)",
					desktop: "(min-width: 768px)",
				},
			}).add((self) => {
				const matches = self?.matches ?? { reduced: false, desktop: true };
				if (matches.reduced) return; // 减少动态：视差与漂移全停（CSS 层同样静止）

				// —— 指针视差（lerp 平滑）——
				const state = { rx: 58, rz: 0, tx: 58, tz: 0, raf: 0, playing: true };
				const loop = () => {
					state.rx += (state.tx - state.rx) * 0.06;
					state.rz += (state.tz - state.rz) * 0.06;
					pl.style.transform = `rotateX(${state.rx.toFixed(2)}deg) rotateZ(${state.rz.toFixed(2)}deg)`;
					if (state.playing) state.raf = requestAnimationFrame(loop);
				};
				const onMove = (e: PointerEvent) => {
					const r = wrapper.getBoundingClientRect();
					const nx = (e.clientX - r.left) / r.width - 0.5;
					const ny = (e.clientY - r.top) / r.height - 0.5;
					state.tz = nx * 10; // 左右摆
					state.tx = 58 - ny * 8; // 上下俯仰
				};
				const onLeave = () => {
					state.tx = 58;
					state.tz = 0;
				};

				// —— 离屏暂停（含标签页隐藏）——
				const setPlaying = (v: boolean) => {
					if (state.playing === v) return;
					state.playing = v;
					wrapper.style.setProperty("--array-play", v ? "running" : "paused");
					if (v) state.raf = requestAnimationFrame(loop);
					else cancelAnimationFrame(state.raf);
				};
				const io = new IntersectionObserver((entries) => {
					setPlaying(entries[0].isIntersecting && !document.hidden);
				});
				const onVis = () => setPlaying(!document.hidden);
				io.observe(wrapper);
				document.addEventListener("visibilitychange", onVis);
				wrapper.addEventListener("pointermove", onMove);
				wrapper.addEventListener("pointerleave", onLeave);
				state.raf = requestAnimationFrame(loop);

				cleanup = () => {
					cancelAnimationFrame(state.raf);
					io.disconnect();
					document.removeEventListener("visibilitychange", onVis);
					wrapper.removeEventListener("pointermove", onMove);
					wrapper.removeEventListener("pointerleave", onLeave);
				};
			});

			cleanup = ((prev) => () => {
				prev?.();
				scope.revert();
			})(cleanup);
		})();

		return () => {
			disposed = true;
			cleanup?.();
		};
	}, []);

	// 五列，每列两份盒子做无缝循环
	const columns = [0, 1, 2, 3, 4].map((c) =>
		[0, 1, 2].map((r) => {
			const label = labels[(c * 3 + r) % Math.max(1, labels.length)] ?? "ARCHIVE";
			const id = `DOC.26${String(10 + ((c * 7 + r * 3) % 89)).padStart(2, "0")}-${String((c * 31 + r * 17) % 999).padStart(3, "0")}`;
			return { label, id, key: `${c}-${r}` };
		}),
	);

	return (
		<div
			ref={wrap}
			className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.45] [contain:paint] [perspective:1100px] [--array-play:running]"
			aria-hidden
		>
			<div
				ref={plane}
				className="absolute left-1/2 top-1/2 w-[170%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] will-change-transform"
				style={{ transform: "rotateX(58deg)" }}
			>
				<div className="flex justify-center gap-8 md:gap-12">
					{columns.map((col, ci) => (
						<div
							key={ci}
							className="array-col flex w-40 flex-col gap-8 md:w-48"
							style={{ animationDuration: `${22 + ci * 5}s` }}
						>
							{[...col, ...col].map((box, bi) => (
									<div
										key={`${box.key}-${bi}`}
										className="array-box rounded-[var(--radius-menu)] border border-[var(--color-line)] bg-[var(--color-panel)]/70 p-3"
									>
										<div className="mb-2 flex items-center justify-between">
											<span
												className="h-2 w-2 rounded-[2px]"
												style={{
													background:
														bi % 3 === 0
															? "var(--color-brand)"
															: "var(--color-line-strong)",
												}}
											/>
											<span className="h-[3px] w-8 rounded-[1px] bg-[var(--color-line-strong)]/40" />
										</div>
										<p className="truncate text-xs font-medium text-[var(--color-ink-soft)]/30">
											{box.label}
										</p>
										<div className="mt-2 h-1.5 w-full opacity-40 [background:repeating-linear-gradient(90deg,var(--color-line-strong)_0_2px,transparent_2px_5px)]" />
									</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* B1-5：原上下渐隐层已删（P0-05 渐隐色与面板底色耦合产生亮/暗条带） */}
		</div>
	);
}

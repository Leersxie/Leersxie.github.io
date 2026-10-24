"use client";

import { useEffect, useRef } from "react";

/**
 * 滚动显现：进入视口后 anime.js outExpo 上浮淡入。
 * SSR 默认可见（无 JS 不丢内容）；JS 可用时先隐藏再动画。
 */
export default function Reveal({
	children,
	delay = 0,
	y = 18,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	y?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		el.style.opacity = "0";
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return;
				io.disconnect();
				import("animejs").then(({ animate }) => {
					animate(el, {
						y: [y, 0],
						opacity: [0, 1],
						duration: 700,
						delay,
						ease: "outExpo",
					});
				});
			},
			{ threshold: 0.12 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [delay, y]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

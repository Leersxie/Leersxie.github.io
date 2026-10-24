"use client";

import { useEffect, useRef, useState } from "react";

/** 滚动数字：莱茵终端式数字翻滚（进入视口后从 0 计数到目标） */
export default function RollingNumber({
	value,
	duration = 900,
}: {
	value: number;
	duration?: number;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(0);
	const started = useRef(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting || started.current) return;
				started.current = true;
				const t0 = performance.now();
				const tick = (t: number) => {
					const p = Math.min(1, (t - t0) / duration);
					const eased = 1 - Math.pow(1 - p, 3);
					setDisplay(Math.round(value * eased));
					if (p < 1) requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
				io.disconnect();
			},
			{ threshold: 0.4 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [value, duration]);

	return (
		<span ref={ref} className="font-mono tabular-nums">
			{display.toLocaleString()}
		</span>
	);
}

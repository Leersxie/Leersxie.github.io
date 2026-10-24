"use client";

import { useEffect, useRef, useState } from "react";

/** 终端打字行：mounted 后逐字输出，Loop 关闭则停在句尾 */
export default function TypeLine({
	lines,
	speed = 28,
	loop = true,
}: {
	lines: string[];
	speed?: number;
	loop?: boolean;
}) {
	const [text, setText] = useState("");
	const idx = useRef(0);
	const pos = useRef(0);
	const dir = useRef<1 | -1>(1);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const step = () => {
			const line = lines[idx.current % lines.length];
			pos.current += dir.current;
			setText(line.slice(0, pos.current));
			let delay = speed;
			if (dir.current === 1 && pos.current >= line.length) {
				if (!loop && idx.current >= lines.length - 1) return;
				dir.current = -1;
				delay = 1600;
			} else if (dir.current === -1 && pos.current <= 0) {
				dir.current = 1;
				idx.current += 1;
				delay = 300;
			}
			timer = setTimeout(step, delay);
		};
		timer = setTimeout(step, 400);
		return () => clearTimeout(timer);
	}, [lines, speed, loop]);

	return (
		<span className="font-mono text-xs text-[var(--color-ink-soft)]">
			<span className="text-[var(--color-primary)]">▸ </span>
			{text}
			<span className="animate-pulse text-[var(--color-primary)]">▌</span>
		</span>
	);
}

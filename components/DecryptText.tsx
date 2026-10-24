"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "█▓▒░<>/\\|=+*#01アカサタナハマヤ";

/**
 * 解密文字：莱茵终端式「乱码 → 还原」。
 * 悬停触发（也可 play-once 自动播一次），逐字符从乱码收敛为原文。
 * 性能：只在运行期间跑 interval，结束即停；reduced-motion 直接显示原文。
 */
export default function DecryptText({
	text,
	className,
	autoplay = false,
}: {
	text: string;
	className?: string;
	autoplay?: boolean;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(text);
	const running = useRef(false);

	const play = useCallback(() => {
		if (running.current) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		running.current = true;
		let frame = 0;
		const total = Math.max(12, text.length * 2);
		const timer = setInterval(() => {
			frame += 1;
			const reveal = Math.floor((frame / total) * text.length * 1.4);
			const out = [...text]
				.map((ch, i) => {
					if (ch === " ") return " ";
					if (i < reveal) return ch;
					return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
				})
				.join("");
			setDisplay(out);
			if (frame >= total) {
				clearInterval(timer);
				setDisplay(text);
				running.current = false;
			}
		}, 28);
	}, [text]);

	useEffect(() => {
		if (!autoplay) return;
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				io.disconnect();
				// 等字体加载完再播，避免测量抖动
				setTimeout(play, 250);
			}
		});
		io.observe(el);
		return () => io.disconnect();
	}, [autoplay, play]);

	return (
		<span
			ref={ref}
			className={className}
			onMouseEnter={play}
			onFocus={play}
			data-decrypt={text}
		>
			{autoplay ? display : text}
		</span>
	);
}

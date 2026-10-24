"use client";

import { useEffect, useRef, useState } from "react";

/**
 * B7 翻牌编号：进入视口时每个字符依次 3D 翻转一次（0.7s，不循环）。
 * 固定宽度（等宽字体）防 CLS；sound=true 时翻到该字符播放 playFlap。
 * reduced-motion：直接显示成品。
 */
export default function FlipText({
	text,
	duration = 0.7,
	sound = false,
	className,
}: {
	text: string;
	duration?: number;
	sound?: boolean;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [chars, setChars] = useState<string[]>(text.split(""));
	const [played, setPlayed] = useState(false);

	useEffect(() => {
		setChars(text.split(""));
		setPlayed(false);
	}, [text]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setPlayed(true);
			return;
		}

		const io = new IntersectionObserver((entries) => {
			if (!entries[0].isIntersecting || played) return;
			setPlayed(true);
			io.disconnect();

			const total = Math.round(duration * 1000);
			const per = Math.max(30, Math.round(total / text.length));
			[...text].forEach((_, i) => {
				setTimeout(() => {
					setChars((prev) => {
						const next = [...prev];
						next[i] = text[i];
						return next;
					});
					if (sound) {
						import("@/lib/sound").then(({ playFlap }) => playFlap());
					}
				}, i * per);
			});
		});
		io.observe(el);
		return () => io.disconnect();
	}, [text, duration, sound, played]);

	const flipped = played ? chars : [...text].map((c) => (c === " " ? " " : "▓"));

	return (
		<span
			ref={ref}
			className={className}
			style={{ fontFamily: "var(--font-mono)" }}
			data-flip={text}
		>
			{flipped.map((c, i) => (
				<span
					key={i}
					className="inline-block"
					style={{
						width: c === " " ? undefined : "1ch",
						textAlign: "center",
					}}
				>
					{c}
				</span>
			))}
		</span>
	);
}

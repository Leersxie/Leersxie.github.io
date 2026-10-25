"use client";

import { useEffect, useRef, useState } from "react";

/** v6 B8：回到顶部——滚动 400px 后右下出现，平滑回顶 */
export default function BackToTop() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const onScroll = () => setShow(window.scrollY > 400);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<button
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			className={`fixed bottom-6 right-6 z-40 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] shadow-[var(--shadow-rest)] transition-all duration-200 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)] ${
				show ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
			}`}
			aria-label="回到顶部"
		>
			↑ TOP
		</button>
	);
}

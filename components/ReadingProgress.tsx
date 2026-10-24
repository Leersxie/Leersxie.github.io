"use client";

import { useEffect, useRef } from "react";

/** 顶部阅读进度条（文章页）—— B5：rAF 节流 + ref 直写，不触发 re-render；
 *  顺带修复原实现未监听 resize 的 bug（窗口变窄后进度错位）。 */
export default function ReadingProgress() {
	const bar = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let raf = 0;
		let ticking = false;

		const update = () => {
			const doc = document.documentElement;
			const max = doc.scrollHeight - doc.clientHeight;
			const pct = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0;
			if (bar.current) bar.current.style.width = `${pct}%`;
			ticking = false;
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			raf = requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, []);

	return <div ref={bar} className="reading-progress" style={{ width: "0%" }} aria-hidden />;
}

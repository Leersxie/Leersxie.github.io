"use client";

import { useEffect, useState } from "react";

/** 顶部阅读进度条（文章页） */
export default function ReadingProgress() {
	const [pct, setPct] = useState(0);
	useEffect(() => {
		const onScroll = () => {
			const doc = document.documentElement;
			const max = doc.scrollHeight - doc.clientHeight;
			setPct(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return <div className="reading-progress" style={{ width: `${pct}%` }} aria-hidden />;
}

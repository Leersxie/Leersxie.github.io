"use client";

import { useEffect, useRef } from "react";

/**
 * giscus 评论（档案访问日志）。懒加载：滚动到评论区才拉脚本。
 * 配置沿用旧站 Discussions（pathname 绑定，路径不变即评论不丢）。
 */
export default function Giscus() {
	const ref = useRef<HTMLDivElement>(null);
	const loaded = useRef(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || loaded.current) return;
		const io = new IntersectionObserver((entries) => {
			if (!entries[0].isIntersecting || loaded.current) return;
			loaded.current = true;
			io.disconnect();
			const s = document.createElement("script");
			s.src = "https://giscus.app/client.js";
			s.async = true;
			s.crossOrigin = "anonymous";
			s.setAttribute("data-repo", "Leersxie/Leersxie.github.io");
			s.setAttribute("data-repo-id", "R_kgDORy5vYQ");
			s.setAttribute("data-category", "Announcements");
			s.setAttribute("data-category-id", "DIC_kwDORy5vYc4DHE69");
			s.setAttribute("data-mapping", "pathname");
			s.setAttribute("data-strict", "0");
			s.setAttribute("data-reactions-enabled", "1");
			s.setAttribute("data-emit-metadata", "0");
			s.setAttribute("data-input-position", "top");
			s.setAttribute("data-theme", "preferred_color_scheme");
			s.setAttribute("data-lang", "zh-CN");
			s.setAttribute("data-loading", "lazy");
			el.appendChild(s);
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<section className="mt-14">
			<p className="mono-tag mb-4">// ACCESS LOG · 访问日志</p>
			<div ref={ref} className="min-h-40" />
		</section>
	);
}

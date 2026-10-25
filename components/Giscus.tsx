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
			{/* v6 B4：加载骨架——3 行灰条 + 头像圆，animate-pulse */}
			<div ref={ref} className="min-h-40 space-y-4" aria-hidden>
				{[0, 1, 2].map((i) => (
					<div key={i} className="flex animate-pulse gap-3">
						<div className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-panel-2)]" />
						<div className="flex-1 space-y-2 pt-1">
							<div className="h-2.5 w-28 rounded-[var(--radius-tag)] bg-[var(--color-panel-2)]" />
							<div className="h-2.5 w-full rounded-[var(--radius-tag)] bg-[var(--color-panel-2)]" />
							<div className="h-2.5 w-3/5 rounded-[var(--radius-tag)] bg-[var(--color-panel-2)]" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

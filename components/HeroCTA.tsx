"use client";

import Link from "next/link";

/**
 * B3-1 Hero CTA 双按钮。规格书的 onClick 写法要求客户端上下文，
 * page.tsx 是服务端组件，故抽成本组件（唯一目的：承载事件）。
 */
export default function HeroCTA() {
	return (
		<div className="mt-9 flex flex-wrap items-center gap-3">
			<Link
				href="/archive/"
				className="group inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-signal)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b0d11] transition hover:brightness-110"
			>
				浏览全部档案
				<span className="transition-transform group-hover:translate-x-0.5">▸</span>
			</Link>
			<button
				onClick={() => window.dispatchEvent(new CustomEvent("raos:open-palette"))}
				className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-white/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70 transition hover:border-white/45 hover:text-white"
			>
				⌘K 检索
			</button>
		</div>
	);
}

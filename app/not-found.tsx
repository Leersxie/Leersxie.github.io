import Link from "next/link";

/** v6 §4：404 重做——去渐变（信号色 0）、去居中堆叠（左对齐编辑式版式） */
export default function NotFound() {
	return (
		<div className="flex min-h-[70vh] items-center px-6">
			<div className="mx-auto w-full max-w-6xl">
				<p className="mono-tag mb-4">// ERROR 404 · SIGNAL LOST</p>
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-12">
					<h1 className="type-pressed font-display text-[clamp(6rem,18vw,14rem)] font-bold leading-[0.8] tracking-[-0.05em]">
						4<span className="text-[var(--color-signal)]">0</span>4
					</h1>
					<div className="max-w-sm pb-3">
						<p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
							请求的档案不存在，或已在一次重构中被移入深海。
						</p>
						<p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
							LAST KNOWN POSITION: /
						</p>
					</div>
				</div>
				<div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--color-line)] pt-6">
					<Link
						href="/"
						className="rounded-[var(--radius-pill)] bg-[var(--color-signal)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b0d11] transition hover:brightness-110"
					>
						▸ 返回首页
					</Link>
					<Link
						href="/archive/"
						className="rounded-[var(--radius-pill)] border border-[var(--color-line)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition hover:border-[var(--color-data)] hover:text-[var(--color-data)]"
					>
						去档案库
					</Link>
				</div>
			</div>
		</div>
	);
}

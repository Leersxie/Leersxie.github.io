/** v6 S1 Step 2：页面收尾结构——「继续浏览」+ RSS/留言 CTA，填掉子页下方空白 */
export default function PageFooterBlock({
	next,
}: {
	next?: { href: string; label: string; tag: string };
}) {
	return (
		<section className="mx-auto mt-24 max-w-6xl px-6 pb-16">
			<div className="mb-6 flex items-center gap-4">
				<span className="font-mono text-[9px] tracking-[0.2em] text-[var(--color-muted)]">+</span>
				<div className="h-px flex-1 [background:repeating-linear-gradient(90deg,var(--color-line-strong)_0_1px,transparent_1px_8px)]" />
			</div>
			<div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
				<div>
					<p className="mono-tag mb-2">// CONTINUE</p>
					{next ? (
						<a href={next.href} className="group inline-flex items-baseline gap-3">
							<span className="font-serif text-2xl tracking-[-0.02em] transition-colors group-hover:text-[var(--color-signal)]">
								{next.label}
							</span>
							<span className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)]">
								{next.tag}
							</span>
							<span className="font-mono text-sm text-[var(--color-signal)] transition-transform group-hover:translate-x-1">▸</span>
						</a>
					) : (
						<p className="font-mono text-sm text-[var(--color-muted)]">已到最后一页。</p>
					)}
				</div>
				<div className="flex gap-2">
					<a href="/rss.xml" className="rounded-[var(--radius-pill)] border border-[var(--color-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]">RSS</a>
					<a href="/guestbook/" className="rounded-[var(--radius-pill)] border border-[var(--color-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]">留言</a>
				</div>
			</div>
		</section>
	);
}

import type { Metadata } from "next";

import { friendsData } from "@/lib/data";

export const metadata: Metadata = { title: "友链" };

export default function FriendsPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-12">
			<p className="mono-tag mb-2">// EXTERNAL LINKS</p>
			<h1 className="font-display text-3xl font-bold tracking-[-0.025em] leading-[1.05]">友链</h1>
			<p className="mt-2 text-sm text-[var(--color-ink-soft)]">
				想交换友链？去留言板说一声就行。
			</p>
			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				{friendsData.map((f) => (
					<a
						key={f.title}
						href={f.url}
						target="_blank"
						rel="noreferrer"
						className="archive-card group flex items-center gap-4 p-4 no-underline"
					>
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-menu)] bg-[var(--color-brand-dim)] font-display font-bold text-[var(--color-brand)]">
							{f.title[0]}
						</div>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold">{f.title}</p>
							<p className="truncate text-xs text-[var(--color-muted)]">
								{f.desc}
							</p>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

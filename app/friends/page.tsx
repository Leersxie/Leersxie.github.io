import type { Metadata } from "next";

import Stat from "@/components/Stat";
import { friendsData } from "@/lib/data";

export const metadata: Metadata = { title: "友链" };

export default function FriendsPage() {
	return (
		<div className="px-6 py-12">
			{/* B3-4：子页头部双栏 */}
			<header className="mx-auto max-w-6xl">
				<div className="grid gap-8 border-b border-[var(--color-line)] pb-8 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
					<div>
						<p className="mono-tag mb-2">// EXTERNAL LINKS</p>
						<h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
							友链
						</h1>
						<p className="mt-3 text-sm text-[var(--color-ink-soft)]">
							想交换友链？去留言板说一声就行。
						</p>
					</div>
					<div className="flex items-end gap-8">
						<Stat label="LINKS" value={friendsData.length} />
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-6xl">
				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{friendsData.map((f) => (
						<a
							key={f.title}
							href={f.url}
							target="_blank"
							rel="noreferrer"
							className="archive-card group flex items-center gap-3.5 p-4 no-underline"
						>
							{/* B4-3：几何徽记替代单字母渐变块 */}
							<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--radius-menu)] border border-[var(--color-line)] bg-[var(--color-panel-2)]">
								<span className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-semibold text-[var(--color-ink)]">
									{f.title[0]}
								</span>
								<span className="absolute -bottom-2.5 -right-2.5 h-4 w-4 rotate-45 bg-[var(--color-brand)]/25" />
								<span className="absolute left-0 top-0 h-[2px] w-4 bg-[var(--color-brand)]/60" />
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium transition-colors group-hover:text-[var(--color-brand)]">
									{f.title}
								</p>
								<p className="truncate text-xs text-[var(--color-muted)]">
									{f.desc}
								</p>
							</div>
						</a>
					))}
				</div>
			</div>
		</div>
	);
}

import type { Metadata } from "next";
import Link from "next/link";

import { docId, getPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "归档" };

export default async function ArchivePage() {
	const posts = await getPosts();
	const byYear = new Map<string, typeof posts>();
	for (const p of posts) {
		const year = p.published.slice(0, 4);
		if (!byYear.has(year)) byYear.set(year, []);
		byYear.get(year)!.push(p);
	}

	return (
		<div className="mx-auto max-w-3xl px-6 py-12">
			<p className="mono-tag mb-2">// OPERATION LOG</p>
			<h1 className="font-display text-3xl font-bold tracking-[-0.025em] leading-[1.05]">归档 · 作战记录</h1>

			{[...byYear.entries()].map(([year, list]) => (
				<section key={year} className="mt-10">
					<h2 className="font-display text-2xl font-bold text-[var(--color-muted)]">
						{year}
					</h2>
					<ul className="mt-4 space-y-1">
						{list.map((p) => (
							<li key={p.slug}>
								<Link
									href={p.permalink ? `/${p.permalink}/` : `/posts/${p.slug}/`}
									className="group flex items-baseline gap-4 rounded-[var(--radius-menu)] px-3 py-2.5 transition-colors hover:bg-[var(--color-panel-2)]"
								>
									<span className="font-mono text-xs tabular-nums text-[var(--color-muted)]">
										{p.published.slice(5)}
									</span>
									<span className="truncate text-sm font-medium transition-colors group-hover:text-[var(--color-brand)]">
										{p.title}
									</span>
									<span className="mono-tag ml-auto hidden sm:inline">
										{docId(p)}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			))}
			{posts.length === 0 && (
				<p className="mt-10 font-mono text-sm text-[var(--color-muted)]">
					暂无公开档案。
				</p>
			)}
		</div>
	);
}

import type { Metadata } from "next";

import { projectsData } from "@/lib/data";

export const metadata: Metadata = { title: "项目" };

export default function ProjectsPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-12">
			<p className="mono-tag mb-2">// WORKBENCH</p>
			<h1 className="font-display text-3xl font-bold tracking-[-0.025em] leading-[1.05]">项目工作台</h1>
			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				{projectsData.map((p) => (
					<a
						key={p.title}
						href={p.url}
						target="_blank"
						rel="noreferrer"
						className="archive-card group flex flex-col p-5 no-underline"
					>
						<div className="mb-3 flex items-center justify-between">
							<h2 className="font-semibold">{p.title}</h2>
							<span
								className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
									p.status === "进行中"
										? "bg-[var(--color-brand-dim)] text-[var(--color-brand)]"
										: "border border-[var(--color-line)] text-[var(--color-muted)]"
								}`}
							>
								{p.status}
							</span>
						</div>
						<p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
							{p.desc}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							{p.tags.map((t) => (
								<span
									key={t}
									className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)]"
								>
									{t}
								</span>
							))}
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

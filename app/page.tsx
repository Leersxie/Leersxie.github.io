import Link from "next/link";

import RollingNumber from "@/components/RollingNumber";
import TypeLine from "@/components/TypeLine";
import { docId, getPosts, postPath, type Post } from "@/lib/posts";

function ArchiveCard({ post, index }: { post: Post; index: number }) {
	return (
		<Link
			href={postPath(post)}
			className="archive-card group flex flex-col rounded-xl p-5"
			style={{ animationDelay: `${index * 60}ms` }}
		>
			<div className="mb-3 flex items-center justify-between">
				<span className="mono-tag">{docId(post)}</span>
				<span className="font-mono text-[10px] text-[var(--color-muted)]">
					{post.published}
				</span>
			</div>
			<h2 className="mb-2 font-semibold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-primary-deep)]">
				{post.title}
			</h2>
			<p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
				{post.description}
			</p>
			<div className="mt-auto flex items-center gap-2">
				{post.tags.slice(0, 3).map((tag) => (
					<span
						key={tag}
						className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)]"
					>
						{tag}
					</span>
				))}
				<span className="ml-auto font-mono text-xs text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
					OPEN ▸
				</span>
			</div>
		</Link>
	);
}

export default async function HomePage() {
	const posts = await getPosts();
	const totalWords = posts.reduce((acc, p) => acc + p.wordCount, 0);
	const categories = new Set(posts.map((p) => p.category));

	return (
		<div>
			{/* —— 英雄区：档案阵列环境 —— */}
			<section className="relative overflow-hidden border-b border-[var(--color-line)]">
				<div className="os-grid absolute inset-0" aria-hidden />
				<div className="relative mx-auto max-w-5xl px-6 pb-14 pt-16">
					<TypeLine
						lines={[
							"欢迎访问 LX 的档案库。这里存放随笔、项目与记录。",
							"RHINE ARCHIVE OS v2 · 系统就绪 · 全部档案可检索（⌘K）",
							"读你想读的，剩下的交给时间。",
						]}
					/>
					<h1 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-6xl">
						RHINE ARCHIVE
						<span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-indigo-line)] bg-clip-text text-transparent">
							{" "}
							OS
						</span>
					</h1>
					<p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-ink-soft)]">
						{`把思考归档成可以被再次找到的东西。玄学、项目、生活记录，都在这份阵列里。`}
					</p>

					<div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
						{[
							{ label: "ARCHIVES", value: posts.length },
							{ label: "WORDS", value: totalWords },
							{ label: "CATEGORIES", value: categories.size },
						].map((s) => (
							<div key={s.label}>
								<p className="font-display text-2xl font-bold">
									<RollingNumber value={s.value} />
								</p>
								<p className="mono-tag">{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* —— 档案阵列 —— */}
			<section className="mx-auto max-w-5xl px-6 py-12">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className="mono-tag">// ARCHIVE ARRAY</p>
						<h2 className="font-display text-xl font-bold">档案阵列</h2>
					</div>
					<Link
						href="/archive/"
						className="font-mono text-xs text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
					>
						全部记录 ▸
					</Link>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post, i) => (
						<ArchiveCard key={post.slug} post={post} index={i} />
					))}
					{posts.length === 0 && (
						<p className="font-mono text-sm text-[var(--color-muted)]">
							暂无公开档案。NO RECORDS YET.
						</p>
					)}
				</div>
			</section>
		</div>
	);
}

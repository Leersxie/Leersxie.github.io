import Link from "next/link";

import DecryptText from "@/components/DecryptText";
import HeroVisual from "@/components/HeroVisual";
import Reveal from "@/components/Reveal";
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
				<DecryptText text={post.title} />
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
			{/* —— 英雄区：三维档案阵列（CSS 兜底 + Three.js 玻璃接管）—— */}
			<section className="relative overflow-hidden border-b border-[var(--color-line)]">
				<HeroVisual labels={posts.map((p) => p.title)} />
				<div className="os-grid absolute inset-0 opacity-60" aria-hidden />
				{/* 几何装饰：四角十字 + 角注 */}
				<span className="absolute left-4 top-4 font-mono text-xs text-[var(--color-line-strong)]" aria-hidden>+</span>
				<span className="absolute right-4 top-4 font-mono text-xs text-[var(--color-line-strong)]" aria-hidden>+</span>
				<span className="absolute bottom-4 left-4 font-mono text-xs text-[var(--color-line-strong)]" aria-hidden>+</span>
				<span className="absolute bottom-4 right-4 font-mono text-xs text-[var(--color-line-strong)]" aria-hidden>+</span>
				<p className="mono-tag absolute right-8 top-5 hidden md:block">SYS.VER 2.0 // STABLE</p>
				<p className="mono-tag absolute bottom-5 left-8 hidden md:block">ARRAY.ACTIVE · 15 UNITS</p>
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
							<h2 className="font-display text-xl font-bold">
								<DecryptText text="档案阵列" autoplay />
							</h2>
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
						<Reveal key={post.slug} delay={i * 70}>
							<ArchiveCard post={post} index={i} />
						</Reveal>
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

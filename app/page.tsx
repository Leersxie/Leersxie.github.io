import Link from "next/link";

import DecryptText from "@/components/DecryptText";
import HeroCTA from "@/components/HeroCTA";
import HeroVisual from "@/components/HeroVisual";
import Reveal from "@/components/Reveal";
import RollingNumber from "@/components/RollingNumber";
import TypeLine from "@/components/TypeLine";
import { docId, getPosts, postPath, type Post } from "@/lib/posts";

function ArchiveCard({ post, index }: { post: Post; index: number }) {
	return (
		<Link
			href={postPath(post)}
			className="archive-card group flex flex-col p-5"
			style={{ animationDelay: `${index * 60}ms` }}
		>
			<div className="mb-3 flex items-center justify-between">
				<span className="mono-tag">{docId(post)}</span>
				<span className="font-mono text-[10px] text-[var(--color-muted)]">
					{post.published}
				</span>
			</div>
			<h2 className="mb-2 font-semibold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-brand)]">
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
				<span className="ml-auto font-mono text-xs text-[var(--color-brand)] opacity-0 transition-opacity group-hover:opacity-100">
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
			{/* —— B3-1 英雄区三段式：状态带 / 主体（阵列剪影+雾化带+数据+CTA）/ 刻度线 —— */}
			<section className="hero-panel relative overflow-x-clip border-b border-[var(--color-line)]">
				<HeroVisual labels={posts.map((p) => p.title)} forceDark />

				{/* 雾化带：保护标题可读性 */}
				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(to_top,#141227_12%,rgb(20_18_39/0.86)_46%,transparent_100%)]"
					aria-hidden
				/>

				{/* 融球色块：移到右上外沿，不穿标题 */}
				<div
					className="blob-morph pointer-events-none absolute -right-28 -top-20 h-80 w-80 bg-[var(--color-brand)]/10 blur-[48px]"
					aria-hidden
				/>

				{/* 四角准星 */}
				{["left-5 top-5", "right-5 top-5", "left-5 bottom-5", "right-5 bottom-5"].map((p) => (
					<span key={p} className={`absolute ${p} font-mono text-xs text-white/20`} aria-hidden>+</span>
				))}

				{/* 顶部状态带 */}
				<div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-5">
					<span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
						<span className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)] shadow-[0_0_8px_var(--color-signal)]" />
						SYS.ONLINE
					</span>
					<span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
						ARCHIVE / HOME
					</span>
				</div>

				{/* 主体 */}
				<div className="relative mx-auto max-w-6xl px-6 pb-14 pt-14">
					<TypeLine
						lines={[
							"欢迎访问 LX 的档案库。这里存放随笔、项目与记录。",
							"RHINE ARCHIVE OS v2 · 系统就绪 · 全部档案可检索（⌘K）",
							"读你想读的，剩下的交给时间。",
						]}
					/>

					<h1 className="mt-5 font-display text-[clamp(1.9rem,7vw,4.5rem)] font-normal leading-[0.94] tracking-[-0.03em] text-white">
						RHINE
						<span className="bg-gradient-to-r from-[var(--color-brand-soft)] to-[#7ea2ff] bg-clip-text text-transparent">
							{" "}
							ARCHIVE OS
						</span>
					</h1>

					<p className="mt-4 max-w-lg text-sm leading-[1.75] text-[#aab4e0]">
						{`把思考归档成可以被再次找到的东西。玄学、项目、生活记录，都在这份阵列里。`}
					</p>

					{/* 数据三件套 */}
					<div className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-4">
						{[
							{ label: "ARCHIVES", value: posts.length },
							{ label: "WORDS", value: totalWords },
							{ label: "CATEGORIES", value: categories.size },
						].map((s) => (
							<div key={s.label} className="flex flex-col gap-1">
								<span className="font-display text-[2rem] font-semibold leading-none tabular-nums text-white">
									<RollingNumber value={s.value} />
								</span>
								<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
									{s.label}
								</span>
							</div>
						))}
					</div>

						{/* CTA 双按钮（客户端组件：⌘K 事件桥接见 HeroCTA.tsx） */}
					<HeroCTA />
				</div>

				{/* 底部刻度线 */}
				<div className="relative mx-auto flex max-w-6xl items-center gap-4 px-6 pb-6">
					<span className="font-mono text-[9px] tracking-[0.2em] text-white/25">+</span>
					<div className="h-px flex-1 [background:repeating-linear-gradient(90deg,rgb(255_255_255/0.22)_0_1px,transparent_1px_8px)]" />
					<span className="font-mono text-[9px] tracking-[0.2em] text-white/25">
						ARRAY.ACTIVE · {posts.length} UNITS
					</span>
					<div className="h-px w-16 [background:repeating-linear-gradient(90deg,rgb(255_255_255/0.22)_0_1px,transparent_1px_8px)]" />
					<span className="font-mono text-[9px] tracking-[0.2em] text-white/25">+</span>
				</div>
			</section>

			{/* —— 档案阵列 —— */}
			<section className="mx-auto max-w-5xl px-6 py-12">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<p className="mono-tag">// ARCHIVE ARRAY</p>
						<h2 className="font-display text-xl font-bold tracking-[-0.02em]">
							<DecryptText text="档案阵列" autoplay />
						</h2>
					</div>
					<Link
						href="/archive/"
						className="font-mono text-xs text-[var(--color-muted)] transition hover:text-[var(--color-brand)]"
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

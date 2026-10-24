import Link from "next/link";

import DecryptText from "@/components/DecryptText";
import HeroCTA from "@/components/HeroCTA";
import DotFieldBackdrop from "@/components/DotFieldBackdrop";
import HeroVisual from "@/components/HeroVisual";
import Reveal from "@/components/Reveal";
import RollingNumber from "@/components/RollingNumber";
import TypeLine from "@/components/TypeLine";
import { docId, getPosts, postPath, type Post } from "@/lib/posts";

function ArchiveCard({ post }: { post: Post }) {
	return (
		<Link
			href={postPath(post)}
			className="archive-card group flex h-full flex-col p-5"
		>
			{/* 元数据：极小 + 极淡 + 大字距（B4-2 悬崖式落差） */}
			<div className="mb-3 flex items-center justify-between">
				<span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)]/60">
					{docId(post)}
				</span>
				<span className="font-mono text-[10px] tabular-nums text-[var(--color-muted)]/60">
					{post.published}
				</span>
			</div>

			{/* 标题：大 + 重 + 高对比 */}
			<h2 className="mb-2 text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-brand)]">
				<DecryptText text={post.title} />
			</h2>

			{/* 摘要：小 + 淡 */}
			<p className="mb-5 line-clamp-2 text-[13px] leading-[1.65] text-[var(--color-ink-soft)]/75">
				{post.description}
			</p>

			{/* 底部：标签常驻 + 箭头只做位移（触屏也能看见） */}
			<div className="mt-auto flex items-center gap-1.5">
				{post.tags.slice(0, 3).map((tag) => (
					<span
						key={tag}
						className="rounded-[var(--radius-tag)] border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)]"
					>
						{tag}
					</span>
				))}
				<span className="ml-auto font-mono text-xs text-[var(--color-brand)] opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
					▸
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
				{/* B6：Dot Field 点阵透镜（移动端降级为无交互） */}
				<DotFieldBackdrop dark />

				{/* 雾化带：保护标题可读性 */}
				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(to_top,#141227_12%,rgb(20_18_39/0.86)_46%,transparent_100%)]"
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
							"终端已连接。当前档案库包含随笔、项目与记录。",
							"RHINE ARCHIVE OS v2 · 系统就绪 · 全部档案可检索（⌘K）",
							"检索索引已建立。输入关键词，或直接开始阅读。",
						]}
					/>

					<h1
						className="type-pressed mt-5 font-serif text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-white"
					>
						RHINE ARCHIVE OS
						<span className="text-[var(--color-signal)]">.</span>
					</h1>

					<p className="mt-4 max-w-lg text-sm leading-[1.75] text-[#aab4e0]">
						{`把思考归档成可以被再次找到的东西。`}
					</p>

					{/* 数据三件套 */}
					{/* v5 5.5：仪表读数——数据是小字等宽，排在角落 */}
					<div className="mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3 font-mono">
						{[
							{ k: "ARCH", v: posts.length },
							{ k: "WORD", v: totalWords },
							{ k: "CATG", v: categories.size },
						].map((s) => (
							<span key={s.k} className="inline-flex items-baseline gap-1.5">
								<span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
									{s.k}
								</span>
								<span className="text-sm tabular-nums text-white/70">
									{String(s.v).padStart(2, "0")}
								</span>
							</span>
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
			<section className="mx-auto max-w-6xl px-6 py-12">
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
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{posts.map((post, i) => (
						<Reveal key={post.slug} delay={i * 110}>
							<div style={{ marginTop: i % 3 === 1 ? "20px" : i % 3 === 2 ? "10px" : 0 }}>
								<ArchiveCard post={post} />
							</div>
						</Reveal>
					))}
					{/* B4-1：档案位待写入的占位卡——把「内容少」翻译成世界观 */}
					{Array.from({ length: Math.max(0, 6 - posts.length) }).map((_, i) => (
						<div
							key={"ph-" + i}
							className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)] p-5 opacity-50"
							aria-hidden
						>
							<div className="mb-3 flex items-center justify-between">
								<span className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-muted)]">
									DOC.——-PENDING
								</span>
							</div>
							<p className="mb-1 font-mono text-sm text-[var(--color-muted)]">NO RECORD</p>
							<p className="mb-4 font-mono text-[11px] leading-relaxed text-[var(--color-muted)]/70">
								该档案位尚未写入。
							</p>
							<div className="mt-auto flex gap-2">
								<span className="h-4 w-12 rounded-[var(--radius-tag)] border border-dashed border-[var(--color-line)]" />
								<span className="h-4 w-10 rounded-[var(--radius-tag)] border border-dashed border-[var(--color-line)]" />
							</div>
						</div>
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

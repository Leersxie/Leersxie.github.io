import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Giscus from "@/components/Giscus";
import CoverArt from "@/components/CoverArt";
import ReadingProgress from "@/components/ReadingProgress";
import { docId, getPosts, getPostBySlug, postPath } from "@/lib/posts";

export const dynamicParams = false;

export async function generateStaticParams() {
	const posts = await getPosts();
	return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) return {};
	return {
		title: post.title,
		description: post.description,
		alternates: { canonical: postPath(post) },
	};
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) notFound();

	const all = await getPosts();
	const idx = all.findIndex((p) => p.slug === slug);
	const newer = idx > 0 ? all[idx - 1] : null;
	const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

	return (
		<article className="mx-auto max-w-3xl px-6 py-12">
			<ReadingProgress />
			<header className="mb-10">
				<p className="mono-tag mb-3">{docId(post)} // ARCHIVED</p>
				<h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
					{post.title}
				</h1>
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
					<span className="font-mono text-xs text-[var(--color-muted)]">
						{post.published}
					</span>
					<span className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-ink-soft)]">
						{post.category}
					</span>
					{post.tags.map((t) => (
						<span
							key={t}
							className="font-mono text-[10px] text-[var(--color-brand)]"
						>
							#{t}
						</span>
					))}
					<span className="font-mono text-xs text-[var(--color-muted)]">
						{post.wordCount.toLocaleString()} 字
					</span>
				</div>
				<hr className="mt-8 border-dashed border-[var(--color-line-strong)]" />
			</header>

			{post.cover ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={post.cover}
					alt=""
					className="mb-10 w-full rounded-[var(--radius-card)] border border-[var(--color-line)]"
				/>
			) : (
				<CoverArt slug={post.slug} title={post.title} published={post.published} />
			)}

			<div
				className="prose-os"
				dangerouslySetInnerHTML={{ __html: post.html ?? "" }}
			/>

			<nav className="mt-16 grid gap-3 border-t border-[var(--color-line)] pt-6 sm:grid-cols-2">
				{older ? (
					<Link
						href={postPath(older)}
						className="archive-card p-4 no-underline"
					>
						<p className="mono-tag mb-1">◂ PREV</p>
						<p className="truncate text-sm font-medium">{older.title}</p>
					</Link>
				) : (
					<span />
				)}
				{newer && (
					<Link
						href={postPath(newer)}
						className="archive-card p-4 text-right no-underline sm:col-start-2"
					>
						<p className="mono-tag mb-1">NEXT ▸</p>
						<p className="truncate text-sm font-medium">{newer.title}</p>
					</Link>
				)}
			</nav>

			<Giscus />
		</article>
	);
}

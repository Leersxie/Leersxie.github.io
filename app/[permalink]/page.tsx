import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FlipText from "@/components/FlipText";
import Giscus from "@/components/Giscus";
import { docId, getAllPostsRaw, getPostBySlug, isProd } from "@/lib/posts";

/**
 * 旧站兼容路由：frontmatter 带 permalink 的文章（如留言板 /guestbook/）。
 * giscus 的讨论按 pathname 绑定，规范地址必须与旧站一致，评论才不丢。
 */
export const dynamicParams = false;

export async function generateStaticParams() {
	const posts = await getAllPostsRaw();
	return posts
		.filter((p) => p.permalink && (!p.draft || !isProd()))
		.map((p) => ({ permalink: p.permalink as string }));
}

async function resolve(permalink: string) {
	const posts = await getAllPostsRaw();
	const post = posts.find((p) => p.permalink === permalink);
	if (!post || (post.draft && isProd())) return null;
	return getPostBySlug(post.slug);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ permalink: string }>;
}): Promise<Metadata> {
	const { permalink } = await params;
	const post = await resolve(permalink);
	if (!post) return {};
	return { title: post.title, description: post.description };
}

export default async function PermalinkPostPage({
	params,
}: {
	params: Promise<{ permalink: string }>;
}) {
	const { permalink } = await params;
	const post = await resolve(permalink);
	if (!post) notFound();

	// v6 A1：permalink 路由与 /posts/* 同款双栏 + TOC（guestbook 走这条路由）
	const toc = (post.html ?? "")
		.match(/<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/g)
		?.map((m) => {
			const id = m.match(/id="([^"]+)"/)?.[1] ?? "";
			const text = m
				.replace(/<[^>]+>/g, "")
				.replace(/<h2[^>]*>|<\/h2>/g, "");
			return { id, text, level: 2 };
		})
		?? [];

	return (
		<div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_200px]">
			<article className="min-w-0">
				<header className="mb-10">
					<p className="mono-tag mb-3">
						<FlipText text={docId(post)} duration={0.7} /> // ARCHIVED
					</p>
					<h1 className="font-serif text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-4xl">
						{post.title}
					</h1>
					<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
						<span className="font-mono text-xs text-[var(--color-muted)]">
							{post.published}
						</span>
						{post.tags.map((t) => (
							<span
								key={t}
								className="font-mono text-[10px] text-[var(--color-brand)]"
							>
								#{t}
							</span>
						))}
					</div>
					<hr className="mt-8 border-dashed border-[var(--color-line-strong)]" />
				</header>
				<div
					className="prose-os"
					dangerouslySetInnerHTML={{ __html: post.html ?? "" }}
				/>
				<Giscus />
			</article>

			{toc.length > 2 && (
				<aside className="hidden lg:block">
					<div className="sticky top-20">
						<p className="mono-tag mb-3">// INDEX</p>
						<nav className="space-y-2 border-l border-[var(--color-line)] pl-3">
							{toc.map((h, i) => (
								<a
									key={h.id}
									href={`#${h.id}`}
									className="group flex gap-2 text-xs leading-snug text-[var(--color-muted)] transition hover:text-[var(--color-brand)]"
								>
									<span className="font-mono text-[9px] opacity-50">
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="line-clamp-2">{h.text}</span>
								</a>
							))}
						</nav>
					</div>
				</aside>
			)}
		</div>
	);
}

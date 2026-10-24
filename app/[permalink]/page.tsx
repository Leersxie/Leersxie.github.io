import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

	return (
		<article className="mx-auto max-w-3xl px-6 py-12">
			<header className="mb-10">
				<p className="mono-tag mb-3">{docId(post)} // ARCHIVED</p>
				<h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
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
	);
}

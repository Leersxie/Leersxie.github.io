import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const CONTENT_DIR = path.join(process.cwd(), "content", "posts");

export interface Post {
	slug: string;
	title: string;
	description: string;
	published: string;
	category: string;
	tags: string[];
	draft: boolean;
	/** frontmatter.permalink：旧站兼容，规范地址为 /<permalink>/ */
	permalink?: string;
	/** frontmatter.cover：封面图 URL（可选） */
	cover?: string;
	/** 渲染后的 HTML */
	html?: string;
	wordCount: number;
}

export function isProd(): boolean {
	return process.env.NODE_ENV === "production";
}

export async function getAllPostsRaw(): Promise<Post[]> {
	const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith(".md"));
	const posts: Post[] = [];
	for (const file of files) {
		const raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
		const { data, content } = matter(raw);
		posts.push({
			slug: file.replace(/\.md$/, ""),
			title: String(data.title ?? file),
			description: String(data.description ?? ""),
			published: data.published
				? new Date(data.published).toISOString().slice(0, 10)
				: "1970-01-01",
			category: String(data.category ?? "未分类"),
			tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
			draft: data.draft === true,
			permalink: data.permalink ? String(data.permalink) : undefined,
			cover: data.cover ? String(data.cover) : undefined,
			wordCount: content.replace(/\s/g, "").length,
		});
	}
	return posts.sort((a, b) => b.published.localeCompare(a.published));
}

export async function getPosts(): Promise<Post[]> {
	return (await getAllPostsRaw()).filter((p) => !p.draft || !isProd());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
	const posts = await getAllPostsRaw();
	const meta = posts.find((p) => p.slug === slug);
	if (!meta) return null;
	if (meta.draft && isProd()) return null;

	const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), "utf8");
	const { content } = matter(raw);
	const html = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeHighlight, { detect: true, ignoreMissing: true })
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(content);
	return { ...meta, html: String(html) };
}

/** 用于 giscus 与旧站 URL 兼容：规范地址为 /posts/<slug>/ 或 /<permalink>/ */
export function postPath(post: Post): string {
	return post.permalink ? `/${post.permalink}/` : `/posts/${post.slug}/`;
}

export function docId(post: Post): string {
	return `DOC.${post.published.replaceAll("-", "").slice(2)}-${post.slug
		.replace(/[^a-z0-9]/gi, "")
		.slice(0, 6)
		.toUpperCase()}`;
}

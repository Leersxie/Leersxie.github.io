import type { MetadataRoute } from "next";

import { getPosts, postPath } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getPosts();
	const staticPages = ["", "/archive/", "/projects/", "/friends/", "/about/"];
	return [
		...staticPages.map((p) => ({
			url: `${SITE.url}${p}`,
			lastModified: new Date(),
		})),
		...posts.map((p) => ({
			url: `${SITE.url}${postPath(p)}`,
			lastModified: new Date(p.published),
		})),
	];
}

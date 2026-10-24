import { getPosts, postPath } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(s: string): string {
	return s
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

export async function GET() {
	const posts = await getPosts();
	const items = posts
		.map(
			(p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE.url}${postPath(p)}</link>
      <guid>${SITE.url}${postPath(p)}</guid>
      <pubDate>${new Date(p.published).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`,
		)
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}

import type { APIRoute } from "astro";

/**
 * robots.txt
 *
 * 策略说明：
 * - 默认允许抓取全站。此前使用 `Disallow: /` + 少量 `Allow` 的写法，
 *   会连带屏蔽 /about/、/friends/、/archive/、RSS 订阅以及文章的自定义 permalink，
 *   而 sitemap 又会把这些 URL 提交给搜索引擎，属于「提交却禁止抓取」的矛盾配置。
 * - 仅排除无需收录的运行时数据接口与按需生成的图片资源。
 */
const robotsTxt = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /og/

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};

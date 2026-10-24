import type { Metadata } from "next";

import AppShell from "@/components/AppShell";
import BootSequence from "@/components/BootSequence";
import { getPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: {
		default: `${SITE.name} · ${SITE.osName}`,
		template: `%s · ${SITE.name}`,
	},
	description: SITE.description,
	openGraph: {
		type: "website",
		siteName: SITE.name,
		url: SITE.url,
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const posts = await getPosts();
	const shellPosts = posts.map((p) => ({
		slug: p.slug,
		title: p.title,
		published: p.published,
	}));
	return (
		<html lang="zh-CN" className="dark">
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `try{var t=localStorage.getItem("raos-theme")||"dark";if(t==="light")document.documentElement.classList.remove("dark");}catch(e){}`,
					}}
				/>
			</head>
			<body>
				<BootSequence />
				<AppShell posts={shellPosts}>{children}</AppShell>
			</body>
		</html>
	);
}

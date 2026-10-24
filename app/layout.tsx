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
				{/* v5 P0-1：全站噪点材质（单层 fixed，overlay 混合） */}
				<div className="grain-paper" aria-hidden />
				{/* v5 P1 2.2：活字压印滤镜（只给 h1 类静态大字用，scale≤5） */}
				<svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
					<filter id="press" x="-5%" y="-5%" width="110%" height="110%">
						<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="7" result="n" />
						<feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
					</filter>
				</svg>
				<BootSequence />
				<AppShell posts={shellPosts}>{children}</AppShell>
			</body>
		</html>
	);
}

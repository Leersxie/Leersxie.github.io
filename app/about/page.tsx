import type { Metadata } from "next";

import PageFooterBlock from "@/components/PageFooterBlock";
import Stat from "@/components/Stat";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "关于" };

/** v6 B6：关于页加「本站数据」四栏仪表 + 双栏头部，撑起信息量 */
export default async function AboutPage() {
	const posts = await getPosts();
	const totalWords = posts.reduce((acc, p) => acc + p.wordCount, 0);
	const categories = new Set(posts.map((p) => p.category));

	return (
		<div className="px-6 py-12">
			<header className="mx-auto max-w-6xl">
				<div className="grid gap-8 border-b border-[var(--color-line)] pb-8 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
					<div>
						<p className="mono-tag mb-2">// OPERATOR PROFILE</p>
						<h1 className="page-title">关于 LX</h1>
					</div>
					<div className="flex items-end gap-8">
						<Stat label="ARCHIVES" value={posts.length} />
						<Stat label="WORDS" value={totalWords.toLocaleString()} />
						<Stat label="CATG" value={categories.size} />
					</div>
				</div>
			</header>

			<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
				<div className="prose-os mt-10 min-w-0">
					<p>
						你好，我是 <strong>Leersxie</strong>（简称 LX）。不常在线。
					</p>
					<p>喜欢化学，对心理学感兴趣，喜欢琢磨相关的知识。</p>
					<p>原 UTPV 制作者，现在慢慢转为文字 PV 创作；游戏喜欢 RTS 类型。</p>
					<p>混的圈子很杂，有点神经，说话诡异。差不多就是这些。</p>
				</div>

				<aside className="mt-10 space-y-6">
					<div className="border border-[var(--color-line)] rounded-[var(--radius-card)] p-5">
						<p className="mono-tag mb-3">// CONTACT</p>
						<ul className="space-y-1.5 font-mono text-xs">
							<li>
								GitHub →{" "}
								<a
									className="text-[var(--color-data)] hover:underline"
									href="https://github.com/leersxie"
									target="_blank"
									rel="noreferrer"
								>
									github.com/leersxie
								</a>
							</li>
							<li>
								Bilibili →{" "}
								<a
									className="text-[var(--color-data)] hover:underline"
									href="https://space.bilibili.com/691200956"
									target="_blank"
									rel="noreferrer"
								>
									@萘燕书则1145
								</a>
							</li>
						</ul>
					</div>

					<div className="border border-[var(--color-line)] rounded-[var(--radius-card)] p-5">
						<p className="mono-tag mb-3">// SYSTEM</p>
						<dl className="space-y-2 font-mono text-[11px] text-[var(--color-muted)]">
							<div className="flex justify-between">
								<dt>OS</dt>
								<dd className="text-[var(--color-ink-soft)]">RHINE ARCHIVE v2</dd>
							</div>
							<div className="flex justify-between">
								<dt>STACK</dt>
								<dd className="text-[var(--color-ink-soft)]">Next.js 15 · React 19</dd>
							</div>
							<div className="flex justify-between">
								<dt>TYPE</dt>
								<dd className="text-[var(--color-ink-soft)]">Jost · Serif · Mono</dd>
							</div>
							<div className="flex justify-between">
								<dt>HOST</dt>
								<dd className="text-[var(--color-ink-soft)]">GitHub Pages</dd>
							</div>
						</dl>
					</div>
				</aside>
			</div>

			<PageFooterBlock next={{ href: "/", label: "返回首页", tag: "HOME" }} />
		</div>
	);
}

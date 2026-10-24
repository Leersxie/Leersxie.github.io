import type { Metadata } from "next";

export const metadata: Metadata = { title: "关于" };

export default function AboutPage() {
	return (
		<div className="mx-auto max-w-3xl px-6 py-12">
			<p className="mono-tag mb-2">// OPERATOR PROFILE</p>
			<h1 className="font-display text-3xl font-bold tracking-[-0.025em] leading-[1.05]">关于 LX</h1>
			<div className="prose-os mt-8">
				<p>
					你好，我是 <strong>Leersxie</strong>（简称 LX）。不常在线。
				</p>
				<p>喜欢化学，对心理学感兴趣，喜欢琢磨相关的知识。</p>
				<p>原 UTPV 制作者，现在慢慢转为文字 PV 创作；游戏喜欢 RTS 类型。</p>
				<p>混的圈子很杂，有点神经，说话诡异。差不多就是这些。</p>
			</div>
			<div className="mt-10 border border-[var(--color-line)] rounded-[var(--radius-card)] p-5">
				<p className="mono-tag mb-3">// CONTACT</p>
				<ul className="space-y-1 font-mono text-xs">
					<li>
						GitHub →{" "}
						<a
							className="text-[var(--color-brand)] hover:underline"
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
							className="text-[var(--color-brand)] hover:underline"
							href="https://space.bilibili.com/691200956"
							target="_blank"
							rel="noreferrer"
						>
							@萘燕书则1145
						</a>
					</li>
				</ul>
			</div>
		</div>
	);
}

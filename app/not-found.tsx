import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
			<p className="mono-tag mb-4">// ERROR 404 · SIGNAL LOST</p>
			<h1 className="font-display text-6xl font-bold tracking-tight md:text-8xl">
				4
				<span className="bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-data)] bg-clip-text text-transparent">
					0
				</span>
				4
			</h1>
			<p className="mt-4 text-sm text-[var(--color-ink-soft)]">
				请求的档案不存在，或已在一次重构中被移入深空。
			</p>
			<Link href="/" className="nav-item mt-8 border border-[var(--color-line)]">
				<span className="font-mono text-xs">▸ 返回首页</span>
			</Link>
		</div>
	);
}

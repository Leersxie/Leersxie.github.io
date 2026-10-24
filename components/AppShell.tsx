"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { NAV_ITEMS, SITE, SOCIALS } from "@/lib/site";
import { isSoundEnabled, playConfirm, playTick, setSoundEnabled } from "@/lib/sound";

export interface ShellPost {
	slug: string;
	title: string;
	published: string;
}

/** 主题初始化：首帧前挂 .dark，避免闪白 */
export function ThemeInitScript() {
	const code = `try{var t=localStorage.getItem("raos-theme")||"dark";if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}`;
	return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

function Icon({ d }: { d: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 shrink-0"
			aria-hidden
		>
			<path d={d} />
		</svg>
	);
}

const NAV_ICONS: Record<string, string> = {
	主页: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
	归档: "M4 7h16M4 7v13h16V7M8 7V4h8v3M9 12h6",
	项目: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
	友链: "M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 19",
	关于: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 12h1v5h1",
};

function Clock() {
	const [now, setNow] = useState<string | null>(null);
	useEffect(() => {
		const tick = () =>
			setNow(
				new Date().toLocaleTimeString("zh-CN", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false,
				}),
			);
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, []);
	return (
		<span className="font-mono text-xs tabular-nums text-[var(--color-muted)]">
			{now ?? "--:--:--"}
		</span>
	);
}

function ThemeToggle() {
	const [dark, setDark] = useState(true);
	useEffect(() => {
		setDark(document.documentElement.classList.contains("dark"));
	}, []);
	const flip = () => {
		const next = !dark;
		setDark(next);
		document.documentElement.classList.toggle("dark", next);
		try {
			localStorage.setItem("raos-theme", next ? "dark" : "light");
		} catch {}
	};
	return (
		<button
			onClick={flip}
			className="nav-item w-full"
			aria-label="切换明暗模式"
		>
			<Icon
				d={
					dark
						? "M12 3v2M12 19v2M5 12H3M21 12h-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
						: "M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"
				}
			/>
			<span>{dark ? "夜间终端" : "日间终端"}</span>
		</button>
	);
}

function CommandPalette({
	open,
	onClose,
	posts,
}: {
	open: boolean;
	onClose: () => void;
	posts: ShellPost[];
}) {
	const [q, setQ] = useState("");
	const results = useMemo(() => {
		const kw = q.trim().toLowerCase();
		const pool = posts.filter((p) => !p.title.includes("私密"));
		return kw
			? pool.filter(
					(p) =>
						p.title.toLowerCase().includes(kw) ||
						p.slug.toLowerCase().includes(kw),
				)
			: pool.slice(0, 8);
	}, [q, posts]);

	useEffect(() => {
		if (!open) setQ("");
	}, [open]);

	if (!open) return null;
	return (
		<div
			className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh] backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="glass-panel w-[min(92vw,560px)] overflow-hidden rounded-xl shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
					<span className="font-mono text-xs text-[var(--color-primary)]">
						▸
					</span>
					<input
						autoFocus
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="检索档案…"
						className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
					/>
					<kbd className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)]">
						ESC
					</kbd>
				</div>
				<ul className="max-h-[50vh] overflow-y-auto p-2">
					{results.length === 0 && (
						<li className="px-3 py-6 text-center font-mono text-xs text-[var(--color-muted)]">
							NO RECORD FOUND
						</li>
					)}
					{results.map((p) => (
						<li key={p.slug}>
							<Link
								href={p.slug === "guestbook" ? "/guestbook/" : `/posts/${p.slug}/`}
								onClick={onClose}
								className="nav-item justify-between"
							>
								<span className="truncate">{p.title}</span>
								<span className="font-mono text-[10px] text-[var(--color-muted)]">
									{p.published}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

function SoundToggle() {
	const [on, setOn] = useState(false);
	useEffect(() => {
		setOn(isSoundEnabled());
	}, []);
	const flip = () => {
		const next = !on;
		setOn(next);
		setSoundEnabled(next);
		if (next) playConfirm();
	};
	return (
		<button onClick={flip} className="nav-item w-full" aria-label="切换界面音效">
			<Icon d={on ? "M4 12h2l2-6 4 12 2-6h6M4 12h2l2-6 4 12 2-6h6" : "M4 9h4l5-4v14l-5-4H4zM17 9l4 6M21 9l-4 6"} />
			<span>{on ? "音效 开" : "音效 关"}</span>
		</button>
	);
}

export default function AppShell({
	posts,
	children,
}: {
	posts: ShellPost[];
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [drawer, setDrawer] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((v) => !v);
			}
			if (e.key === "Escape") setPaletteOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	useEffect(() => {
		setDrawer(false);
	}, [pathname]);

	// 音效：事件委托（进入导航项/档案卡 → tick；点击 → confirm）
	useEffect(() => {
		const over = (e: MouseEvent) => {
			const t = (e.target as HTMLElement).closest?.(
				".nav-item, .archive-card",
			) as HTMLElement | null;
			if (!t) return;
			if (e.relatedTarget && t.contains(e.relatedTarget as Node)) return;
			playTick();
		};
		const click = (e: MouseEvent) => {
			if ((e.target as HTMLElement).closest?.("a, button")) playConfirm();
		};
		document.addEventListener("mouseover", over);
		document.addEventListener("click", click);
		return () => {
			document.removeEventListener("mouseover", over);
			document.removeEventListener("click", click);
		};
	}, []);

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname.startsWith(href);

	const sidebarBody = (
		<>
			<div className="flex items-center gap-2 px-3 py-4">
				<div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-indigo-line)] font-display text-sm font-bold text-white">
					LX
				</div>
				{!collapsed && (
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold">{SITE.name}</p>
						<p className="mono-tag truncate">{SITE.osName}</p>
					</div>
				)}
			</div>

			<nav className="space-y-1 px-2">
				{NAV_ITEMS.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`nav-item ${isActive(item.href) ? "is-active" : ""}`}
						title={item.label}
					>
						<Icon d={NAV_ICONS[item.label] ?? NAV_ICONS["关于"]} />
						{!collapsed && <span>{item.label}</span>}
						{!collapsed && (
							<span className="ml-auto font-mono text-[9px] tracking-widest text-[var(--color-muted)]">
								{item.tag}
							</span>
						)}
					</Link>
				))}
			</nav>

			{!collapsed && (
				<div className="mt-6 min-h-0 flex-1 overflow-y-auto px-2">
					<p className="mono-tag px-3 pb-2">RECENT ARCHIVES</p>
					{posts.slice(0, 6).map((p) => (
						<Link
							key={p.slug}
							href={p.slug === "guestbook" ? "/guestbook/" : `/posts/${p.slug}/`}
							className="nav-item flex-col !items-start !gap-0.5"
						>
							<span className="w-full truncate">{p.title}</span>
							<span className="font-mono text-[10px] text-[var(--color-muted)]">
								{p.published}
							</span>
						</Link>
					))}
				</div>
			)}

			<div className="border-t border-[var(--color-line)] p-2">
				<ThemeToggle />
				<SoundToggle />
				{!collapsed && (
					<div className="flex gap-1 px-2 pt-2">
						{SOCIALS.map((s) => (
							<a
								key={s.label}
								href={s.href}
								target="_blank"
								rel="noreferrer"
								className="nav-item !px-2 !py-1 font-mono text-[10px] uppercase"
							>
								{s.label}
							</a>
						))}
					</div>
				)}
			</div>
		</>
	);

	return (
		<div className="min-h-dvh">
			<ThemeInitScript />

			{/* 桌面侧栏 */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-200 md:flex ${
					collapsed ? "w-14" : "w-64"
				}`}
			>
				{sidebarBody}
				<button
					onClick={() => setCollapsed((v) => !v)}
					className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] text-[10px] text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
					aria-label="折叠侧栏"
				>
					{collapsed ? "▸" : "◂"}
				</button>
			</aside>

			{/* 移动端顶条 + 抽屉 */}
			<div className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-panel)]/90 px-4 py-2.5 backdrop-blur md:hidden">
				<div className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-indigo-line)] font-display text-xs font-bold text-white">
						LX
					</div>
					<span className="font-display text-sm font-semibold">
						{SITE.name}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<Clock />
					<button
						onClick={() => setDrawer(true)}
						aria-label="打开菜单"
						className="rounded-md border border-[var(--color-line)] p-1.5"
					>
						<Icon d="M4 7h16M4 12h16M4 17h16" />
					</button>
				</div>
			</div>
			{drawer && (
				<div
					className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
					onClick={() => setDrawer(false)}
				>
					<aside
						className="flex h-full w-72 flex-col border-r border-[var(--color-line)] bg-[var(--color-panel)]"
						onClick={(e) => e.stopPropagation()}
					>
						{sidebarBody}
					</aside>
				</div>
			)}

			{/* 主区 */}
			<div className={`transition-all duration-200 ${collapsed ? "md:pl-14" : "md:pl-64"}`}>
				{/* 桌面顶条 */}
				<header className="sticky top-0 z-30 hidden items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 px-6 py-2.5 backdrop-blur md:flex">
					<p className="mono-tag">
						{SITE.osName} //{" "}
						{NAV_ITEMS.find((n) => isActive(n.href))?.tag ?? "OS"}
					</p>
					<div className="flex items-center gap-4">
						<Clock />
						<button
							onClick={() => setPaletteOpen(true)}
							className="flex items-center gap-2 rounded-md border border-[var(--color-line)] px-2.5 py-1 text-xs text-[var(--color-muted)] transition hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
						>
							检索档案
							<kbd className="font-mono text-[10px]">⌘K</kbd>
						</button>
					</div>
				</header>

				<main className="min-h-[calc(100dvh-8rem)]">{children}</main>

				<footer className="border-t border-[var(--color-line)] px-6 py-6">
					<div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-[var(--color-muted)] sm:flex-row">
						<p className="font-mono">
							© 2026 {SITE.name} · {SITE.osName} v2
						</p>
						<p className="font-mono">
							<a href="/rss.xml" className="hover:text-[var(--color-primary)]">
								RSS
							</a>{" "}
							/{" "}
							<a
								href="/sitemap.xml"
								className="hover:text-[var(--color-primary)]"
							>
								SITEMAP
							</a>
						</p>
					</div>
				</footer>
			</div>

			<CommandPalette
				open={paletteOpen}
				onClose={() => setPaletteOpen(false)}
				posts={posts}
			/>
		</div>
	);
}

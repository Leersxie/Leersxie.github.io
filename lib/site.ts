export const SITE = {
	name: "Leersxie",
	osName: "RHINE ARCHIVE OS",
	url: "https://leersxie.github.io",
	description: "LX 的个人档案库：随笔、项目与记录",
} as const;

export const NAV_ITEMS = [
	// 板块专属主题色：同系蓝紫→靛→蓝→青家族（学 ignoredone「每板块一套性格色」，
	// 但限定同族保证品牌统一）。路由切换时 accent 以 800ms 缓动过渡。
	{ href: "/", label: "首页", tag: "HOME", accent: "#7c5cff" },
	{ href: "/archive/", label: "归档", tag: "ARCHIVE", accent: "#4f6bff" },
	{ href: "/projects/", label: "项目", tag: "PROJECTS", accent: "#3d8bff" },
	{ href: "/friends/", label: "友链", tag: "LINKS", accent: "#2fb8d8" },
	{ href: "/about/", label: "关于", tag: "ABOUT", accent: "#a06bff" },
] as const;

export const SOCIALS = [
	{ label: "GitHub", href: "https://github.com/leersxie" },
	{ label: "Bilibili", href: "https://space.bilibili.com/691200956" },
	{ label: "YouTube", href: "https://www.youtube.com/@%E8%90%B1%E7%87%95%E4%B9%A6%E5%88%991145" },
] as const;

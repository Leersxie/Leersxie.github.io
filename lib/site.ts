export const SITE = {
	name: "Leersxie",
	osName: "RHINE ARCHIVE OS",
	url: "https://leersxie.github.io",
	description: "LX 的个人档案库：随笔、项目与记录",
} as const;

export const NAV_ITEMS = [
	{ href: "/", label: "首页", tag: "HOME" },
	{ href: "/archive/", label: "归档", tag: "ARCHIVE" },
	{ href: "/projects/", label: "项目", tag: "PROJECTS" },
	{ href: "/friends/", label: "友链", tag: "LINKS" },
	{ href: "/about/", label: "关于", tag: "ABOUT" },
] as const;

export const SOCIALS = [
	{ label: "GitHub", href: "https://github.com/leersxie" },
	{ label: "Bilibili", href: "https://space.bilibili.com/691200956" },
	{ label: "YouTube", href: "https://www.youtube.com/@%E8%90%B1%E7%87%95%E4%B9%A6%E5%88%991145" },
] as const;

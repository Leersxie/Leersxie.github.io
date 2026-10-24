export const SITE = {
	name: "Leersxie",
	osName: "RHINE ARCHIVE OS",
	url: "https://leersxie.github.io",
	description: "LX 的个人档案库：随笔、项目与记录",
} as const;

export const NAV_ITEMS = [
	// B2-3：板块色收敛——同色不同浓度（sig），不再横向并列 5 个色相。
	// ignoredone 的真实做法是「进一个板块，整套皮肤全换」；
	// v2 的品牌锁死紫蓝，所以只递减环境浓度：首页最浓，关于最安静。
	{ href: "/", label: "首页", tag: "HOME", sig: 1.0 },
	{ href: "/archive/", label: "归档", tag: "ARCHIVE", sig: 0.8 },
	{ href: "/projects/", label: "项目", tag: "PROJECTS", sig: 0.6 },
	{ href: "/friends/", label: "友链", tag: "LINKS", sig: 0.4 },
	{ href: "/about/", label: "关于", tag: "ABOUT", sig: 0.2 },
] as const;

export const SOCIALS = [
	{ label: "GitHub", href: "https://github.com/leersxie" },
	{ label: "Bilibili", href: "https://space.bilibili.com/691200956" },
	{ label: "YouTube", href: "https://www.youtube.com/@%E8%90%B1%E7%87%95%E4%B9%A6%E5%88%991145" },
] as const;

import type {
	AnnouncementConfig,
	CommentConfig,
	ExpressiveCodeConfig,
	FooterConfig,
	FullscreenWallpaperConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	PermalinkConfig,
	ProfileConfig,
	RandomPostsConfig,
	RelatedPostsConfig,
	SakuraConfig,
	ShareConfig,
	SidebarLayoutConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

// 定义站点语言（改为中文）
const SITE_LANG = "zh_CN";
// 中国时区（字符串格式，符合类型要求）
const SITE_TIMEZONE = "+8";

export const siteConfig: SiteConfig = {
	title: "Leersxie's Blog",
	subtitle: "基于 Astro 的 Mizuki 个人博客",
	siteURL: "https://leersxie.github.io/",
	siteStartDate: "2026-03-28",

	timeZone: SITE_TIMEZONE,

	lang: SITE_LANG,

	themeColor: {
		hue: 210,
		fixed: false,
	},

	featurePages: {
		anime: false,
		diary: false,
		friends: true,
		projects: false,
		skills: false,
		timeline: false,
		albums: false,
		devices: false,
	},

	navbarTitle: {
		mode: "text-icon",
		text: "Leersxie",
		icon: "assets/home/home.webp",
		logo: "assets/home/default-logo.webp",
	},

	pageScaling: {
		enable: true,
		targetWidth: 2000,
	},

	bangumi: {
		userId: "your-bangumi-id",
		fetchOnDev: false,
	},

	bilibili: {
		vmid: "your-bilibili-vmid",
		fetchOnDev: false,
		coverMirror: "",
		useWebp: true,
	},

	anime: {
		mode: "local",
	},

	postListLayout: {
		defaultMode: "list",
		allowSwitch: true,
		categoryBar: {
			enable: true,
		},
	},

	tagStyle: {
		useNewStyle: false,
	},

	wallpaperMode: {
		defaultMode: "banner",
		showModeSwitchOnMobile: "desktop",
	},

	banner: {
		src: {
			desktop: [
				"/assets/desktop-banner/1.webp",
				"/assets/desktop-banner/2.webp",
				"/assets/desktop-banner/3.webp",
				"/assets/desktop-banner/4.webp",
				"/assets/desktop-banner/5.webp",
				"/assets/desktop-banner/6.webp",
			],
			mobile: [
				"/assets/mobile-banner/1.webp",
				"/assets/mobile-banner/2.webp",
				"/assets/mobile-banner/3.webp",
				"/assets/mobile-banner/4.webp",
				"/assets/mobile-banner/5.webp",
				"/assets/mobile-banner/6.webp",
			],
		},

		position: "center",

		carousel: {
			enable: true,
			interval: 3,
		},

		waves: {
			enable: true,
			performanceMode: false,
			mobileDisable: false,
		},

		imageApi: {
			enable: false,
			url: "",
		},

		homeText: {
			enable: true,
			title: "欢迎来到LX博客呀",
			subtitle: [
				"横扫饥饿，做回自己",
				"基于 Astro + Mizuki 构建",
				"心灵终结3.3.7什么时候更新...",
				"跑得好远，好累好累~",
			],
			typewriter: {
				enable: true,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 2000,
			},
		},

		credit: {
			enable: false,
			text: "",
			url: "",
		},

		navbar: {
			transparentMode: "semifull",
		},
	},
	toc: {
		enable: true,
		mobileTop: true,
		desktopSidebar: true,
		floating: true,
		depth: 2,
		useJapaneseBadge: false,
	},
	showCoverInContent: true,
	generateOgImages: false,
	favicon: [],

	font: {
		asciiFont: {
			fontFamily: "sans-serif",
			fontWeight: "400",
			localFonts: [],
			enableCompress: false,
		},
		cjkFont: {
			fontFamily: "sans-serif",
			fontWeight: "500",
			localFonts: [],
			enableCompress: false,
		},
	},
	showLastModified: true,
	pageProgressBar: {
		enable: true,
		height: 3,
		duration: 6000,
	},

	thirdPartyAnalytics: {
		enable: false,
		clarityId: "",
	},
};
export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
	src: {
		desktop: [
			"/assets/desktop-banner/3.webp",
			"/assets/desktop-banner/4.webp",
			"/assets/desktop-banner/5.webp",
			"/assets/desktop-banner/6.webp",
		],
		mobile: [
			"/assets/mobile-banner/1.webp",
			"/assets/mobile-banner/2.webp",
			"/assets/mobile-banner/3.webp",
			"/assets/mobile-banner/4.webp",
			"/assets/mobile-banner/5.webp",
			"/assets/mobile-banner/6.webp",
		],
	},
	position: "center",
	carousel: {
		enable: true,
		interval: 5,
	},
	zIndex: -1,
	opacity: 0.8,
	blur: 1,
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "个人链接",
			url: "/links/",
			icon: "material-symbols:link",
			children: [
				{
					name: "GitHub",
					url: "https://github.com/leersxie",
					external: true,
					icon: "fa7-brands:github",
				},
				{
					name: "Bilibili",
					url: "https://space.bilibili.com/691200956",
					external: true,
					icon: "fa7-brands:bilibili",
				},
				{
					name: "CCW主页",
					url: "https://www.ccw.site/student/6162bd6e7f390575815ec12c",
					external: true,
					icon: "material-symbols:public",
				},
			],
		},
		{
			name: "关于我",
			url: "/about/",
			icon: "material-symbols:info",
		},
		{
			name: "友链",
			url: "/friends/",
			icon: "material-symbols:group",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/assets/images/avatar.webp",
	name: "Leersxie",
	bio: "神秘苦逼高中生一个，喜欢吃咸咸的东西，总会离奇失踪",
	typewriter: {
		enable: true,
		speed: 80,
	},
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/leersxie",
		},
		{
			name: "Bilibili",
			icon: "fa7-brands:bilibili",
			url: "https://space.bilibili.com/691200956",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const permalinkConfig: PermalinkConfig = {
	enable: false,
	format: "%postname%",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
	hideDuringThemeTransition: true,
};

export const commentConfig: CommentConfig = {
	enable: false,
	system: "twikoo",
	twikoo: {
		envId: "https://twikoo.vercel.app",
		lang: SITE_LANG,
	},
	giscus: {
		repo: "",
		repoId: "",
		category: "Announcements",
		categoryId: "",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "top",
		theme: "preferred_color_scheme",
		lang: SITE_LANG,
		loading: "lazy",
	},
};

export const shareConfig: ShareConfig = {
	enable: true,
};

export const announcementConfig: AnnouncementConfig = {
	title: "",
	content: "不经常在线正在与可恶的数学题作斗争。",
	closable: true,
	link: {
		enable: false,
		text: "",
		url: "",
		external: false,
	},
};

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: false,
	showFloatingPlayer: false,
	floatingEntryMode: "fab",
	mode: "local",
	meting_api: "",
	id: "",
	server: "netease",
	type: "playlist",
};

export const footerConfig: FooterConfig = {
	enable: false,
	customHtml: "",
};

export const sidebarLayoutConfig: SidebarLayoutConfig = {
	properties: [
		{
			type: "profile",
			position: "top",
			class: "onload-animation",
			animationDelay: 0,
		},
		{
			type: "announcement",
			position: "top",
			class: "onload-animation",
			animationDelay: 50,
		},
		{
			type: "tags",
			position: "top",
			class: "onload-animation",
			animationDelay: 250,
			responsive: {
				collapseThreshold: 20,
			},
		},
		{
			type: "card-toc",
			position: "sticky",
			class: "onload-animation",
			animationDelay: 200,
		},
	],

	components: {
		left: ["profile", "announcement", "tags", "card-toc"],
		right: [],
		drawer: ["profile", "announcement", "tags"],
	},

	defaultAnimation: {
		enable: true,
		baseDelay: 0,
		increment: 50,
	},

	responsive: {
		breakpoints: {
			mobile: 768,
			tablet: 1280,
			desktop: 1280,
		},
	},
};

export const sakuraConfig: SakuraConfig = {
	enable: false,
	sakuraNum: 21,
	limitTimes: -1,
	size: {
		min: 0.5,
		max: 1.1,
	},
	opacity: {
		min: 0.3,
		max: 0.9,
	},
	speed: {
		horizontal: {
			min: -1.7,
			max: -1.2,
		},
		vertical: {
			min: 1.5,
			max: 2.2,
		},
		rotation: 0.03,
		fadeSpeed: 0.03,
	},
	zIndex: 100,
};

export const pioConfig: import("./types/config").PioConfig = {
	enable: false,
	models: ["/pio/models/pio/model.json"],
	position: "left",
	width: 280,
	height: 250,
	mode: "draggable",
	hiddenOnMobile: true,
	dialog: {
		welcome: "Welcome to Mizuki Website!",
		touch: [
			"What are you doing?",
			"Stop touching me!",
			"HENTAI!",
		],
		home: "Click here to go back to homepage!",
		skin: ["Want to see my new outfit?", "The new outfit looks great~"],
		close: "QWQ See you next time~",
		link: "https://github.com/matsuzaka-yuki/Mizuki",
	},
};

export const relatedPostsConfig: RelatedPostsConfig = {
	enable: true,
	maxCount: 5,
};

export const randomPostsConfig: RandomPostsConfig = {
	enable: true,
	maxCount: 5,
};

export const widgetConfigs = {
	profile: profileConfig,
	announcement: announcementConfig,
	music: musicPlayerConfig,
	layout: sidebarLayoutConfig,
	sakura: sakuraConfig,
	fullscreenWallpaper: fullscreenWallpaperConfig,
	pio: pioConfig,
	share: shareConfig,
	relatedPosts: relatedPostsConfig,
	randomPosts: randomPostsConfig,
} as const;

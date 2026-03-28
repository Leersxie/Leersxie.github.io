import type {
	DARK_MODE,
	LIGHT_MODE,
	WALLPAPER_BANNER,
	WALLPAPER_FULLSCREEN,
	WALLPAPER_NONE,
} from "../constants/constants";

export interface SiteConfig {
	title: string;
	subtitle: string;
	siteURL: string;
	keywords?: string[];
	siteStartDate?: string;
	timeZone: `-${string}` | `+${string}`;
	lang: "en" | "zh_CN" | "zh_TW" | "ja" | "ko" | "es" | "th" | "vi" | "tr" | "id";
	themeColor: {
		hue: number;
		fixed: boolean;
	};
	featurePages: {
		anime: boolean;
		diary: boolean;
		friends: boolean;
		projects: boolean;
		skills: boolean;
		timeline: boolean;
		albums: boolean;
		devices: boolean;
	};
	postListLayout: {
		defaultMode: "list" | "grid";
		allowSwitch: boolean;
		categoryBar?: {
			enable: boolean;
		};
	};
	navbarTitle?: {
		mode?: "text-icon" | "logo";
		text: string;
		icon?: string;
		logo?: string;
	};
	pageScaling?: {
		enable: boolean;
		targetWidth?: number;
	};
	font: {
		asciiFont: {
			fontFamily: string;
			fontWeight: string | number;
			localFonts: string[];
			enableCompress: boolean;
		};
		cjkFont: {
			fontFamily: string;
			fontWeight: string | number;
			localFonts: string[];
			enableCompress: boolean;
		};
	};
	bangumi?: {
		userId?: string;
		fetchOnDev?: boolean;
	};
	bilibili?: {
		vmid?: string;
		fetchOnDev?: boolean;
		coverMirror?: string;
		useWebp?: boolean;
	};
	anime?: {
		mode?: "bangumi" | "local" | "bilibili";
	};
	tagStyle?: {
		useNewStyle?: boolean;
	};
	wallpaperMode: {
		defaultMode: "banner" | "fullscreen" | "none";
		showModeSwitchOnMobile?: "off" | "mobile" | "desktop" | "both";
	};
	banner: {
		src: string | string[] | { desktop?: string | string[]; mobile?: string | string[] };
		position?: "top" | "center" | "bottom";
		carousel?: {
			enable: boolean;
			interval: number;
		};
		waves?: {
			enable: boolean;
			performanceMode?: boolean;
			mobileDisable?: boolean;
		};
		imageApi?: {
			enable: boolean;
			url: string;
		};
		homeText?: {
			enable: boolean;
			title?: string;
			subtitle?: string | string[];
			typewriter?: {
				enable: boolean;
				speed: number;
				deleteSpeed: number;
				pauseTime: number;
			};
		};
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
		navbar?: {
			transparentMode?: "semi" | "full" | "semifull";
		};
	};
	toc: {
		enable: boolean;
		mobileTop: boolean;
		desktopSidebar: boolean;
		floating: boolean;
		depth: 1 | 2 | 3;
		useJapaneseBadge?: boolean;
	};
	showCoverInContent: boolean;
	generateOgImages: boolean;
	favicon: Favicon[];
	showLastModified: boolean;
	pageProgressBar?: PageProgressBarConfig;
	thirdPartyAnalytics?: ThirdPartyAnalyticsConfig;
}

export interface Favicon {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
}

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	Friends = 3,
	Anime = 4,
	Diary = 5,
	Albums = 6,
	Projects = 7,
	Skills = 8,
	Timeline = 9,
}

export interface NavBarLink {
	name: string;
	url: string;
	external?: boolean;
	icon?: string;
	children?: (NavBarLink | LinkPreset)[];
}

export interface NavBarConfig {
	links: (NavBarLink | LinkPreset)[];
}

export interface ProfileConfig {
	avatar?: string;
	name: string;
	bio?: string;
	links: { name: string; url: string; icon: string; }[];
	typewriter?: { enable: boolean; speed?: number; };
}

export interface LicenseConfig {
	enable: boolean;
	name: string;
	url: string;
}

export interface PermalinkConfig {
	enable: boolean;
	format: string;
}

export interface CommentConfig {
	enable: boolean;
	system?: "twikoo" | "giscus";
	twikoo?: TwikooConfig;
	giscus?: GiscusConfig;
}

export interface GiscusConfig {
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
	mapping: string;
	strict: string;
	reactionsEnabled: string;
	emitMetadata: string;
	inputPosition: string;
	theme: string;
	lang: string;
	loading: string;
}

interface TwikooConfig {
	envId: string;
	region?: string;
	lang?: string;
}

export type LIGHT_DARK_MODE = typeof LIGHT_MODE | typeof DARK_MODE;
export type WALLPAPER_MODE = typeof WALLPAPER_BANNER | typeof WALLPAPER_FULLSCREEN | typeof WALLPAPER_NONE;

export interface BlogPostData {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	pinned?: boolean;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
}

export interface ExpressiveCodeConfig {
	theme: string;
	hideDuringThemeTransition?: boolean;
}

export interface AnnouncementConfig {
	title?: string;
	content: string;
	icon?: string;
	type?: "info" | "warning" | "success" | "error";
	closable?: boolean;
	link?: { enable: boolean; text: string; url: string; external?: boolean; };
}

export interface MusicPlayerConfig {
	enable: boolean;
	showFloatingPlayer: boolean;
	floatingEntryMode?: "default" | "fab";
	mode: "meting" | "local";
	meting_api: string;
	id: string;
	server: string;
	type: string;
}

export interface FooterConfig {
	enable: boolean;
	customHtml?: string;
}

export type WidgetComponentType = "profile" | "announcement" | "categories" | "tags" | "toc" | "card-toc" | "music-player" | "music-sidebar" | "pio" | "site-stats" | "calendar" | "custom";

export interface WidgetComponentConfig {
	type: WidgetComponentType;
	position: "top" | "sticky";
	class?: string;
	style?: string;
	animationDelay?: number;
	responsive?: { hidden?: ("mobile" | "tablet" | "desktop")[]; collapseThreshold?: number; };
	customProps?: Record<string, any>;
}

export interface SidebarLayoutConfig {
	properties: WidgetComponentConfig[];
	components: { left: WidgetComponentType[]; right: WidgetComponentType[]; drawer: WidgetComponentType[]; };
	defaultAnimation: { enable: boolean; baseDelay: number; increment: number; };
	responsive: { breakpoints: { mobile: number; tablet: number; desktop: number; }; };
}

export interface SakuraConfig {
	enable: boolean;
	sakuraNum: number;
	limitTimes: number;
	size: { min: number; max: number; };
	opacity: { min: number; max: number; };
	speed: { horizontal: { min: number; max: number; }; vertical: { min: number; max: number; }; rotation: number; fadeSpeed: number; };
	zIndex: number;
}

export interface FullscreenWallpaperConfig {
	src: string | string[] | { desktop?: string | string[]; mobile?: string | string[] };
	position?: "top" | "center" | "bottom";
	carousel?: { enable: boolean; interval: number; };
	zIndex?: number;
	opacity?: number;
	blur?: number;
}

export interface PioConfig {
	enable: boolean;
	models?: string[];
	position?: "left" | "right";
	width?: number;
	height?: number;
	mode?: "static" | "fixed" | "draggable";
	hiddenOnMobile?: boolean;
	dialog?: { welcome?: string | string[]; touch?: string | string[]; home?: string; skin?: [string, string]; close?: string; link?: string; custom?: { selector: string; type: "read" | "link"; text?: string; }[]; };
}

export interface ShareConfig {
	enable: boolean;
}

export interface RelatedPostsConfig {
	enable: boolean;
	maxCount: number;
}

export interface RandomPostsConfig {
	enable: boolean;
	maxCount: number;
}

export interface PageProgressBarConfig {
	enable: boolean;
	height?: number;
	duration?: number;
}

export interface ThirdPartyAnalyticsConfig {
	enable: boolean;
	clarityId?: string;
}

export interface Config {
	site: SiteConfig;
	navbar: NavBarConfig;
	profile: ProfileConfig;
	license: LicenseConfig;
	permalink: PermalinkConfig;
	comment: CommentConfig;
	expressiveCode: ExpressiveCodeConfig;
	announcement: AnnouncementConfig;
	musicPlayer: MusicPlayerConfig;
	footer: FooterConfig;
	sidebarLayout: SidebarLayoutConfig;
	sakura: SakuraConfig;
	fullscreenWallpaper: FullscreenWallpaperConfig;
	pio: PioConfig;
	share: ShareConfig;
	relatedPosts: RelatedPostsConfig;
	randomPosts: RandomPostsConfig;
}

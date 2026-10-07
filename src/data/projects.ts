// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "yesimbot-memory-panel",
		title: "YesImBot 记忆面板",
		description:
			"给 YesImBot 做的记忆可视化面板：核心人格、三级记忆（工作 / 语义 / 日记）、记忆体检、注入联调与行为学习。以 Koishi 控制台内嵌页呈现，用来排查「它为什么这样回答」。",
		image: "",
		category: "other",
		techStack: ["TypeScript", "Koishi", "SQLite"],
		status: "in-progress",
		sourceCode:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-memory-panel",
		startDate: "2026-10-01",
		tags: ["Koishi", "QQ 机器人", "LLM"],
		showImage: false,
	},
	{
		id: "yesimbot-behavior-learner",
		title: "YesImBot 行为学习器",
		description:
			"定时从日常对话里提炼「值得长期学习」的行为偏好，私聊推送候选、逐条确认后才写入行为文档。带自动备份、相似度去重与外部改动检测，绝不自动改写人格文件。",
		image: "",
		category: "other",
		techStack: ["TypeScript", "Koishi", "LLM"],
		status: "completed",
		sourceCode:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-behavior-learner",
		startDate: "2026-10-01",
		endDate: "2026-10-02",
		tags: ["Koishi", "QQ 机器人", "Agent"],
		showImage: false,
	},
	{
		id: "yesimbot-livingdiary",
		title: "YesImBot 生活日记扩展",
		description:
			"YesImBot 扩展：让机器人自动记录并发布 QQ 空间日记，支持读写空间动态与自动互动。",
		image: "",
		category: "other",
		techStack: ["TypeScript", "Koishi"],
		status: "completed",
		sourceCode:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-livingdiary",
		startDate: "2026-09-12",
		endDate: "2026-09-13",
		tags: ["Koishi", "QQ 空间"],
		showImage: false,
	},
	{
		id: "yesimbot-discord-reaction",
		title: "YesImBot Discord 表情回应",
		description: "YesImBot 扩展：为 Discord 消息自动添加表情回应。自用插件。",
		image: "",
		category: "other",
		techStack: ["Koishi", "Discord"],
		status: "completed",
		sourceCode:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-extension-discord-reaction",
		startDate: "2026-09-24",
		tags: ["Koishi", "Discord"],
		showImage: false,
	},
	{
		id: "waveform-maker-v3-cn",
		title: "音频波形生成器 v3 中文化",
		description:
			"无扩展即可把音频转成可视化波形的在线工具，可输出波形数据（txt）或 Scratch 的 .sb3 记录。此仓库为其汉化与修改版。",
		image: "/assets/projects/waveform-gen-v3.webp",
		category: "web",
		techStack: ["JavaScript", "Web Audio API"],
		status: "completed",
		sourceCode: "https://github.com/Leersxie/Audio-Spectrum-Maker-v3-CN",
		visitUrl: "https://leersxie.github.io/Audio-Spectrum-Maker-v3-CN/",
		startDate: "2026-06-26",
		endDate: "2026-09-19",
		tags: ["汉化", "音频可视化", "Web"],
	},
	{
		id: "waveform-gen-v2-cn",
		title: "波形生成器 v2 中文化",
		description:
			"高性能波形生成器 v2 的汉化与修改版，面向中文用户，可录制并导出波形数据。",
		image: "/assets/projects/waveform-gen-v2.webp",
		category: "web",
		techStack: ["HTML", "JavaScript", "Web Audio API"],
		status: "completed",
		sourceCode: "https://github.com/Leersxie/AudioSpectrum-CN",
		visitUrl: "https://leersxie.github.io/AudioSpectrum-CN/",
		startDate: "2025-08-07",
		endDate: "2026-06-26",
		tags: ["汉化", "音频可视化", "Web"],
	},
	{
		id: "leersxie-blog",
		title: "本站",
		description:
			"基于 Astro + Mizuki 主题深度定制的个人博客：品牌紫主题、滚动触发动效、图片与样式的按需加载优化。",
		image: "",
		category: "web",
		techStack: ["Astro", "Svelte 5", "Tailwind CSS", "TypeScript"],
		status: "in-progress",
		sourceCode: "https://github.com/Leersxie/Leersxie.github.io",
		startDate: "2026-03-28",
		tags: ["博客", "Astro", "自建"],
		showImage: false,
	},
];

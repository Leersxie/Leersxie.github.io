import type { Song } from "./types";

export const STORAGE_KEY_VOLUME = "music-player-volume";

export const DEFAULT_VOLUME = 0.7;

/** 外部歌单（Meting 等）可能缺封面，用它兜底，避免 img src="" 误请求当前文档（上游 cb1fc5036） */
export const DEFAULT_COVER_URL = "/favicon/favicon.ico";

/**
 * 本地播放列表（mode: "local" 时使用）。
 * 当前 mode 为 "meting"（网易云歌单），此前配套的 4 首 mp3（约 22MB）与封面
 * 已从 public/assets/music/ 移除，避免作为死重部署上线；需要本地模式时，
 * 把文件放回该目录并在下方按 Song 结构补回条目即可（旧文件可从 git 历史找回）。
 */
export const LOCAL_PLAYLIST: Song[] = [];

export const DEFAULT_SONG: Song = {
	title: "Sample Song",
	artist: "Sample Artist",
	cover: DEFAULT_COVER_URL,
	url: "",
	duration: 0,
	id: 0,
};

export const DEFAULT_METING_API =
	"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
export const DEFAULT_METING_ID = "14164869977";
export const DEFAULT_METING_SERVER = "netease";
export const DEFAULT_METING_TYPE = "playlist";

export const ERROR_DISPLAY_DURATION = 3000;
export const SKIP_ERROR_DELAY = 1000;

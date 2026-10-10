export interface Song {
	id: number;
	title: string;
	artist: string;
	cover: string;
	url: string;
	duration: number;
}

export type PlayerMode = "local" | "meting";

/**
 * 音频元素相关的状态切片，供音量控制等 hook 共享。
 * 原先定义在 hooks/useAudioPlayer.ts；该文件其余函数（loadSong 等）全仓零引用已删除，
 * 仅保留仍被 useVolumeControl.ts 使用的这个类型，故迁到此处。
 */
export interface AudioPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isLoading: boolean;
	currentSong: Song;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

export type RepeatMode = 0 | 1 | 2;

export interface PlayerState {
	isPlaying: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	showPlaylist: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isLoading: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	errorMessage: string;
	showError: boolean;
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

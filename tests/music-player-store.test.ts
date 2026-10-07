import { beforeEach, describe, expect, it } from "vitest";

import { MusicPlayerStore } from "@/stores/musicPlayerStore";

/**
 * 音乐播放器 store 的行为约定。
 *
 * 背景（2026-10-07）：
 * - 默认播放模式被改成「随机」，这是产品决定，用例锁住它以免被后续改动悄悄改回去。
 * - 随机与循环是**互斥**的：开随机会把循环归零，开循环会把随机关掉。
 *   这条不变量此前只存在于实现里（toggleShuffle / toggleRepeat 内联），没有任何测试保护。
 * - 播放模式**不做持久化**（只有音量写 localStorage），所以每次访问都是默认值。
 */
describe("musicPlayerStore 播放模式", () => {
	let store: MusicPlayerStore;

	beforeEach(() => {
		store = new MusicPlayerStore();
	});

	it("默认是随机播放，且循环关闭", () => {
		const s = store.getState();
		expect(s.isShuffled).toBe(true);
		expect(s.isRepeating).toBe(0);
	});

	it("其它初始状态不因播放模式改动而变化", () => {
		const s = store.getState();
		expect(s.isPlaying).toBe(false);
		expect(s.volume).toBe(0.7);
		expect(s.isMuted).toBe(false);
		expect(s.currentIndex).toBe(0);
		expect(s.playlist).toEqual([]);
	});

	it("toggleShuffle 可关掉随机，再次打开时把循环归零", () => {
		store.toggleShuffle();
		expect(store.getState().isShuffled).toBe(false);

		// 先把循环打开，再开随机 —— 循环必须被归零
		store.toggleRepeat();
		expect(store.getState().isRepeating).toBe(1);
		store.toggleShuffle();
		expect(store.getState().isShuffled).toBe(true);
		expect(store.getState().isRepeating).toBe(0);
	});

	it("toggleRepeat 在 0/1/2 间循环，非 0 时关闭随机", () => {
		store.toggleRepeat();
		expect(store.getState().isRepeating).toBe(1);
		expect(store.getState().isShuffled).toBe(false);

		store.toggleRepeat();
		expect(store.getState().isRepeating).toBe(2);

		store.toggleRepeat();
		expect(store.getState().isRepeating).toBe(0);
		// 循环关掉后随机不会自动恢复，仍需用户显式开启
		expect(store.getState().isShuffled).toBe(false);
	});

	it("toggleMode 的循环顺序：随机 → 关 → 列表循环 → 单曲循环 → 随机", () => {
		const seen: Array<[boolean, number]> = [];
		for (let i = 0; i < 4; i++) {
			const s = store.getState();
			seen.push([s.isShuffled, s.isRepeating]);
			store.toggleMode();
		}
		expect(seen).toEqual([
			[true, 0],
			[false, 0],
			[false, 1],
			[false, 2],
		]);
		// 第 4 次切换后回到随机
		const s = store.getState();
		expect(s.isShuffled).toBe(true);
		expect(s.isRepeating).toBe(0);
	});

	it("播放模式不写 localStorage（只有音量持久化）", () => {
		const g: Storage | undefined = (globalThis as any).localStorage;
		if (!g) return; // node 环境没有 localStorage 时跳过

		g.clear?.();
		store.toggleShuffle();
		store.toggleRepeat();
		expect(g.getItem("musicPlayerMode")).toBeNull();
		expect(g.getItem("isShuffled")).toBeNull();
		expect(g.getItem("isRepeating")).toBeNull();
	});

	it("纯 UI 开关不改变播放模式", () => {
		store.togglePlaylist();
		expect(store.getState().showPlaylist).toBe(true);
		expect(store.getState().isShuffled).toBe(true);

		store.toggleExpanded();
		// 展开时强制取消隐藏，两者互斥
		store.toggleHidden();
		store.toggleExpanded();
		expect(store.getState().isHidden).toBe(false);
		expect(store.getState().isShuffled).toBe(true);
	});
});
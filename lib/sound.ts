/**
 * WebAudio 合成音效：零音频资产、零授权问题。
 * tick = 悬停短噪声；confirm = 点击双音上行。默认静音，偏好持久化。
 */

let ctx: AudioContext | null = null;
let enabled = false;

const KEY = "raos-sound";

export function isSoundEnabled(): boolean {
	try {
		return localStorage.getItem(KEY) === "on";
	} catch {
		return false;
	}
}

export function setSoundEnabled(on: boolean): void {
	enabled = on;
	try {
		localStorage.setItem(KEY, on ? "on" : "off");
	} catch {}
	if (on) ensureCtx();
}

function ensureCtx(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const AC =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext })
				.webkitAudioContext;
		if (!AC) return null;
		ctx = new AC();
	}
	if (ctx.state === "suspended") void ctx.resume();
	return ctx;
}

function blip(freq: number, dur: number, gain: number, type: OscillatorType) {
	if (!isSoundEnabled()) return;
	const ac = ensureCtx();
	if (!ac) return;
	const t = ac.currentTime;
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t);
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
	osc.connect(g).connect(ac.destination);
	osc.start(t);
	osc.stop(t + dur);
}

export function playTick(): void {
	blip(2400, 0.03, 0.015, "square");
}

export function playFlap(): void {
	// 翻牌：两段短促的纸片摩擦感（方波快速下滑）
	blip(880, 0.04, 0.02, "square");
	setTimeout(() => blip(660, 0.05, 0.018, "square"), 40);
}

export function playConfirm(): void {
	blip(660, 0.07, 0.03, "square");
	setTimeout(() => blip(990, 0.09, 0.03, "square"), 55);
}

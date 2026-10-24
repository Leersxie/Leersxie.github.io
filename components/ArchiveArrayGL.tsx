"use client";

import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";

/**
 * 真 3D 档案阵列（视觉终态）：Three.js 玻璃档案盒 + 镜头运镜。
 * - 玻璃：MeshPhysicalMaterial transmission（真折射，IOR 1.45）
 * - 运镜：入场镜头从高处俯冲就位（outExpo），随后怠速漂移 + 指针视差
 * - 标签：CanvasTexture 绘制 DOC 编号 / 标题 / 条码纹
 * 性能契约：
 * - 桌面 + 指针设备 + 非 reduced-motion 才启用；否则保留 CSS 3D 版本
 * - DPR 封顶 1.75；离屏 / 标签页隐藏即停；组件卸载全量释放
 * - WebGL 初始化失败 → CSS 版本继续兜底
 * 主题适配：dark 变化时由父组件以 key 重挂载（材质/标签整体重绘）。
 */
export default function ArchiveArrayGL({
	labels,
	dark,
}: {
	labels: string[];
	dark: boolean;
}) {
	const host = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = host.current;
		if (!el) return;
		let disposed = false;
		let cleanup: (() => void) | undefined;

		(async () => {
			const THREE = await import("three");
			if (disposed || !el) return;

			let renderer: THREE_NS.WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({
					antialias: true,
					alpha: true,
				});
			} catch {
				return; // WebGL 不可用 → CSS 版本兜底
			}
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
			renderer.setSize(el.clientWidth, el.clientHeight);
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			el.appendChild(renderer.domElement);

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(
				38,
				el.clientWidth / el.clientHeight,
				0.1,
				100,
			);

			// —— 灯光：冷白环境 + 主光 + 紫罗兰点光 ——
			const hemi = new THREE.HemisphereLight(
				0xffffff,
				0x22243a,
				dark ? 0.7 : 1.1,
			);
			const key = new THREE.DirectionalLight(0xffffff, dark ? 1.2 : 1.8);
			key.position.set(4, 8, 5);
			const violet = new THREE.PointLight(0x7c5cff, dark ? 26 : 14, 18);
			violet.position.set(-3, 2.4, 2.5);
			scene.add(hemi, key, violet);

			// —— 地面网格：坐标纸 ——
			const grid = new THREE.GridHelper(60, 44, 0x7c5cff, 0x7c5cff);
			const gridMat = grid.material as THREE_NS.Material;
			gridMat.opacity = dark ? 0.16 : 0.1;
			gridMat.transparent = true;
			scene.add(grid);

			// —— 档案盒：玻璃 + 标签面 ——
			const disposables: { dispose(): void }[] = [];
			const boxes = new THREE.Group();
			const COLS = 5;
			const ROWS = 3;

			const drawLabel = (id: string, title: string) => {
				const cv = document.createElement("canvas");
				cv.width = 512;
				cv.height = 224;
				const g = cv.getContext("2d")!;
				const ink = dark ? "#e8eaf0" : "#171a21";
				const violet = dark ? "#9b85ff" : "#6540f0";
				g.clearRect(0, 0, 512, 224);
				g.fillStyle = ink;
				g.font = "22px 'JetBrains Mono', monospace";
				g.globalAlpha = 0.65;
				g.fillText(id, 24, 48);
				g.globalAlpha = 1;
				g.fillStyle = violet;
				g.fillRect(24, 66, 26, 5);
				g.fillStyle = ink;
				g.font = "600 40px 'Noto Sans SC', sans-serif";
				g.fillText(title.slice(0, 10), 24, 138);
				g.globalAlpha = 0.4;
				for (let x = 24; x < 480; x += 9) {
					g.fillRect(x, 178, (x * 7919) % 3 === 0 ? 4 : 2, 22);
				}
				g.globalAlpha = 1;
				const tex = new THREE.CanvasTexture(cv);
				tex.colorSpace = THREE.SRGBColorSpace;
				disposables.push(tex);
				return tex;
			};

			for (let c = 0; c < COLS; c++) {
				for (let r = 0; r < ROWS; r++) {
					const i = c * ROWS + r;
					const label = labels[i % Math.max(1, labels.length)] ?? "ARCHIVE";
					const id = `DOC.26${String(10 + ((c * 7 + r * 3) % 89)).padStart(2, "0")}-${String((c * 31 + r * 17) % 999).padStart(3, "0")}`;

					const glass = new THREE.MeshPhysicalMaterial({
						color: dark ? 0x9b85ff : 0xffffff,
						transmission: 0.92,
						roughness: 0.16,
						thickness: 0.7,
						ior: 1.45,
						clearcoat: 1,
						clearcoatRoughness: 0.2,
						transparent: true,
						opacity: 0.96,
					});
					disposables.push(glass);
					const box = new THREE.Mesh(
						new THREE.BoxGeometry(1.72, 0.62, 1.12),
						glass,
					);
					disposables.push(box.geometry);
					const x = (c - (COLS - 1) / 2) * 2.35 + (c % 2 ? 0.18 : -0.1);
					const z = (r - (ROWS - 1) / 2) * 1.65;
					box.position.set(x, 0.55, z);
					box.rotation.y = (c % 2 ? 1 : -1) * 0.04;

					const labelMat = new THREE.MeshBasicMaterial({
						map: drawLabel(id, label),
						transparent: true,
					});
					disposables.push(labelMat);
					const face = new THREE.Mesh(
						new THREE.PlaneGeometry(1.55, 0.5),
						labelMat,
					);
					disposables.push(face.geometry);
					face.rotation.x = -Math.PI / 2;
					face.position.y = 0.32;
					box.add(face);

					boxes.add(box);
				}
			}
			scene.add(boxes);

			// —— 运镜：入场俯冲 → 怠速漂移 + 指针视差 ——
			const INTRO_MS = 1700;
			const bornAt = performance.now();
			const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

			const onPointer = (e: PointerEvent) => {
				const r = el.getBoundingClientRect();
				pointer.x = (e.clientX - r.left) / r.width - 0.5;
				pointer.y = (e.clientY - r.top) / r.height - 0.5;
			};
			el.addEventListener("pointermove", onPointer);

			let raf = 0;
			let playing = true;
			const easeOutExpo = (p: number) =>
				p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);

			const render = (t: number) => {
				if (!playing) return;
				raf = requestAnimationFrame(render);
				const k = easeOutExpo(Math.min(1, (t - bornAt) / INTRO_MS));
				pointer.sx += (pointer.x - pointer.sx) * 0.05;
				pointer.sy += (pointer.y - pointer.sy) * 0.05;
				const drift = Math.sin(t * 0.00022) * 0.22;
				camera.position.set(
					-2.6 + 2.6 * k + pointer.sx * 1.1 + drift,
					7.5 - 3.9 * k - pointer.sy * 0.6,
					10.5 - 3.1 * k,
				);
				camera.lookAt(0, 0.2, -0.6);

				const tt = t * 0.001;
				boxes.children.forEach((b, i) => {
					b.position.y = 0.55 + Math.sin(tt * 0.9 + i * 1.7) * 0.035;
				});
				renderer.render(scene, camera);
			};
			raf = requestAnimationFrame(render);

			// —— 离屏 / 隐藏页暂停 ——
			const setPlaying = (v: boolean) => {
				if (playing === v) return;
				playing = v;
				if (v) raf = requestAnimationFrame(render);
				else cancelAnimationFrame(raf);
			};
			const io = new IntersectionObserver((entries) => {
				setPlaying(entries[0].isIntersecting && !document.hidden);
			});
			const onVis = () => setPlaying(!document.hidden);
			io.observe(el);
			document.addEventListener("visibilitychange", onVis);

			const onResize = () => {
				if (!el.clientWidth) return;
				camera.aspect = el.clientWidth / el.clientHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(el.clientWidth, el.clientHeight);
			};
			window.addEventListener("resize", onResize);

			cleanup = () => {
				cancelAnimationFrame(raf);
				io.disconnect();
				document.removeEventListener("visibilitychange", onVis);
				window.removeEventListener("resize", onResize);
				el.removeEventListener("pointermove", onPointer);
				disposables.forEach((d) => d.dispose());
				renderer.dispose();
				renderer.domElement.remove();
			};
		})();

		return () => {
			disposed = true;
			cleanup?.();
		};
	}, [labels, dark]);

	return <div ref={host} className="absolute inset-0" aria-hidden />;
}

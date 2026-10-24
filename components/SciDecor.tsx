/**
 * 科学美学装饰层：函数曲线 / 数学公式 / 几何 / 物理 / 化学。
 * 两档密度：hero（首页英雄区，较浓）与 ambient（全站背景，极淡）。
 * 纯 SVG + CSS 动画（描线漂移 / 缓浮），零依赖；reduced-motion 静止。
 * 视觉路线：技术图纸感——曲线带坐标轴刻度与公式标注，不是随手涂鸦。
 */

const FORMULAS: Array<{ x: number; y: number; t: string; s?: number }> = [
	{ x: 84, y: 96, t: "E = mc²", s: 20 },
	{ x: 1180, y: 72, t: "Ĥψ = Eψ", s: 18 },
	{ x: 1310, y: 300, t: "e^{iπ} + 1 = 0", s: 16 },
	{ x: 120, y: 470, t: "ΔG = ΔH − TΔS", s: 15 },
	{ x: 700, y: 520, t: "∇·E = ρ/ε₀", s: 14 },
];

export default function SciDecor({
	variant = "ambient",
}: {
	variant?: "hero" | "ambient";
}) {
	const hero = variant === "hero";
	const ink = hero ? "var(--color-ink)" : "var(--color-ink)";
	const base = hero ? 0.5 : 0.16;

	return (
		<svg
			viewBox="0 0 1440 560"
			preserveAspectRatio="xMidYMid slice"
			className={`pointer-events-none absolute inset-0 h-full w-full ${
				hero ? "" : "opacity-70"
			}`}
			aria-hidden
		>
			<defs>
				<linearGradient id="sci-wave" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="var(--color-primary)" stopOpacity="0" />
					<stop offset="0.5" stopColor="var(--color-primary)" stopOpacity="0.9" />
					<stop offset="1" stopColor="var(--color-indigo-line)" stopOpacity="0" />
				</linearGradient>
			</defs>

			{/* —— 正弦波 + 坐标轴 + 标注（顶部横贯）—— */}
			<g opacity={base} transform="translate(0 46)">
				<line x1="40" x2="1400" y1="60" y2="60" stroke={ink} strokeOpacity="0.18" />
				{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
					<line
						key={i}
						x1={80 + i * 170}
						x2={80 + i * 170}
						y1="56"
						y2="64"
						stroke={ink}
						strokeOpacity="0.25"
					/>
				))}
				<path
					className="sci-dash"
					d="M40 60 C 110 20, 180 100, 250 60 S 390 20, 460 60 S 600 100, 670 60 S 810 20, 880 60 S 1020 100, 1090 60 S 1230 20, 1300 60 S 1390 45, 1400 60"
					fill="none"
					stroke="url(#sci-wave)"
					strokeWidth="2.5"
				/>
				<text x="46" y="30" fontSize="12" fill={ink} fillOpacity="0.45" fontFamily="var(--font-mono)">
					y = A·sin(ωt + φ)
				</text>
			</g>

			{/* —— 利萨如曲线（右侧闭合环）—— */}
			<g opacity={base * 0.85} transform="translate(1215 200)">
				<path
					className="sci-dash"
					d="M0 -70 C 52 -70, 88 -34, 88 8 C 88 50, 52 86, 0 86 C -48 86, -84 52, -84 10 C -84 -32, -50 -70, 0 -70 C 40 -70, 70 -44, 74 -6 C 78 32, 44 62, 4 62 C -36 62, -64 34, -62 -4 C -60 -40, -32 -62, 4 -60"
					fill="none"
					stroke={ink}
					strokeOpacity="0.3"
					strokeWidth="1.5"
				/>
				<text x="-52" y="112" fontSize="11" fill={ink} fillOpacity="0.4" fontFamily="var(--font-mono)">
					x = sin(3t) · y = sin(4t)
				</text>
			</g>

			{/* —— 苯环（化学：C₆H₆，左下）—— */}
			<g opacity={base} transform="translate(150 420)">
				<polygon
					points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22"
					fill="none"
					stroke={ink}
					strokeOpacity="0.35"
					strokeWidth="1.6"
				/>
				<circle cx="0" cy="0" r="22" fill="none" stroke={ink} strokeOpacity="0.3" />
				{[
					[0, -44],
					[38, -22],
					[38, 22],
					[0, 44],
					[-38, 22],
					[-38, -22],
				].map(([hx, hy], i) => (
					<circle key={i} cx={hx} cy={hy} r="3.4" fill="var(--color-primary)" fillOpacity="0.55" />
				))}
				<text x="-16" y="74" fontSize="12" fill={ink} fillOpacity="0.4" fontFamily="var(--font-mono)">
					C₆H₆
				</text>
			</g>

			{/* —— 轨道椭圆（物理：开普勒，左中）—— */}
			<g opacity={base * 0.9} transform="translate(585 330) rotate(-18)">
				<ellipse
					rx="86"
					ry="34"
					fill="none"
					stroke={ink}
					strokeOpacity="0.28"
					strokeWidth="1.4"
					strokeDasharray="5 6"
				/>
				<ellipse cx="0" cy="0" rx="7" ry="7" fill="var(--color-indigo-line)" fillOpacity="0.5" />
				<circle cx="72" cy="-12" r="4.4" fill="var(--color-primary)" />
				<line x1="0" y1="0" x2="70" y2="-11.5" stroke={ink} strokeOpacity="0.2" strokeDasharray="2 4" />
			</g>

			{/* —— 幽灵公式 —— */}
			{FORMULAS.filter((_, i) => (hero ? true : i % 2 === 0)).map((f, i) => (
				<text
					key={i}
					x={f.x}
					y={f.y}
					fontSize={f.s ?? 16}
					fill={ink}
					fillOpacity={hero ? 0.34 : 0.2}
					fontFamily="var(--font-mono)"
					fontStyle="italic"
				>
					{f.t}
				</text>
			))}

			{/* —— 大色块圆（ignoredone 式高饱和，仅 hero）—— */}
			{hero && (
				<>
					<circle cx="1120" cy="120" r="150" fill="var(--color-primary)" fillOpacity="0.07" />
					<circle cx="1120" cy="120" r="150" fill="none" stroke="var(--color-primary)" strokeOpacity="0.22" />
					<circle cx="90" cy="150" r="52" fill="none" stroke="var(--color-indigo-line)" strokeOpacity="0.25" />
					<circle cx="90" cy="150" r="4" fill="var(--color-indigo-line)" fillOpacity="0.6" />
				</>
			)}

			{/* —— 十字标记 —— */}
			{[
				[410, 250],
				[980, 430],
				[1345, 480],
			].map(([x, y], i) => (
				<g key={i} opacity={base * 0.8}>
					<line x1={x - 7} x2={x + 7} y1={y} y2={y} stroke={ink} strokeOpacity="0.4" />
					<line x1={x} x2={x} y1={y - 7} y2={y + 7} stroke={ink} strokeOpacity="0.4" />
				</g>
			))}
		</svg>
	);
}

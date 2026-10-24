import { docId } from "@/lib/posts";

/**
 * 程序化封面：无 cover 图的文章按 slug 确定性生成一幅
 * 方舟式构图封面（学 ignoredone「封面即内容」）。
 * 四种构图变体 × 由 slug 哈希选取，保证同文同图、不同文不同图。
 */

function hash(str: string): number {
	let h = 2166136261;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return Math.abs(h);
}

const INKS = ["#7c5cff", "#4f6bff", "#9b85ff"];

export default function CoverArt({
	slug,
	title,
	published,
}: {
	slug: string;
	title: string;
	published: string;
}) {
	const h = hash(slug);
	const variant = h % 4;
	const inkA = INKS[h % 3];
	const inkB = INKS[(h + 1) % 3];
	const rot = (h % 14) - 7;
	const id = docId({ slug, published } as never);

	return (
		<svg
			viewBox="0 0 1200 320"
			className="mb-10 h-auto w-full rounded-xl border border-[var(--color-line)]"
			role="img"
			aria-label={`${title} 封面`}
		>
			<rect width="1200" height="320" fill="#12141c" />

			{variant === 0 && (
				/* 对角切割 + 大编号 */
				<>
					<polygon points="0,0 620,0 380,320 0,320" fill={inkA} opacity="0.16" />
					<polygon points="1200,0 1200,320 760,320" fill={inkB} opacity="0.1" />
					<text x="72" y="230" fontSize="150" fontWeight="700" fill={inkA} opacity="0.9" fontFamily="var(--font-mono)">
						{String((h % 90) + 10)}
					</text>
				</>
			)}
			{variant === 1 && (
				/* 条纹场 + 大字首 */
				<>
					{Array.from({ length: 14 }).map((_, i) => (
						<rect
							key={i}
							x={i * 88}
							y={i % 2 ? 0 : 40}
							width="30"
							height={i % 2 ? 320 : 280}
							fill={i % 3 === 0 ? inkA : inkB}
							opacity={0.12 + (i % 3) * 0.05}
						/>
					))}
					<text x="72" y="238" fontSize="150" fontWeight="700" fill="#eef1ff" opacity="0.92" fontFamily="var(--font-display)">
						{title.slice(0, 1)}
					</text>
				</>
			)}
			{variant === 2 && (
				/* 同心圆 + 十字标 */
				<>
					{[70, 130, 195].map((r, i) => (
						<circle key={r} cx="980" cy="160" r={r} fill="none" stroke={i === 1 ? inkB : inkA} strokeWidth="2" opacity={0.35 - i * 0.08} />
					))}
					<circle cx="980" cy="160" r="9" fill={inkA} />
					<line x1="980" y1="0" x2="980" y2="320" stroke={inkB} strokeOpacity="0.2" strokeDasharray="3 7" />
					<text x="72" y="232" fontSize="130" fontWeight="700" fill="#eef1ff" opacity="0.9" fontFamily="var(--font-display)">
						{String.fromCharCode(65 + (h % 26))}·{String((h % 900) + 100)}
					</text>
				</>
			)}
			{variant === 3 && (
				/* 旋转方块群 */
				<>
					{Array.from({ length: 5 }).map((_, i) => (
						<rect
							key={i}
							x={620 + i * 96}
							y={160 - 60 + (i % 2 ? 24 : -24)}
							width="110"
							height="110"
							fill="none"
							stroke={i % 2 ? inkA : inkB}
							strokeWidth="2"
							opacity={0.28 - i * 0.03}
							transform={`rotate(${rot + i * 8} ${620 + i * 96 + 55} 160)`}
						/>
					))}
					<text x="72" y="230" fontSize="140" fontWeight="700" fill={inkA} opacity="0.85" fontFamily="var(--font-display)">
						{title.slice(0, 2)}
					</text>
				</>
			)}

			{/* 公共信息层 */}
			<text x="72" y="72" fontSize="24" letterSpacing="4" fill="#aab4e0" fontFamily="var(--font-mono)">
				{id} // ARCHIVED
			</text>
			<text x="72" y="286" fontSize="22" fill="#7d88b8" fontFamily="var(--font-mono)">
				{published}
			</text>
			<rect x="1052" y="264" width="76" height="28" fill="none" stroke="#343947" />
			<text x="1066" y="284" fontSize="18" fill="#aab4e0" fontFamily="var(--font-mono)">
				LX·OS
			</text>
		</svg>
	);
}

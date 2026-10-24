/** B3-4：子页头部的统计读数（仪表式小件） */
export default function Stat({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="font-display text-xl font-semibold leading-none tabular-nums">
				{value}
			</span>
			<span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
				{label}
			</span>
		</div>
	);
}

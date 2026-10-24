import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Leersxie · RHINE ARCHIVE OS";
export const dynamic = "force-static";

/** 站点 OG 分享图：蓝黑终端底 + 网格 + 紫罗兰渐变条 + 展示字体标题 */
export default async function OgImage() {
	const grotesk = await readFile(
		path.join(process.cwd(), "source-assets/fonts/SpaceGrotesk-Bold.ttf"),
	);
	const jbm = await readFile(
		path.join(process.cwd(), "source-assets/fonts/JetBrainsMono-Regular.ttf"),
	);

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					background:
						"linear-gradient(135deg, #0a0c12 0%, #12141c 55%, #1a1533 100%)",
					padding: "72px 84px",
					fontFamily: "Space Grotesk",
					position: "relative",
				}}
			>
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						backgroundImage:
							"linear-gradient(to right, rgba(124,92,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,92,255,0.10) 1px, transparent 1px)",
						backgroundSize: "48px 48px",
					}}
				/>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<div
						style={{
							width: 52,
							height: 52,
							borderRadius: 12,
							background: "linear-gradient(135deg,#7c5cff,#4f6bff)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 22,
							fontWeight: 700,
						}}
					>
						LX
					</div>
					<div
						style={{
							fontSize: 15,
							letterSpacing: 4,
							color: "#8b90a0",
							fontFamily: "JetBrains Mono",
						}}
					>
						RHINE ARCHIVE OS // V2
					</div>
				</div>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						style={{
							width: 96,
							height: 10,
							borderRadius: 5,
							background: "linear-gradient(90deg,#7c5cff,#4f6bff)",
							marginBottom: 28,
						}}
					/>
					<div
						style={{
							fontSize: 88,
							fontWeight: 700,
							color: "#e8eaf0",
							letterSpacing: -2,
						}}
					>
						RHINE
					</div>
					<div
						style={{
							fontSize: 88,
							fontWeight: 700,
							letterSpacing: -2,
							background: "linear-gradient(90deg,#9b85ff,#4f6bff)",
							backgroundClip: "text",
							color: "transparent",
						}}
					>
						ARCHIVE OS
					</div>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div
						style={{
							fontSize: 20,
							letterSpacing: 3,
							color: "#6b7080",
							fontFamily: "JetBrains Mono",
						}}
					>
						LEERSXIE.GITHUB.IO
					</div>
					<div
						style={{
							fontSize: 18,
							color: "#9b85ff",
							fontFamily: "JetBrains Mono",
						}}
					>
						▸ OPEN ARCHIVE
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{ name: "Space Grotesk", data: grotesk, weight: 700, style: "normal" },
				{ name: "JetBrains Mono", data: jbm, weight: 400, style: "normal" },
			],
		},
	);
}

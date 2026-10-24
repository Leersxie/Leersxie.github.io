/** @type {import('next').NextConfig} */
const nextConfig = {
	// GitHub Pages 纯静态导出
	output: "export",
	images: { unoptimized: true },
	trailingSlash: true,
};

export default nextConfig;

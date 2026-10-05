import { describe, expect, it } from "vitest";

import {
	getCategoryUrl,
	getDir,
	getFileDirFromPath,
	getPostUrl,
	getPostUrlByAlias,
	getPostUrlBySlug,
	getTagUrl,
	pathsEqual,
	removeFileExtension,
	url,
} from "../src/utils/url-utils";

describe("removeFileExtension", () => {
	it("去掉 md / mdx / markdown 扩展名", () => {
		expect(removeFileExtension("hello.md")).toBe("hello");
		expect(removeFileExtension("hello.mdx")).toBe("hello");
		expect(removeFileExtension("hello.markdown")).toBe("hello");
	});

	it("大小写不敏感，且保留目录部分", () => {
		expect(removeFileExtension("dir/Hello.MD")).toBe("dir/Hello");
	});

	it("不触碰其他扩展名", () => {
		expect(removeFileExtension("hello.txt")).toBe("hello.txt");
	});
});

describe("pathsEqual", () => {
	it("忽略首尾斜杠与大小写", () => {
		expect(pathsEqual("/About/", "about")).toBe(true);
		expect(pathsEqual("/", "")).toBe(true);
		expect(pathsEqual("/posts/", "/archive/")).toBe(false);
	});
});

describe("getDir / getFileDirFromPath", () => {
	it("getDir 返回以斜杠结尾的目录", () => {
		expect(getDir("posts/foo.md")).toBe("posts/");
		expect(getDir("foo.md")).toBe("/");
	});

	it("getFileDirFromPath 去掉 src 前缀与文件名", () => {
		expect(getFileDirFromPath("src/content/posts/foo.md")).toBe(
			"content/posts",
		);
		expect(getFileDirFromPath("content/posts/foo.md")).toBe("content/posts");
	});
});

describe("URL 拼接", () => {
	it("url 以 BASE_URL 为前缀且不产生重复斜杠", () => {
		expect(url("/posts/foo/")).toBe("/posts/foo/");
		expect(url("posts/foo/")).toBe("/posts/foo/");
	});

	it("文章默认走 /posts/<slug>/", () => {
		expect(getPostUrlBySlug("foo.md")).toBe("/posts/foo/");
	});

	it("alias 统一挂到 /posts/ 下", () => {
		expect(getPostUrlByAlias("/bar/")).toBe("/posts/bar/");
	});

	it("标签与分类跳转到归档页的查询参数", () => {
		expect(getTagUrl("测试")).toBe(
			`/archive/?tag=${encodeURIComponent("测试")}`,
		);
		expect(getTagUrl("")).toBe("/archive/");
		expect(getCategoryUrl("日常")).toBe(
			`/archive/?category=${encodeURIComponent("日常")}`,
		);
		expect(getCategoryUrl(null)).toBe("/archive/?uncategorized=true");
		expect(getCategoryUrl("   ")).toBe("/archive/?uncategorized=true");
	});
});

describe("getPostUrl", () => {
	// permalinkConfig.enable 当前为 false，因此自定义 permalink 优先级最高，
	// 其次是 alias，最后是文件名 slug。
	it("优先使用自定义 permalink（根路径）", () => {
		expect(
			getPostUrl({ id: "foo.md", data: { permalink: "/custom/" } }),
		).toBe("/custom/");
	});

	it("其次使用 alias", () => {
		expect(getPostUrl({ id: "foo.md", data: { alias: "/bar/" } })).toBe(
			"/posts/bar/",
		);
	});

	it("默认使用文件名 slug", () => {
		expect(getPostUrl({ id: "dir/foo.md", data: {} })).toBe("/posts/dir/foo/");
	});
});

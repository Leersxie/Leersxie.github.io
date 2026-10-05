import { beforeEach, describe, expect, it } from "vitest";

import {
	clearPostIdMap,
	generatePermalinkSlug,
	getPermalinkPath,
	getPostNumericId,
	hasCustomPermalink,
	initPostIdMap,
} from "../src/utils/permalink-utils";

/** 构造最小可用的文章对象（仅覆盖被测函数读取的字段） */
const makePost = (overrides: Record<string, unknown> = {}) =>
	({
		id: "foo.md",
		filePath: "src/content/posts/foo.md",
		data: { published: new Date("2026-01-01T00:00:00Z") },
		...overrides,
	}) as never;

describe("hasCustomPermalink", () => {
	it("仅在声明 permalink 时为 true", () => {
		expect(hasCustomPermalink(makePost())).toBe(false);
		expect(
			hasCustomPermalink(
				makePost({ data: { permalink: "/custom/", published: new Date() } }),
			),
		).toBe(true);
	});
});

describe("generatePermalinkSlug", () => {
	// 当前 permalinkConfig.enable 为 false
	it("自定义 permalink 去掉首尾斜杠后返回", () => {
		expect(
			generatePermalinkSlug(
				makePost({
					data: {
						permalink: "/custom/path/",
						published: new Date("2026-01-01T00:00:00Z"),
					},
				}),
			),
		).toBe("custom/path");
	});

	it("全局 permalink 关闭时优先使用 alias", () => {
		expect(
			generatePermalinkSlug(
				makePost({
					data: {
						alias: "/bar/",
						published: new Date("2026-01-01T00:00:00Z"),
					},
				}),
			),
		).toBe("bar");
	});

	it("都没有时回退到文件名", () => {
		expect(generatePermalinkSlug(makePost({ id: "dir/foo.md" }))).toBe(
			"dir/foo",
		);
	});

	it("getPermalinkPath 始终返回根路径", () => {
		expect(getPermalinkPath(makePost({ id: "dir/foo.md" }))).toBe(
			"/dir/foo/",
		);
	});
});

describe("文章序号映射", () => {
	beforeEach(() => {
		clearPostIdMap();
	});

	it("按发布时间升序编号，从 1 开始", () => {
		initPostIdMap([
			makePost({
				id: "old.md",
				data: { published: new Date("2025-01-01T00:00:00Z") },
			}),
			makePost({
				id: "new.md",
				data: { published: new Date("2026-06-01T00:00:00Z") },
			}),
		] as never);

		expect(getPostNumericId("old.md")).toBe(1);
		expect(getPostNumericId("new.md")).toBe(2);
	});

	it("未初始化的 id 返回 0", () => {
		initPostIdMap([] as never);
		expect(getPostNumericId("unknown.md")).toBe(0);
	});

	it("clearPostIdMap 后可重新初始化", () => {
		initPostIdMap([
			makePost({
				id: "a.md",
				data: { published: new Date("2026-01-01T00:00:00Z") },
			}),
		] as never);
		expect(getPostNumericId("a.md")).toBe(1);

		clearPostIdMap();
		initPostIdMap([
			makePost({
				id: "b.md",
				data: { published: new Date("2026-01-01T00:00:00Z") },
			}),
		] as never);
		expect(getPostNumericId("b.md")).toBe(1);
		expect(getPostNumericId("a.md")).toBe(0);
	});
});

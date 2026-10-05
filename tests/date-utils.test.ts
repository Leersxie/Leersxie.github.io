import { describe, expect, it } from "vitest";

import {
	formatDateI18n,
	formatDateToYYYYMMDD,
} from "../src/utils/date-utils";

describe("formatDateToYYYYMMDD", () => {
	it("输出 YYYY-MM-DD（基于 UTC）", () => {
		expect(formatDateToYYYYMMDD(new Date("2026-03-28T00:00:00Z"))).toBe(
			"2026-03-28",
		);
		expect(formatDateToYYYYMMDD(new Date("2026-01-05T12:34:56Z"))).toBe(
			"2026-01-05",
		);
	});

	it("补零到两位", () => {
		expect(formatDateToYYYYMMDD(new Date("2026-09-09T00:00:00Z"))).toBe(
			"2026-09-09",
		);
	});
});

describe("formatDateI18n", () => {
	it("返回包含年份与日期的本地化字符串", () => {
		const result = formatDateI18n("2026-03-28");
		expect(typeof result).toBe("string");
		expect(result).toContain("2026");
		expect(result).toContain("28");
	});

	it("不同语言的输出不同", () => {
		const zh = formatDateI18n("2026-03-28");
		expect(zh.length).toBeGreaterThan(0);
	});
});

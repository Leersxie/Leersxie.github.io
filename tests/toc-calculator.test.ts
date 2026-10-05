import { describe, expect, it } from "vitest";

import {
	generateTOCItems,
	getBadgeClass,
	getBadgeText,
	getIndentClass,
	getMinLevel,
	getTextClass,
	isInRange,
} from "../src/components/features/toc/utils/toc-calculator";
import { JAPANESE_KATAKANA } from "../src/components/features/toc/utils/japanese-katakana";

const h = (level: number, id: string, text = id) => ({ level, id, text });

describe("getMinLevel", () => {
	it("空数组回退为 1", () => {
		expect(getMinLevel([])).toBe(1);
	});

	it("返回最小标题级别", () => {
		expect(getMinLevel([h(3, "a"), h(2, "b"), h(4, "c")])).toBe(2);
	});
});

describe("getBadgeText", () => {
	it("非最小级别不显示徽章", () => {
		expect(getBadgeText(0, 3, 2, false)).toBe("");
	});

	it("默认使用从 1 开始的数字", () => {
		expect(getBadgeText(0, 2, 2, false)).toBe("1");
		expect(getBadgeText(2, 2, 2, false)).toBe("3");
	});

	it("开启日文徽章时使用片假名", () => {
		expect(getBadgeText(0, 2, 2, true)).toBe(JAPANESE_KATAKANA[0]);
	});
});

describe("generateTOCItems", () => {
	const headings = [h(2, "a"), h(3, "b"), h(4, "c"), h(2, "d")];

	it("空输入返回空数组", () => {
		expect(generateTOCItems([], 2, false)).toEqual([]);
	});

	it("按 depth 截断层级", () => {
		const items = generateTOCItems(headings, 1, false);
		expect(items.map((i) => i.id)).toEqual(["a", "d"]);
	});

	it("计算相对深度并从 0 递增 depth", () => {
		const items = generateTOCItems(headings, 3, false);
		expect(items.map((i) => i.depth)).toEqual([0, 1, 2, 0]);
	});

	it("徽章只在最小级别上出现且逐个递增", () => {
		const items = generateTOCItems(headings, 3, false);
		expect(items.map((i) => i.badge)).toEqual(["1", "", "", "2"]);
	});
});

describe("样式类辅助函数", () => {
	it("getBadgeClass 按级别区分", () => {
		const top = getBadgeClass(2, 2);
		const second = getBadgeClass(3, 2);
		const deeper = getBadgeClass(4, 2);
		expect(new Set([top, second, deeper]).size).toBe(3);
	});

	it("getIndentClass 按深度递增缩进", () => {
		expect(getIndentClass(0)).toBe("");
		expect(getIndentClass(1)).toBe("ml-4");
		expect(getIndentClass(2)).toBe("ml-8");
		expect(getIndentClass(9)).toBe("ml-8");
	});

	it("getTextClass 区分前两级与更深层级", () => {
		expect(getTextClass(2, 2)).toBe(getTextClass(3, 2));
		expect(getTextClass(4, 2)).not.toBe(getTextClass(2, 2));
	});
});

describe("isInRange", () => {
	it("使用开区间判断", () => {
		expect(isInRange(5, 0, 10)).toBe(true);
		expect(isInRange(0, 0, 10)).toBe(false);
		expect(isInRange(10, 0, 10)).toBe(false);
	});
});

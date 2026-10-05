import { describe, expect, it } from "vitest";

import { getLanguageDisplayName } from "../src/utils/language-utils";

describe("getLanguageDisplayName", () => {
	it("识别配置文件格式的语言代码", () => {
		expect(getLanguageDisplayName("zh_CN")).toBe("简体中文");
		expect(getLanguageDisplayName("zh_TW")).toBe("繁體中文");
		expect(getLanguageDisplayName("en")).toBe("English");
		expect(getLanguageDisplayName("ja")).toBe("日本語");
	});

	it("识别翻译服务格式的语言代码", () => {
		expect(getLanguageDisplayName("chinese_simplified")).toBe("简体中文");
		expect(getLanguageDisplayName("english")).toBe("English");
	});

	it("未知语言代码原样返回", () => {
		expect(getLanguageDisplayName("xx_YY")).toBe("xx_YY");
	});
});

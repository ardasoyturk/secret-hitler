import { describe, expect, test } from "bun:test";

import {
	APP_LANGUAGE_STORAGE_KEY,
	getLanguageFromBrowserLocale,
	loadStoredLanguage,
	resolveAppLanguage,
	saveStoredLanguage,
	type StorageLike,
} from "../src/i18n";

class MemoryStorage implements StorageLike {
	private readonly store = new Map<string, string>();

	getItem(key: string): string | null {
		return this.store.get(key) ?? null;
	}

	setItem(key: string, value: string): void {
		this.store.set(key, value);
	}
}

describe("i18n helpers", () => {
	test("stored language overrides the browser locale", () => {
		expect(
			resolveAppLanguage({
				storedLanguage: "tr",
				browserLanguage: "en-US",
			}),
		).toBe("tr");
	});

	test("invalid or missing stored language falls back to the browser locale", () => {
		expect(
			resolveAppLanguage({
				storedLanguage: "de",
				browserLanguage: "tr-TR",
			}),
		).toBe("tr");

		expect(
			resolveAppLanguage({
				storedLanguage: null,
				browserLanguage: "en-GB",
			}),
		).toBe("en");
	});

	test("browser locale detection prefers Turkish only for Turkish locales", () => {
		expect(getLanguageFromBrowserLocale("tr-TR")).toBe("tr");
		expect(getLanguageFromBrowserLocale("en-US")).toBe("en");
		expect(getLanguageFromBrowserLocale(undefined)).toBe("en");
	});

	test("language persistence round-trips for both locales", () => {
		const storage = new MemoryStorage();

		saveStoredLanguage("tr", storage);
		expect(storage.getItem(APP_LANGUAGE_STORAGE_KEY)).toBe("tr");
		expect(loadStoredLanguage(storage)).toBe("tr");

		saveStoredLanguage("en", storage);
		expect(storage.getItem(APP_LANGUAGE_STORAGE_KEY)).toBe("en");
		expect(loadStoredLanguage(storage)).toBe("en");
	});

	test("invalid persisted values are ignored", () => {
		const storage = new MemoryStorage();
		storage.setItem(APP_LANGUAGE_STORAGE_KEY, "fr");

		expect(loadStoredLanguage(storage)).toBeNull();
	});
});

import { MESSAGE_CATALOGS } from "./messages";

export type AppLanguage = "en" | "tr";

export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

export const APP_LANGUAGE_STORAGE_KEY = "secret-hitler-language";
export const DEFAULT_APP_LANGUAGE: AppLanguage = "en";
export const SUPPORTED_APP_LANGUAGES = Object.keys(
	MESSAGE_CATALOGS,
) as AppLanguage[];

export function isAppLanguage(
	value: string | null | undefined,
): value is AppLanguage {
	return (
		value !== null &&
		value !== undefined &&
		SUPPORTED_APP_LANGUAGES.includes(value as AppLanguage)
	);
}

export function getLanguageFromBrowserLocale(
	browserLanguage: string | null | undefined,
): AppLanguage {
	if (!browserLanguage) return DEFAULT_APP_LANGUAGE;
	return browserLanguage.toLowerCase().startsWith("tr") ? "tr" : "en";
}

export function resolveAppLanguage({
	storedLanguage,
	browserLanguage,
}: {
	storedLanguage?: string | null;
	browserLanguage?: string | null;
}): AppLanguage {
	if (isAppLanguage(storedLanguage)) {
		return storedLanguage;
	}

	return getLanguageFromBrowserLocale(browserLanguage);
}

export function loadStoredLanguage(
	storage: StorageLike = localStorage,
): AppLanguage | null {
	try {
		const language = storage.getItem(APP_LANGUAGE_STORAGE_KEY);
		return isAppLanguage(language) ? language : null;
	} catch {
		return null;
	}
}

export function saveStoredLanguage(
	language: AppLanguage,
	storage: StorageLike = localStorage,
): void {
	try {
		storage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
	} catch {
		// localStorage might be unavailable.
	}
}

export function getInitialAppLanguage(): AppLanguage {
	if (typeof window === "undefined") {
		return DEFAULT_APP_LANGUAGE;
	}

	return resolveAppLanguage({
		storedLanguage: loadStoredLanguage(window.localStorage),
		browserLanguage:
			window.navigator.languages?.[0] ?? window.navigator.language,
	});
}

export const DOCUMENT_COPY = {
	en: MESSAGE_CATALOGS.en.document,
	tr: MESSAGE_CATALOGS.tr.document,
} as const;

const TURKISH_ASCII_REPLACEMENTS: Record<string, string> = {
	ç: "c",
	Ç: "C",
	ğ: "g",
	Ğ: "G",
	ı: "i",
	İ: "I",
	ö: "o",
	Ö: "O",
	ş: "s",
	Ş: "S",
	ü: "u",
	Ü: "U",
};

export function toFontSafeText(text: string, language: AppLanguage): string {
	if (language !== "tr") {
		return text;
	}

	return text.replaceAll(
		/[ğĞİşŞ]/g,
		(character) => TURKISH_ASCII_REPLACEMENTS[character] ?? character,
	);
}

export function syncDocumentLanguage(language: AppLanguage): void {
	if (typeof document === "undefined") {
		return;
	}

	document.documentElement.lang = language;
	document.title = DOCUMENT_COPY[language].title;

	const description = document.querySelector('meta[name="description"]');
	if (description instanceof HTMLMetaElement) {
		description.content = DOCUMENT_COPY[language].description;
	}
}

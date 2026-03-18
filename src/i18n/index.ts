export { MESSAGE_CATALOGS } from "./messages";
export type { MessageCatalog } from "./messages";
export { I18nProvider, useI18n } from "./provider";
export {
	APP_LANGUAGE_STORAGE_KEY,
	DEFAULT_APP_LANGUAGE,
	DOCUMENT_COPY,
	SUPPORTED_APP_LANGUAGES,
	getInitialAppLanguage,
	getLanguageFromBrowserLocale,
	isAppLanguage,
	loadStoredLanguage,
	resolveAppLanguage,
	saveStoredLanguage,
	syncDocumentLanguage,
	toFontSafeText,
} from "./shared";
export type { AppLanguage, StorageLike } from "./shared";

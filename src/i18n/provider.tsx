import type { ComponentChildren } from "preact";
import { createContext, useContext, useEffect, useMemo, useState } from "preact/compat";

import { MESSAGE_CATALOGS } from "./messages";
import type { MessageCatalog } from "./messages";
import { getInitialAppLanguage, saveStoredLanguage, syncDocumentLanguage, toFontSafeText } from "./shared";
import type { AppLanguage } from "./shared";

interface I18nContextValue {
	language: AppLanguage;
	setLanguage: (language: AppLanguage) => void;
	messages: MessageCatalog;
	headingText: (text: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ComponentChildren }) {
	const [language, setLanguage] = useState<AppLanguage>(() => getInitialAppLanguage());

	useEffect(() => {
		saveStoredLanguage(language);
		syncDocumentLanguage(language);
	}, [language]);

	const value = useMemo<I18nContextValue>(
		() => ({
			language,
			setLanguage,
			messages: MESSAGE_CATALOGS[language],
			headingText: (text) => toFontSafeText(text, language),
		}),
		[language],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider.");
	}

	return context;
}

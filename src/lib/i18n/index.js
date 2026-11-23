import { getContext, setContext } from 'svelte';
import en from './en.json';
import es from './es.json';

export const locales = ['en', 'es'];
export const defaultLocale = 'en';
export const names = { es: 'Español', en: 'English' };

const messages = { en, es };
const storageKey = 'makeicons:lang';
const contextKey = Symbol('i18n');

export function translate(lang, key) {
	return messages[lang]?.[key] ?? messages[defaultLocale][key] ?? key;
}

// Receives a getter so the context follows locale changes on client-side navigation.
export function setI18n(getLang) {
	return setContext(contextKey, {
		get lang() {
			return getLang();
		},
		t: (key) => translate(getLang(), key)
	});
}

export function getI18n() {
	return getContext(contextKey);
}

export function detectLocale() {
	try {
		const stored = localStorage.getItem(storageKey);
		if (locales.includes(stored)) return stored;
	} catch {
		// Storage can be unavailable (private mode, blocked site data).
	}

	for (const tag of navigator.languages ?? []) {
		const base = tag.slice(0, 2).toLowerCase();
		if (locales.includes(base)) return base;
	}

	return defaultLocale;
}

export function storeLocale(lang) {
	try {
		localStorage.setItem(storageKey, lang);
	} catch {
		// Storage can be unavailable (private mode, blocked site data).
	}
}

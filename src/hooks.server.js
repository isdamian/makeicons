import { defaultLocale, locales } from '#lib/i18n/index.js';

export function handle({ event, resolve }) {
	const lang = locales.includes(event.params.lang) ? event.params.lang : defaultLocale;

	// Fill the %lang% placeholder in app.html with the route locale.
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
}

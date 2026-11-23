<script>
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { detectLocale, locales, names } from '#lib/i18n/index.js';
	import { site } from '#lib/site.js';

	// The root is prerendered, so locale detection and redirect run only in the browser.
	onMount(() => {
		location.replace(`/${detectLocale()}/`);
	});
</script>

<svelte:head>
	<title>{site.name}</title>
</svelte:head>

<noscript>
	<ul>
		{#each locales as locale (locale)}
			<li><a href={resolve('/[lang]', { lang: locale })} hreflang={locale}>{names[locale]}</a></li>
		{/each}
	</ul>
</noscript>

<script>
	import Editor from '#lib/components/Editor.svelte';
	import UploadCard from '#lib/components/UploadCard.svelte';
	import { getI18n, locales } from '#lib/i18n/index.js';
	import { site } from '#lib/site.js';
	import { source } from '#lib/state.svelte.js';

	const i18n = getI18n();
</script>

<svelte:head>
	<title>{i18n.t('meta.title')}</title>
	<meta name="description" content={i18n.t('meta.description')} />
	<link rel="canonical" href="{site.url}/{i18n.lang}/" />
	{#each locales as locale (locale)}
		<link rel="alternate" hreflang={locale} href="{site.url}/{locale}/" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{site.url}/" />
</svelte:head>

<section class="intro">
	<h1>{i18n.t('intro.title')}</h1>
	<p>{i18n.t('intro.subtitle')}</p>
</section>

<!-- The example image has no name, so the upload card stays until a file is loaded. -->
{#if !source.name}
	<UploadCard />
{/if}
<Editor />

<style>
	.intro {
		margin-bottom: 26px;
	}

	h1 {
		font-size: clamp(31px, 5vw, 42px);
		line-height: 1.1;
		letter-spacing: -1.9px;
		margin: 0 0 10px;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: var(--muted);
		font-size: 14px;
		line-height: 1.6;
	}
</style>

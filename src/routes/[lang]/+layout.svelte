<script>
	import { page } from '$app/state';
	import Footer from '#lib/components/Footer.svelte';
	import Header from '#lib/components/Header.svelte';
	import { setI18n } from '#lib/i18n/index.js';

	let { children } = $props();

	const i18n = setI18n(() => page.params.lang);

	// Keep the document language in sync after client-side locale changes.
	$effect(() => {
		document.documentElement.lang = i18n.lang;
	});
</script>

<Header />
<main>
	{@render children()}
</main>
<Footer />

<style>
	main {
		width: min(100% - var(--gutter), var(--shell));
		margin: 0 auto;
		padding: 57px 0 64px;
	}

	@media (max-width: 560px) {
		main {
			padding-top: 42px;
		}
	}
</style>

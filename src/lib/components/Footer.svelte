<script>
	import { resolve } from '$app/paths';
	import { getI18n, locales, names, storeLocale } from '#lib/i18n/index.js';
	import { site } from '#lib/site.js';

	const i18n = getI18n();
</script>

<footer>
	<div class="footer-inner">
		<div class="footer-card">
			<div class="footer-main">
				<div class="footer-brand">
					{site.name}
					<span class="footer-slogan">· {i18n.t('footer.tagline')}</span>
				</div>

				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a class="footer-source" href={site.repository} target="_blank" rel="noreferrer">
					{i18n.t('footer.source')} <span aria-hidden="true">↗</span>
				</a>
			</div>

			<div class="footer-bottom">
				<span>© {site.year} {site.author}</span>

				<nav class="footer-language" aria-label={i18n.t('language.label')}>
					{#each locales as locale (locale)}
						<a
							href={resolve('/[lang]', { lang: locale })}
							hreflang={locale}
							lang={locale}
							title={names[locale]}
							aria-current={locale === i18n.lang ? 'true' : undefined}
							onclick={() => storeLocale(locale)}
						>
							{locale.toUpperCase()}
						</a>
					{/each}
				</nav>
			</div>
		</div>
	</div>
</footer>

<style>
	footer {
		padding: 24px 0 30px;
	}

	.footer-inner {
		width: min(100% - var(--gutter), var(--shell));
		margin: 0 auto;
	}

	.footer-card {
		display: flex;
		flex-direction: column;
		gap: 17px;
		padding: 17px 19px;
		border: 1px solid var(--line);
		border-radius: 13px;
		background: #fff;
	}

	.footer-main,
	.footer-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
	}

	.footer-brand {
		font-size: 13px;
		font-weight: 650;
		letter-spacing: -0.3px;
	}

	.footer-slogan {
		color: var(--muted);
		font-size: 11px;
		font-weight: 400;
	}

	.footer-source {
		color: #404040;
		font-size: 11px;
		font-weight: 550;
		text-decoration: none;
		white-space: nowrap;
	}

	.footer-source:hover {
		color: var(--blue);
	}

	.footer-bottom {
		color: var(--muted);
		font-size: 10px;
	}

	.footer-language {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.footer-language a {
		padding: 4px 5px;
		color: #a3a3a3;
		font-size: 10px;
		text-decoration: none;
	}

	.footer-language a[aria-current='true'] {
		color: #262626;
		font-weight: 600;
	}

	.footer-source:focus-visible,
	.footer-language a:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
		border-radius: 4px;
	}

	@media (max-width: 560px) {
		footer {
			padding-top: 18px;
		}

		.footer-card {
			padding: 15px;
		}

		.footer-main,
		.footer-bottom {
			gap: 10px;
		}

		.footer-brand {
			font-size: 12px;
		}

		.footer-slogan,
		.footer-source {
			font-size: 10px;
		}
	}
</style>

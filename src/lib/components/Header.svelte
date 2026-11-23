<script>
	import { getI18n } from '#lib/i18n/index.js';
	import { site } from '#lib/site.js';

	const i18n = getI18n();
</script>

<header>
	<div class="nav">
		<div class="brand">
			<div class="brand-mark" aria-hidden="true">
				<svg viewBox="0 0 100 100">
					<g fill="#fff">
						<rect x="10" y="10" width="34" height="34" rx="7" />
						<rect x="56" y="10" width="34" height="34" rx="7" />
						<rect x="10" y="56" width="34" height="34" rx="7" />
						<rect x="56" y="56" width="34" height="34" rx="7" />
					</g>
				</svg>
			</div>
			{site.name}
		</div>
		<span class="nav-note">{i18n.t('header.note')}</span>
	</div>
</header>

<style>
	header {
		height: 68px;
		border-bottom: 1px solid var(--line);
	}

	.nav {
		width: min(100% - var(--gutter), var(--shell));
		height: 100%;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 15px;
		font-weight: 650;
		letter-spacing: -0.4px;
	}

	.brand-mark {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--blue);
		display: grid;
		place-items: center;
	}

	.brand-mark svg {
		width: 19px;
		height: 19px;
	}

	.nav-note {
		color: var(--muted);
		font-size: 11px;
		font-weight: 550;
		letter-spacing: 0.09em;
	}
</style>

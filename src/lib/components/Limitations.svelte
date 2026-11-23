<script>
	import { getI18n } from '#lib/i18n/index.js';

	const i18n = getI18n();
	const items = ['png', 'vector', 'jpg', 'font', 'monochrome'];

	let open = $state(false);
</script>

<div class="limits">
	<button
		class="toggle"
		type="button"
		aria-expanded={open}
		aria-controls="limits-list"
		onclick={() => (open = !open)}
	>
		{i18n.t('limits.title')}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path d="m7 10 5 5 5-5" />
		</svg>
	</button>
	<ul id="limits-list" hidden={!open}>
		{#each items as item (item)}
			<li>{i18n.t(`limits.${item}`)}</li>
		{/each}
	</ul>
</div>

<style>
	.limits {
		margin-top: 20px;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 0;
		border: 0;
		background: transparent;
		color: var(--muted);
		font-size: 11px;
		font-weight: 550;
	}

	.toggle svg {
		width: 13px;
		height: 13px;
		transition: transform 0.15s;
	}

	.toggle[aria-expanded='true'] svg {
		transform: rotate(180deg);
	}

	.toggle:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
		border-radius: 4px;
	}

	ul {
		margin: 8px 0 0;
		padding-left: 18px;
		color: var(--muted);
		font-size: 11px;
		line-height: 1.6;
	}

	ul[hidden] {
		display: none;
	}

	li + li {
		margin-top: 6px;
	}
</style>

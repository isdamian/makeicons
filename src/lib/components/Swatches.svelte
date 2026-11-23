<script>
	import { getI18n } from '#lib/i18n/index.js';

	let { colors, value, label, onselect } = $props();

	const i18n = getI18n();
</script>

<div class="swatches" role="group" aria-label={label}>
	{#each colors as color (color.value)}
		<button
			class="swatch"
			class:selected={color.value === value}
			type="button"
			style:background={color.value}
			aria-label={i18n.t(color.key)}
			aria-pressed={color.value === value}
			onclick={() => onselect(color.value)}
		></button>
	{/each}
</div>

<style>
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 9px;
		margin-bottom: 12px;
	}

	.swatch {
		width: 26px;
		height: 26px;
		border-radius: 8px;
		border: 1px solid #00000018;
		padding: 0;
	}

	.swatch.selected {
		outline: 2px solid var(--blue);
		outline-offset: 3px;
	}

	.swatch:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 3px;
	}
</style>

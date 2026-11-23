<script>
	import { getI18n } from '#lib/i18n/index.js';
	import { copyHead, downloadPreview, downloadSet } from '#lib/icons/export.js';
	import { activeTier, files, resolveFiles, tiers, unavailableReason } from '#lib/icons/presets.js';
	import { outputs, selectTier, settings, source, toggleFile } from '#lib/state.svelte.js';

	const i18n = getI18n();

	const active = $derived(activeTier(outputs.ids, source));
	const selectedCount = $derived(resolveFiles(outputs.ids, source).length);

	let copied = $state(false);

	function detail(file) {
		if (file.detailKey) return i18n.t(file.detailKey);
		if (file.sizes) return `${file.sizes.join(', ')} px`;

		return `${file.size} × ${file.size} px`;
	}

	async function copy() {
		try {
			await copyHead(source, settings, outputs.ids);
		} catch {
			return;
		}

		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<hr />

<h2 class="group-title">{i18n.t('outputs.title')}</h2>
<div class="segmented" role="group" aria-label={i18n.t('outputs.presets')}>
	{#each tiers as tier (tier)}
		<button
			class="segment"
			class:active={active === tier}
			type="button"
			aria-pressed={active === tier}
			onclick={() => selectTier(tier)}
		>
			{i18n.t(`outputs.${tier}`)}
		</button>
	{/each}
</div>

<div class="output-list">
	{#each files as file (file.id)}
		{@const reason = unavailableReason(file, source)}
		{@const checked = !reason && outputs.ids.includes(file.id)}
		<button
			class="output-row"
			type="button"
			role="checkbox"
			aria-checked={checked}
			disabled={Boolean(reason)}
			onclick={() => toggleFile(file.id)}
		>
			<span class="checkbox" class:checked aria-hidden="true">
				{#if checked}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m5 12 5 5 9-10" />
					</svg>
				{/if}
			</span>
			<span class="output-text">
				<span class="output-name">{file.name}</span>
				<span class="output-detail">{reason ? i18n.t(reason) : detail(file)}</span>
			</span>
			<span class="format">{file.format}</span>
		</button>
	{/each}
</div>

<div class="actions">
	<button
		class="button primary"
		type="button"
		disabled={selectedCount === 0}
		onclick={() => downloadSet(source, settings, outputs.ids)}
	>
		{i18n.t('actions.downloadAll')}
	</button>
	<button class="button" type="button" onclick={() => downloadPreview(source, settings)}>
		{i18n.t('actions.downloadPreview')}
	</button>
	<button class="button" type="button" disabled={selectedCount === 0} onclick={copy}>
		{copied ? i18n.t('actions.copied') : i18n.t('actions.copyHtml')}
	</button>
</div>

<style>
	hr {
		height: 1px;
		margin: 22px 0;
		border: 0;
		background: var(--line);
	}

	.group-title {
		font-size: 13px;
		font-weight: 600;
		margin: 0 0 17px;
	}

	.segmented {
		padding: 3px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3px;
		background: #f3f3f3;
		border-radius: 8px;
	}

	.segment {
		border: 0;
		border-radius: 6px;
		padding: 8px 12px;
		color: var(--muted);
		background: transparent;
		font-size: 11px;
		font-weight: 500;
	}

	.segment.active {
		background: #fff;
		color: #171717;
		box-shadow: 0 1px 3px #00000012;
	}

	.segment:focus-visible,
	.output-row:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.output-list {
		display: grid;
		margin-top: 8px;
	}

	.output-row {
		width: 100%;
		min-height: 46px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0;
		border: 0;
		border-bottom: 1px solid #f0f0f0;
		background: transparent;
		text-align: left;
		color: inherit;
	}

	.output-row:last-child {
		border-bottom: 0;
	}

	.output-row:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.checkbox {
		width: 16px;
		height: 16px;
		flex: none;
		display: grid;
		place-items: center;
		border: 1px solid #d4d4d4;
		border-radius: 5px;
		background: #fff;
		color: #fff;
	}

	.checkbox.checked {
		border-color: var(--blue);
		background: var(--blue);
	}

	.checkbox svg {
		width: 11px;
		height: 11px;
	}

	.output-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.output-name {
		font-size: 11px;
		font-weight: 500;
	}

	.output-detail {
		color: var(--muted);
		font-size: 10px;
	}

	.format {
		color: var(--muted);
		font-size: 9px;
		font-weight: 600;
		border: 1px solid var(--line);
		border-radius: 5px;
		padding: 4px 6px;
	}

	.actions {
		display: flex;
		gap: 8px;
		margin-top: 20px;
	}

	.button {
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		background: #fff;
		color: #262626;
		padding: 9px 13px;
		font-size: 12px;
		font-weight: 550;
	}

	.button.primary {
		flex: 1;
		background: #171717;
		border-color: #171717;
		color: #fff;
	}

	.button:hover:not(:disabled) {
		filter: brightness(0.96);
	}

	.button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.button:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	@media (max-width: 560px) {
		.actions {
			flex-direction: column;
		}

		.actions .button {
			min-height: 40px;
		}
	}
</style>

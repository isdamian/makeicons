<script>
	import { onMount } from 'svelte';
	import Controls from '#lib/components/Controls.svelte';
	import Limitations from '#lib/components/Limitations.svelte';
	import Outputs from '#lib/components/Outputs.svelte';
	import PreviewSelect from '#lib/components/PreviewSelect.svelte';
	import { getI18n } from '#lib/i18n/index.js';
	import { drawIcon } from '#lib/icons/draw.js';
	import { renderDarkPreview } from '#lib/icons/export.js';
	import { pickFile, settings, showExample, source } from '#lib/state.svelte.js';

	const PREVIEW_SIZE = 512;

	const i18n = getI18n();

	// Approximates the OS mask of the Apple icon. Maskable icons are shown as exported.
	const previewRadius = { any: '0', apple: '22.37%', maskable: '0', monochrome: '0', dark: '0' };

	let canvas = $state();

	onMount(showExample);

	// Redraw the preview whenever the image, the icon type or any setting changes.
	// The dark preview rasterizes favicon.svg with its dark-mode rules applied.
	$effect(() => {
		if (!canvas) return;

		const type = settings.previewType;

		if (type !== 'dark' || !source.markup) {
			drawIcon(canvas, PREVIEW_SIZE, source.image, settings, type);
			return;
		}

		let stale = false;

		renderDarkPreview(source, settings)
			.then((image) => {
				if (stale) return;

				const context = canvas.getContext('2d');

				context.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
				context.drawImage(image, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
			})
			.catch((error) => console.error(error));

		return () => {
			stale = true;
		};
	});
</script>

<section>
	<div class="section-heading">
		<div class="heading-title">
			<h2>{i18n.t('preview.title')}</h2>
			{#if source.name}
				<button class="text-button" type="button" onclick={pickFile}>
					{i18n.t('actions.change')}
				</button>
			{/if}
		</div>
		<div class="file-info">
			<span class="dot"></span>
			<span class="file-name">{source.name ?? i18n.t('preview.example')}</span>
		</div>
	</div>

	{#if source.warnings.length}
		<div class="notices" role="status">
			{#each source.warnings as warning (warning)}
				<p>{i18n.t(`warning.${warning}`)}</p>
			{/each}
		</div>
	{/if}

	<div class="workspace">
		<div class="preview-area" class:dark={settings.previewType === 'dark'}>
			<div class="preview-stage">
				<canvas
					width={PREVIEW_SIZE}
					height={PREVIEW_SIZE}
					style:border-radius={previewRadius[settings.previewType]}
					aria-label={i18n.t('preview.canvas')}
					bind:this={canvas}
				></canvas>
				{#if settings.previewType === 'maskable' && settings.maskableFit === 'margin'}
					<div class="safe-zone" aria-hidden="true"></div>
				{/if}
			</div>
			<div class="preview-caption">
				<PreviewSelect />
				<span>{i18n.t('preview.type')}</span>
			</div>
		</div>

		<div class="workspace-body">
			<Controls />
			<Outputs />
		</div>
	</div>

	<Limitations />
</section>

<style>
	.section-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-bottom: 13px;
	}

	.heading-title {
		display: flex;
		flex: none;
		align-items: center;
		gap: 10px;
	}

	h2 {
		font-size: 13px;
		font-weight: 600;
		margin: 0;
	}

	.text-button {
		border: 0;
		background: transparent;
		color: #555;
		font-size: 11px;
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.text-button:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.file-info {
		min-width: 0;
		color: var(--muted);
		font-size: 11px;
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.file-name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dot {
		width: 6px;
		height: 6px;
		flex: none;
		border-radius: 50%;
		background: #22a06b;
	}

	.notices {
		display: grid;
		gap: 8px;
		margin-bottom: 13px;
	}

	.notices p {
		margin: 0;
		padding: 10px 12px;
		border: 1px solid #fde68a;
		border-radius: 10px;
		background: #fffbeb;
		color: #92400e;
		font-size: 11px;
		line-height: 1.55;
	}

	.workspace {
		border: 1px solid var(--line);
		border-radius: 14px;
	}

	.preview-area {
		min-height: 260px;
		border-radius: 14px 14px 0 0;
		padding: 30px 20px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
		background-image: radial-gradient(#e5e5e5 0.7px, transparent 0.7px);
		background-size: 16px 16px;
	}

	.preview-area.dark {
		background-color: #1a1a1a;
		background-image: radial-gradient(#2e2e2e 0.7px, transparent 0.7px);
	}

	.preview-area.dark .preview-caption > span {
		color: #a3a3a3;
	}

	.preview-stage {
		width: 172px;
		height: 172px;
		display: grid;
		place-items: center;
	}

	canvas,
	.safe-zone {
		grid-area: 1 / 1;
	}

	canvas {
		width: 160px;
		height: 160px;
		image-rendering: auto;
		filter: drop-shadow(0 5px 12px #00000012);
	}

	.safe-zone {
		box-sizing: border-box;
		width: 128px;
		height: 128px;
		border: 1.5px dashed #fff;
		border-radius: 50%;
		mix-blend-mode: difference;
		pointer-events: none;
	}

	.preview-caption {
		margin-top: 15px;
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.preview-caption > span {
		color: var(--muted);
		font-size: 11px;
	}

	.workspace-body {
		padding: 23px 22px 22px;
	}

	@media (max-width: 560px) {
		.preview-area {
			position: sticky;
			top: 0;
			z-index: 3;
			min-height: 245px;
			border-bottom: 1px solid var(--line);
		}

		.workspace-body {
			padding: 20px 16px;
		}
	}
</style>

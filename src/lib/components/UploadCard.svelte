<script>
	import { getI18n } from '#lib/i18n/index.js';
	import { loadFile, pickFile } from '#lib/state.svelte.js';

	const i18n = getI18n();

	let dragging = $state(false);

	// Registers drag-and-drop listeners on the drop target.
	function dropzone(node) {
		const enter = (event) => {
			event.preventDefault();
			dragging = true;
		};
		const leave = (event) => {
			event.preventDefault();
			dragging = false;
		};
		const drop = (event) => {
			event.preventDefault();
			dragging = false;
			loadFile(event.dataTransfer.files[0]);
		};
		const handlers = { dragenter: enter, dragover: enter, dragleave: leave, drop };

		for (const [name, handler] of Object.entries(handlers)) {
			node.addEventListener(name, handler);
		}

		return () => {
			for (const [name, handler] of Object.entries(handlers)) {
				node.removeEventListener(name, handler);
			}
		};
	}
</script>

<section class="upload-card" class:dragging {@attach dropzone}>
	<div class="upload-icon" aria-hidden="true">
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<rect x="3" y="3" width="18" height="18" rx="4" />
			<path d="M12 16V8m-3 3 3-3 3 3" />
			<path d="M7 17h10" />
		</svg>
	</div>
	<div class="upload-title">{i18n.t('upload.title')}</div>
	<div class="upload-formats">{i18n.t('upload.formats')}</div>
	<button class="button" type="button" onclick={pickFile}>{i18n.t('upload.choose')}</button>
</section>
<p class="privacy">{i18n.t('upload.privacy')}</p>

<style>
	.upload-card {
		border: 1px dashed #d4d4d4;
		border-radius: 14px;
		padding: 29px 20px 25px;
		text-align: center;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.upload-card.dragging {
		border-color: var(--blue);
		background: #f5f8ff;
	}

	.upload-icon {
		width: 42px;
		height: 42px;
		margin: 0 auto 13px;
		border: 1px solid var(--line);
		border-radius: 12px;
		display: grid;
		place-items: center;
		color: #525252;
		background: #fff;
	}

	.upload-icon svg {
		width: 20px;
		height: 20px;
	}

	.upload-title {
		font-size: 14px;
		font-weight: 550;
		margin-bottom: 5px;
	}

	.upload-formats {
		color: var(--muted);
		font-size: 12px;
	}

	.button {
		min-width: 112px;
		margin-top: 17px;
		border: 1px solid #171717;
		border-radius: 8px;
		background: #171717;
		color: #fff;
		padding: 9px 13px;
		font-size: 12px;
		font-weight: 550;
	}

	.button:hover {
		filter: brightness(0.96);
	}

	.button:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.privacy {
		text-align: center;
		margin: 12px 0 38px;
		color: #8a8a8a;
		font-size: 11px;
	}

	@media (max-width: 560px) {
		.upload-card {
			padding: 25px 16px 22px;
		}
	}
</style>

<script>
	import { tick } from 'svelte';
	import { getI18n } from '#lib/i18n/index.js';
	import { settings, source } from '#lib/state.svelte.js';

	const i18n = getI18n();

	// The monochrome silhouette needs the alpha channel; the dark preview needs dark-mode overrides.
	const darkAvailable = $derived(
		source.vector &&
			((settings.darkBackground && settings.background === 'solid') || settings.darkLogo)
	);

	const types = $derived([
		'any',
		'apple',
		'maskable',
		...(source.vector || source.hasAlpha ? ['monochrome'] : []),
		...(darkAvailable ? ['dark'] : [])
	]);

	let open = $state(false);
	let root = $state();
	let trigger = $state();
	let menu = $state();

	// Falls back to the standard icon when the selected type is unavailable for the current image.
	$effect(() => {
		if (!types.includes(settings.previewType)) settings.previewType = 'any';
	});

	async function show() {
		open = true;
		await tick();
		menu.querySelector('[aria-selected="true"]')?.focus();
	}

	function hide(refocus = false) {
		open = false;
		if (refocus) trigger.focus();
	}

	function choose(type) {
		settings.previewType = type;
		hide(true);
	}

	function onTriggerKeydown(event) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			show();
		}
	}

	function onMenuKeydown(event) {
		const options = [...menu.querySelectorAll('[role="option"]')];
		const index = options.indexOf(document.activeElement);

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			options[(index + 1) % options.length].focus();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			options[(index - 1 + options.length) % options.length].focus();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			hide(true);
		} else if (event.key === 'Tab') {
			hide();
		}
	}

	function onWindowClick(event) {
		if (open && !root.contains(event.target)) hide();
	}
</script>

<svelte:window onclick={onWindowClick} />

<div class="custom-select" class:open bind:this={root}>
	<button
		class="select-trigger"
		type="button"
		aria-haspopup="listbox"
		aria-expanded={open}
		bind:this={trigger}
		onclick={() => (open ? hide() : show())}
		onkeydown={onTriggerKeydown}
	>
		<span>{i18n.t(`preview.${settings.previewType}`)}</span>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path d="m7 10 5 5 5-5" />
		</svg>
	</button>

	{#if open}
		<div
			class="select-menu"
			role="listbox"
			tabindex="-1"
			aria-label={i18n.t('preview.type')}
			bind:this={menu}
			onkeydown={onMenuKeydown}
		>
			{#each types as type (type)}
				<button
					class="select-option"
					class:selected={type === settings.previewType}
					type="button"
					role="option"
					aria-selected={type === settings.previewType}
					onclick={() => choose(type)}
				>
					{i18n.t(`preview.${type}`)}
					<span class="check" aria-hidden="true">✓</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.custom-select {
		position: relative;
	}

	.select-trigger {
		min-width: 170px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 10px;
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
		color: #333;
		font-size: 12px;
	}

	.select-trigger svg {
		width: 13px;
		height: 13px;
		color: var(--muted);
		transition: transform 0.15s;
	}

	.open .select-trigger svg {
		transform: rotate(180deg);
	}

	.select-menu {
		position: absolute;
		z-index: 4;
		bottom: calc(100% + 6px);
		left: 0;
		width: 100%;
		padding: 4px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: #fff;
		box-shadow: 0 8px 24px #00000012;
	}

	.select-option {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 8px;
		border: 0;
		border-radius: 6px;
		background: transparent;
		color: #404040;
		text-align: left;
		font-size: 12px;
	}

	.select-option:hover,
	.select-option:focus-visible {
		background: #f5f5f5;
	}

	.select-option.selected {
		color: var(--blue);
		background: #eff6ff;
	}

	.check {
		opacity: 0;
	}

	.selected .check {
		opacity: 1;
	}

	.select-trigger:focus-visible,
	.select-option:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}
</style>

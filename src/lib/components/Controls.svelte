<script>
	import Swatches from '#lib/components/Swatches.svelte';
	import { getI18n } from '#lib/i18n/index.js';
	import { defaultDarkColor } from '#lib/icons/colors.js';
	import { settings, source } from '#lib/state.svelte.js';

	const i18n = getI18n();

	const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

	const backgroundColors = [
		{ value: '#FFFFFF', key: 'color.white' },
		{ value: '#000000', key: 'color.black' },
		{ value: '#2563EB', key: 'color.blue' },
		{ value: '#16A34A', key: 'color.green' },
		{ value: '#F59E0B', key: 'color.amber' },
		{ value: '#EF4444', key: 'color.red' },
		{ value: '#A855F7', key: 'color.purple' },
		{ value: '#F5F5F5', key: 'color.lightGray' }
	];

	const darkColors = [
		{ value: '#000000', key: 'color.black' },
		{ value: '#171717', key: 'color.nearBlack' },
		{ value: '#262626', key: 'color.darkGray' },
		{ value: '#1E293B', key: 'color.slate' },
		{ value: '#2563EB', key: 'color.blue' },
		{ value: '#16A34A', key: 'color.green' },
		{ value: '#EF4444', key: 'color.red' },
		{ value: '#A855F7', key: 'color.purple' }
	];

	const logoColors = [
		{ value: '#FFFFFF', key: 'color.white' },
		{ value: '#000000', key: 'color.black' },
		{ value: '#F5F5F5', key: 'color.lightGray' },
		{ value: '#2563EB', key: 'color.blue' },
		{ value: '#16A34A', key: 'color.green' },
		{ value: '#F59E0B', key: 'color.amber' }
	];

	const maskableFits = ['margin', 'cover'];

	function setColor(key, value) {
		if (HEX_PATTERN.test(value)) settings[key] = value.toUpperCase();
	}

	// Invalid input is discarded by restoring the current color.
	function onHexChange(event, key) {
		setColor(key, event.currentTarget.value.trim());
		event.currentTarget.value = settings[key];
	}

	function darkValue(color) {
		return settings.darkColors[color] ?? defaultDarkColor(color);
	}

	function setLogoColor(color, value) {
		if (HEX_PATTERN.test(value)) settings.darkColors[color] = value.toUpperCase();
	}

	function onLogoHexChange(event, color) {
		setLogoColor(color, event.currentTarget.value.trim());
		event.currentTarget.value = darkValue(color);
	}

	// Selecting a maskable fit previews the maskable icon; selecting it again restores the defaults.
	function toggleMaskableFit(fit) {
		const selected = settings.maskableFit !== fit;

		settings.maskableFit = selected ? fit : null;
		settings.previewType = selected ? 'maskable' : 'any';
	}

	// Enabling a dark option switches the preview to the dark variant.
	function toggleDarkBackground() {
		settings.darkBackground = !settings.darkBackground;
		if (settings.darkBackground) settings.previewType = 'dark';
	}

	function toggleDarkLogo() {
		settings.darkLogo = !settings.darkLogo;
		if (settings.darkLogo) settings.previewType = 'dark';
	}
</script>

<h2 class="group-title">{i18n.t('shape.title')}</h2>
<div class="control">
	<div class="control-head">
		<label for="margin">{i18n.t('shape.margin')}</label>
		<span class="value">{settings.margin}%</span>
	</div>
	<input id="margin" type="range" min="0" max="30" bind:value={settings.margin} />
	<div class="range-ends"><span>{i18n.t('shape.marginNone')}</span><span>30%</span></div>
</div>
<div class="control">
	<div class="control-head">
		<label for="radius">{i18n.t('shape.radius')}</label>
		<span class="value">{settings.radius}%</span>
	</div>
	<input id="radius" type="range" min="0" max="50" bind:value={settings.radius} />
	<div class="range-ends">
		<span>{i18n.t('shape.square')}</span><span>{i18n.t('shape.rounded')}</span>
	</div>
</div>

<hr />

<h2 class="group-title">{i18n.t('background.title')}</h2>
<div class="segmented" role="group" aria-label={i18n.t('background.mode')}>
	<button
		class="segment"
		class:active={settings.background === 'transparent'}
		type="button"
		aria-pressed={settings.background === 'transparent'}
		onclick={() => (settings.background = 'transparent')}
	>
		{i18n.t('background.transparent')}
	</button>
	<button
		class="segment"
		class:active={settings.background === 'solid'}
		type="button"
		aria-pressed={settings.background === 'solid'}
		onclick={() => (settings.background = 'solid')}
	>
		{i18n.t('background.solid')}
	</button>
</div>
{#if settings.background === 'solid'}
	<div class="option-panel">
		<Swatches
			colors={backgroundColors}
			value={settings.backgroundColor}
			label={i18n.t('background.title')}
			onselect={(value) => setColor('backgroundColor', value)}
		/>
		<div class="color-input-wrap">
			<div class="color-chip" style:background={settings.backgroundColor}></div>
			<input
				class="hex-input"
				value={settings.backgroundColor}
				maxlength="7"
				aria-label={i18n.t('background.hex')}
				onchange={(event) => onHexChange(event, 'backgroundColor')}
			/>
		</div>
	</div>
{/if}
<p class="helper">{i18n.t('background.helper')}</p>

<hr />

<h2 class="group-title">{i18n.t('maskable.title')}</h2>
<div class="segmented" role="group" aria-label={i18n.t('maskable.fit')}>
	{#each maskableFits as fit (fit)}
		<button
			class="segment"
			class:active={settings.maskableFit === fit}
			type="button"
			aria-pressed={settings.maskableFit === fit}
			onclick={() => toggleMaskableFit(fit)}
		>
			{i18n.t(`maskable.${fit}`)}
		</button>
	{/each}
</div>
{#if settings.maskableFit === 'cover'}
	<p class="warning" role="status">{i18n.t('maskable.coverWarning')}</p>
{:else if settings.maskableFit === 'margin'}
	<p class="helper">{i18n.t('maskable.marginHelper')}</p>
{/if}

{#if source.vector}
	{@const solid = settings.background === 'solid'}

	<hr />

	<h2 class="group-title">{i18n.t('dark.title')}</h2>

	<div class="toggle">
		<label id="dark-background-label" for="dark-background-switch">
			{i18n.t('dark.background')}
		</label>
		<button
			class="switch"
			id="dark-background-switch"
			type="button"
			role="switch"
			aria-checked={settings.darkBackground && solid}
			aria-labelledby="dark-background-label"
			disabled={!solid}
			onclick={toggleDarkBackground}
		></button>
	</div>
	{#if !solid}
		<p class="helper">{i18n.t('dark.requiresSolid')}</p>
	{:else if settings.darkBackground}
		<div class="option-panel">
			<Swatches
				colors={darkColors}
				value={settings.darkBackgroundColor}
				label={i18n.t('dark.background')}
				onselect={(value) => setColor('darkBackgroundColor', value)}
			/>
			<div class="color-input-wrap">
				<div class="color-chip" style:background={settings.darkBackgroundColor}></div>
				<input
					class="hex-input"
					value={settings.darkBackgroundColor}
					maxlength="7"
					aria-label={i18n.t('dark.backgroundHex')}
					onchange={(event) => onHexChange(event, 'darkBackgroundColor')}
				/>
			</div>
		</div>
	{/if}

	<div class="toggle logo-toggle">
		<label id="dark-logo-label" for="dark-logo-switch">{i18n.t('dark.logo')}</label>
		<button
			class="switch"
			id="dark-logo-switch"
			type="button"
			role="switch"
			aria-checked={settings.darkLogo}
			aria-labelledby="dark-logo-label"
			onclick={toggleDarkLogo}
		></button>
	</div>
	{#if settings.darkLogo}
		{#each source.colors as color (color)}
			<div class="logo-color">
				<div class="logo-color-head">
					<div class="color-chip" style:background={color}></div>
					<span class="arrow" aria-hidden="true">→</span>
					<div class="color-chip" style:background={darkValue(color)}></div>
					<input
						class="hex-input"
						value={darkValue(color)}
						maxlength="7"
						aria-label={i18n.t('dark.logoHex')}
						onchange={(event) => onLogoHexChange(event, color)}
					/>
				</div>
				<Swatches
					colors={logoColors}
					value={darkValue(color)}
					label={color}
					onselect={(value) => setLogoColor(color, value)}
				/>
			</div>
		{:else}
			<p class="helper">{i18n.t('dark.noColors')}</p>
		{/each}
		{#if source.colorsCapped}
			<p class="helper">{i18n.t('dark.colorsCapped')}</p>
		{/if}
		<p class="helper">{i18n.t('dark.logoHelper')}</p>
	{/if}
	<p class="helper">{i18n.t('dark.helper')}</p>
{/if}

<style>
	.group-title {
		font-size: 13px;
		font-weight: 600;
		margin: 0 0 17px;
	}

	hr {
		height: 1px;
		margin: 22px 0;
		border: 0;
		background: var(--line);
	}

	.control {
		margin-bottom: 20px;
	}

	.control-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 11px;
	}

	.control-head label {
		font-size: 12px;
		font-weight: 500;
	}

	.value {
		font-size: 11px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	input[type='range'] {
		width: 100%;
		height: 4px;
		accent-color: var(--blue);
		cursor: pointer;
	}

	.range-ends {
		display: flex;
		justify-content: space-between;
		color: #a3a3a3;
		font-size: 10px;
		margin-top: 5px;
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
	.switch:focus-visible {
		outline: 2px solid var(--blue);
		outline-offset: 2px;
	}

	.option-panel {
		margin-top: 15px;
	}

	.color-input-wrap {
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.color-chip {
		width: 29px;
		height: 29px;
		flex: none;
		border-radius: 8px;
		border: 1px solid #00000018;
	}

	.hex-input {
		width: 105px;
		border: 1px solid var(--line);
		border-radius: 7px;
		padding: 7px 9px;
		font-size: 11px;
		text-transform: uppercase;
		outline: none;
	}

	.hex-input:focus-visible {
		border-color: #a3a3a3;
	}

	.helper {
		color: var(--muted);
		font-size: 10px;
		line-height: 1.55;
		margin: 11px 0 0;
	}

	.warning {
		margin: 11px 0 0;
		padding: 10px 12px;
		border: 1px solid #fde68a;
		border-radius: 10px;
		background: #fffbeb;
		color: #92400e;
		font-size: 11px;
		line-height: 1.55;
	}

	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 14px;
	}

	.logo-toggle {
		margin-top: 20px;
	}

	.toggle label {
		font-size: 12px;
		font-weight: 500;
	}

	.switch {
		width: 34px;
		height: 20px;
		flex: none;
		border: 0;
		border-radius: 20px;
		padding: 2px;
		background: #d4d4d4;
		transition: background 0.15s;
	}

	.switch::after {
		content: '';
		display: block;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #fff;
		transition: transform 0.15s;
	}

	.switch[aria-checked='true'] {
		background: var(--blue);
	}

	.switch[aria-checked='true']::after {
		transform: translateX(14px);
	}

	.switch:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.logo-color-head {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 11px;
	}

	.arrow {
		color: var(--muted);
		font-size: 12px;
	}
</style>

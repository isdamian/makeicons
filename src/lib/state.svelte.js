import { loadExample, loadSource } from '#lib/icons/load.js';
import { tierIds } from '#lib/icons/presets.js';

export const settings = $state({
	margin: 10,
	radius: 22,
	background: 'transparent',
	backgroundColor: '#FFFFFF',
	maskableFit: null,
	darkBackground: false,
	darkBackgroundColor: '#171717',
	darkLogo: false,
	darkColors: {},
	previewType: 'any'
});

export const source = $state({
	image: null,
	markup: null,
	colors: [],
	colorsCapped: false,
	name: null,
	width: 0,
	height: 0,
	vector: false,
	hasAlpha: false,
	warnings: []
});

export const outputs = $state({
	ids: tierIds('basic')
});

function applySource(result, name) {
	Object.assign(source, result, { name });
}

export function selectTier(tier) {
	outputs.ids = tierIds(tier);
}

export function toggleFile(id) {
	outputs.ids = outputs.ids.includes(id)
		? outputs.ids.filter((item) => item !== id)
		: [...outputs.ids, id];
}

// Replaces the current image and keeps the settings and file selection.
export async function loadFile(file) {
	if (!file || !(file.type.startsWith('image/') || /\.svg$/i.test(file.name))) return;

	try {
		applySource(await loadSource(file), file.name);
	} catch (error) {
		// Files that cannot be decoded leave the current image unchanged.
		console.error(error);
	}
}

export function pickFile() {
	const input = document.createElement('input');

	input.type = 'file';
	input.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
	input.onchange = () => loadFile(input.files[0]);
	input.click();
}

export async function showExample() {
	if (source.image) return;

	applySource(await loadExample(), null);
}

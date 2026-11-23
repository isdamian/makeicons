// Output catalog in generation order. `tier` is the smallest preset that includes the file.
export const files = [
	{
		id: 'favicon-ico',
		name: 'favicon.ico',
		format: 'ICO',
		tier: 'basic',
		kind: 'ico',
		sizes: [16, 32, 48],
		link: { rel: 'icon', sizes: '32x32' }
	},
	{
		id: 'favicon-svg',
		name: 'favicon.svg',
		format: 'SVG',
		tier: 'basic',
		kind: 'svg',
		detailKey: 'files.vector',
		requires: 'svg',
		link: { rel: 'icon', type: 'image/svg+xml' }
	},
	{
		id: 'favicon-96',
		name: 'favicon-96x96.png',
		format: 'PNG',
		tier: 'complete',
		kind: 'png',
		type: 'any',
		size: 96,
		link: { rel: 'icon', type: 'image/png', sizes: '96x96' }
	},
	{
		id: 'apple-touch',
		name: 'apple-touch-icon.png',
		format: 'PNG',
		tier: 'basic',
		kind: 'png',
		type: 'apple',
		size: 180,
		link: { rel: 'apple-touch-icon' }
	},
	{
		id: 'icon-192',
		name: 'icon-192.png',
		format: 'PNG',
		tier: 'basic',
		kind: 'png',
		type: 'any',
		size: 192,
		purpose: 'any'
	},
	{
		id: 'icon-384',
		name: 'icon-384.png',
		format: 'PNG',
		tier: 'complete',
		kind: 'png',
		type: 'any',
		size: 384,
		purpose: 'any'
	},
	{
		id: 'icon-512',
		name: 'icon-512.png',
		format: 'PNG',
		tier: 'basic',
		kind: 'png',
		type: 'any',
		size: 512,
		purpose: 'any'
	},
	{
		id: 'icon-1024',
		name: 'icon-1024.png',
		format: 'PNG',
		tier: 'complete',
		kind: 'png',
		type: 'any',
		size: 1024,
		purpose: 'any'
	},
	{
		id: 'maskable-192',
		name: 'icon-maskable-192.png',
		format: 'PNG',
		tier: 'complete',
		kind: 'png',
		type: 'maskable',
		size: 192,
		purpose: 'maskable'
	},
	{
		id: 'maskable-512',
		name: 'icon-maskable-512.png',
		format: 'PNG',
		tier: 'basic',
		kind: 'png',
		type: 'maskable',
		size: 512,
		purpose: 'maskable'
	},
	{
		id: 'monochrome',
		name: 'icon-monochrome.png',
		format: 'PNG',
		tier: 'complete',
		kind: 'png',
		type: 'monochrome',
		size: 512,
		purpose: 'monochrome',
		requires: 'alpha'
	},
	{
		id: 'manifest',
		name: 'site.webmanifest',
		format: 'JSON',
		tier: 'basic',
		kind: 'manifest',
		detailKey: 'files.manifest',
		link: { rel: 'manifest' }
	},
	{
		id: 'head',
		name: 'head.html',
		format: 'HTML',
		tier: 'basic',
		kind: 'head',
		detailKey: 'files.head'
	}
];

export const tiers = ['basic', 'complete'];

export function tierIds(tier) {
	return files
		.filter((file) => tier === 'complete' || file.tier === 'basic')
		.map((file) => file.id);
}

// Returns the i18n key explaining why the file cannot be generated for this image, if any.
export function unavailableReason(file, source) {
	if (file.requires === 'svg' && !source.vector) return 'files.requiresSvg';
	if (file.requires === 'alpha' && !(source.vector || source.hasAlpha))
		return 'files.requiresAlpha';

	return null;
}

export function resolveFiles(ids, source) {
	return files.filter((file) => ids.includes(file.id) && !unavailableReason(file, source));
}

// Returns the preset whose available files match the current selection, or null for a custom one.
export function activeTier(ids, source) {
	const current = resolveFiles(ids, source)
		.map((file) => file.id)
		.join();

	return (
		tiers.find(
			(tier) =>
				resolveFiles(tierIds(tier), source)
					.map((file) => file.id)
					.join() === current
		) ?? null
	);
}

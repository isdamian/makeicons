import { defaultDarkColor, tagColors } from '#lib/icons/colors.js';
import { drawIcon } from '#lib/icons/draw.js';
import { buildIco } from '#lib/icons/ico.js';
import { resolveFiles } from '#lib/icons/presets.js';
import { buildZip } from '#lib/icons/zip.js';

const SVG_SIZE = 512;
const previewSizes = { any: 512, apple: 180, maskable: 512, monochrome: 512, dark: 512 };
const encoder = new TextEncoder();

function renderIcon(image, options, size, type) {
	const canvas = document.createElement('canvas');

	canvas.width = size;
	canvas.height = size;
	drawIcon(canvas, size, image, options, type);

	return canvas;
}

function toBlob(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
			'image/png'
		);
	});
}

async function toPng(image, options, size, type) {
	const blob = await toBlob(renderIcon(image, options, size, type));

	return new Uint8Array(await blob.arrayBuffer());
}

function download(blob, filename) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function decodeMarkup(markup) {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error('Preview could not be rendered'));
		image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	});
}

function lightColor(options) {
	return options.background === 'solid' ? options.backgroundColor : '#FFFFFF';
}

function buildManifest(selected, options) {
	const icons = selected
		.filter((file) => file.purpose)
		.map((file) => ({
			src: file.name,
			sizes: `${file.size}x${file.size}`,
			type: 'image/png',
			purpose: file.purpose
		}));

	return JSON.stringify(
		{
			name: 'Website',
			short_name: 'Website',
			icons,
			theme_color: lightColor(options),
			background_color: lightColor(options),
			display: 'standalone'
		},
		null,
		2
	);
}

function buildHead(selected, options) {
	const lines = selected
		.filter((file) => file.link)
		.map(({ name, link }) => {
			const type = link.type ? ` type="${link.type}"` : '';
			const sizes = link.sizes ? ` sizes="${link.sizes}"` : '';

			return `<link rel="${link.rel}" href="/${name}"${type}${sizes} />`;
		});

	lines.push(`<meta name="theme-color" content="${lightColor(options)}" />`);

	return `${lines.join('\n')}\n`;
}

// Mirrors the canvas "any" composition as vector: rounded shape, background and logo.
// The logo is clipped with its own rounded rectangle only when there is no solid background.
// Dark-mode overrides are emitted as CSS rules inside a prefers-color-scheme media query;
// with forceDark they apply unconditionally, which is used to preview the dark variant.
function buildSvg(source, options, forceDark = false) {
	const pad = (SVG_SIZE * options.margin) / 100;
	const box = SVG_SIZE - pad * 2;
	const radius = (SVG_SIZE * options.radius) / 100;
	const solid = options.background === 'solid';

	const scale = Math.min(box / source.width, box / source.height);
	const logoWidth = source.width * scale;
	const logoHeight = source.height * scale;
	const logoX = pad + (box - logoWidth) / 2;
	const logoY = pad + (box - logoHeight) / 2;
	const logoRadius = (Math.min(logoWidth, logoHeight) * options.radius) / 100;

	const logo = new DOMParser().parseFromString(source.markup, 'image/svg+xml').documentElement;
	const tags = options.darkLogo ? tagColors(logo, source.colors) : [];

	logo.setAttribute('x', String(logoX));
	logo.setAttribute('y', String(logoY));
	logo.setAttribute('width', String(logoWidth));
	logo.setAttribute('height', String(logoHeight));
	logo.setAttribute('preserveAspectRatio', 'xMidYMid meet');

	const darkRules = [];

	if (options.darkBackground && solid) {
		darkRules.push(`.bg { fill: ${options.darkBackgroundColor}; }`);
	}

	for (const { name, property, index } of tags) {
		const original = source.colors[index];
		const color = options.darkColors[original] ?? defaultDarkColor(original);

		darkRules.push(`.${name} { ${property}: ${color} !important; }`);
	}

	const dimensions = forceDark ? ` width="${SVG_SIZE}" height="${SVG_SIZE}"` : '';
	const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"${dimensions}>`];

	if (darkRules.length) {
		const rules = darkRules.join(' ');

		parts.push(
			`<style>${forceDark ? rules : `@media (prefers-color-scheme: dark) { ${rules} }`}</style>`
		);
	}

	const clips = [
		`<clipPath id="makeicons-shape"><rect width="${SVG_SIZE}" height="${SVG_SIZE}" rx="${radius}" /></clipPath>`
	];

	if (!solid) {
		clips.push(
			`<clipPath id="makeicons-logo"><rect x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" rx="${logoRadius}" /></clipPath>`
		);
	}

	parts.push(`<defs>${clips.join('')}</defs>`);
	parts.push('<g clip-path="url(#makeicons-shape)">');

	if (solid) {
		parts.push(
			`<rect class="bg" width="${SVG_SIZE}" height="${SVG_SIZE}" fill="${options.backgroundColor}" />`
		);
	}

	const logoMarkup = new XMLSerializer().serializeToString(logo);

	parts.push(solid ? logoMarkup : `<g clip-path="url(#makeicons-logo)">${logoMarkup}</g>`);
	parts.push('</g>');
	parts.push('</svg>');

	return `${parts.join('\n')}\n`;
}

// The markup is built synchronously so reactive callers track the settings it reads.
export function renderDarkPreview(source, options) {
	return decodeMarkup(buildSvg(source, options, true));
}

async function toDarkPng(source, options) {
	const canvas = document.createElement('canvas');
	const image = await renderDarkPreview(source, options);

	canvas.width = SVG_SIZE;
	canvas.height = SVG_SIZE;
	canvas.getContext('2d').drawImage(image, 0, 0, SVG_SIZE, SVG_SIZE);

	return new Uint8Array(await (await toBlob(canvas)).arrayBuffer());
}

async function buildFile(file, source, options, selected) {
	switch (file.kind) {
		case 'png':
			return toPng(source.image, options, file.size, file.type);
		case 'ico': {
			const images = [];

			for (const size of file.sizes) {
				images.push({ size, data: await toPng(source.image, options, size, 'any') });
			}

			return buildIco(images);
		}
		case 'svg':
			return encoder.encode(buildSvg(source, options));
		case 'manifest':
			return encoder.encode(buildManifest(selected, options));
		default:
			return encoder.encode(buildHead(selected, options));
	}
}

export async function downloadSet(source, options, ids) {
	const selected = resolveFiles(ids, source);
	const entries = [];

	for (const file of selected) {
		entries.push({ name: file.name, data: await buildFile(file, source, options, selected) });
	}

	download(buildZip(entries), 'makeicons.zip');
}

export function copyHead(source, options, ids) {
	return navigator.clipboard.writeText(buildHead(resolveFiles(ids, source), options));
}

export async function downloadPreview(source, options) {
	const type = options.previewType;
	const size = previewSizes[type];
	const png =
		type === 'dark'
			? await toDarkPng(source, options)
			: await toPng(source.image, options, size, type);

	download(new Blob([png], { type: 'image/png' }), `makeicons-${type}-${size}.png`);
}

import { listColors } from '#lib/icons/colors.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_RENDER_SIZE = 1024;
const MAX_ANALYZED_PIXELS = 25_000_000;
const MIN_SHARP_SIZE = 512;
const ALPHA_TRIM_THRESHOLD = 8;
const ALPHA_OPAQUE_THRESHOLD = 250;

function decode(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error('Image could not be decoded'));
		image.src = url;
	});
}

async function decodeBlob(blob) {
	const url = URL.createObjectURL(blob);

	try {
		return await decode(url);
	} finally {
		URL.revokeObjectURL(url);
	}
}

function isSvg(file) {
	return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
}

// The SVG is attached to the document for measuring and re-exported in favicon.svg,
// so scripts and inline event handlers are removed.
function sanitize(root) {
	root.querySelectorAll('script').forEach((node) => node.remove());

	for (const element of [root, ...root.querySelectorAll('*')]) {
		for (const attribute of [...element.attributes]) {
			if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
		}
	}
}

function parseSvg(text) {
	const parser = new DOMParser();
	let doc = parser.parseFromString(text, 'image/svg+xml');
	let root = doc.documentElement;

	// Exported SVGs often omit the namespace, which prevents browsers from rendering them as images.
	if (root.localName === 'svg' && !root.namespaceURI) {
		const patched = text.replace(/<svg\b/i, `<svg xmlns="${SVG_NS}"`);
		doc = parser.parseFromString(patched, 'image/svg+xml');
		root = doc.documentElement;
	}

	if (
		doc.querySelector('parsererror') ||
		root.localName !== 'svg' ||
		root.namespaceURI !== SVG_NS
	) {
		throw new Error('Invalid SVG');
	}

	sanitize(root);

	return root;
}

function numericAttribute(root, name) {
	const value = root.getAttribute(name);

	return value && !value.includes('%') ? parseFloat(value) : NaN;
}

// getBBox() needs the element to be attached to the document.
function measureContent(root) {
	const host = document.createElement('div');
	const node = document.importNode(root, true);

	host.style.cssText =
		'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;visibility:hidden';
	host.append(node);
	document.body.append(host);

	try {
		const box = node.getBBox();

		return box.width > 0 && box.height > 0 ? [box.x, box.y, box.width, box.height] : null;
	} finally {
		host.remove();
	}
}

// Prefers the author's viewBox, then width and height, then the measured content.
function measureViewBox(root) {
	const viewBox = root
		.getAttribute('viewBox')
		?.trim()
		.split(/[\s,]+/)
		.map(Number);

	if (viewBox?.length === 4 && viewBox.every(Number.isFinite) && viewBox[2] > 0 && viewBox[3] > 0) {
		return viewBox;
	}

	const width = numericAttribute(root, 'width');
	const height = numericAttribute(root, 'height');

	if (width > 0 && height > 0) return [0, 0, width, height];

	return measureContent(root);
}

async function loadSvg(text) {
	const root = parseSvg(text);
	const box = measureViewBox(root);

	if (!box) throw new Error('SVG has no measurable content');

	const { colors, capped } = listColors(root);

	// An explicit intrinsic size keeps drawImage consistent across browsers.
	const scale = SVG_RENDER_SIZE / Math.max(box[2], box[3]);

	root.setAttribute('viewBox', box.join(' '));
	root.setAttribute('width', String(box[2] * scale));
	root.setAttribute('height', String(box[3] * scale));

	const markup = new XMLSerializer().serializeToString(root);
	const image = await decodeBlob(new Blob([markup], { type: 'image/svg+xml' }));

	return {
		image,
		markup,
		colors,
		colorsCapped: capped,
		width: box[2],
		height: box[3],
		vector: true,
		hasAlpha: true,
		warnings: []
	};
}

// Finds the bounds of visible pixels and whether any pixel is translucent.
function scanAlpha({ data, width, height }) {
	let left = width;
	let top = height;
	let right = 0;
	let bottom = 0;
	let hasAlpha = false;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const alpha = data[(y * width + x) * 4 + 3];

			if (alpha < ALPHA_OPAQUE_THRESHOLD) hasAlpha = true;

			if (alpha > ALPHA_TRIM_THRESHOLD) {
				if (x < left) left = x;
				if (x >= right) right = x + 1;
				if (y < top) top = y;
				bottom = y + 1;
			}
		}
	}

	return { hasAlpha, left, top, right, bottom };
}

async function loadPixels(file) {
	const decoded = await decodeBlob(file);
	const warnings = ['pixel'];

	let image = decoded;
	let width = decoded.naturalWidth;
	let height = decoded.naturalHeight;
	let hasAlpha = false;

	if (width * height < MAX_ANALYZED_PIXELS) {
		const canvas = document.createElement('canvas');

		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d', { willReadFrequently: true });

		context.drawImage(decoded, 0, 0);

		const scan = scanAlpha(context.getImageData(0, 0, width, height));
		const cropWidth = scan.right - scan.left;
		const cropHeight = scan.bottom - scan.top;

		hasAlpha = scan.hasAlpha;

		if (cropWidth > 0 && cropHeight > 0 && (cropWidth !== width || cropHeight !== height)) {
			const cropped = document.createElement('canvas');

			cropped.width = cropWidth;
			cropped.height = cropHeight;
			cropped
				.getContext('2d')
				.drawImage(canvas, scan.left, scan.top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

			image = cropped;
			width = cropWidth;
			height = cropHeight;
		}
	}

	if (Math.min(width, height) < MIN_SHARP_SIZE) warnings.push('small');
	if (!hasAlpha) warnings.push('opaque');

	return {
		image,
		markup: null,
		colors: [],
		colorsCapped: false,
		width,
		height,
		vector: false,
		hasAlpha,
		warnings
	};
}

export function loadSource(file) {
	return isSvg(file) ? file.text().then(loadSvg) : loadPixels(file);
}

export async function loadExample() {
	const response = await fetch('/favicon.svg');

	return loadSvg(await response.text());
}

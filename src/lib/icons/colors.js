const MAX_COLORS = 8;
const PAINT_PROPERTIES = ['fill', 'stroke'];
const DRAWABLE_ELEMENTS = new Set([
	'path',
	'rect',
	'circle',
	'ellipse',
	'polygon',
	'polyline',
	'text'
]);
const GRAY_TOLERANCE = 24;
const SENTINEL = '#010203';

let context;

// Canvas parsing resolves named, rgb() and shorthand colors.
// Unsupported values leave the sentinel in place.
function normalizeColor(value) {
	context ??= document.createElement('canvas').getContext('2d');
	context.fillStyle = SENTINEL;
	context.fillStyle = value;

	const result = context.fillStyle;

	return /^#[0-9a-f]{6}$/.test(result) && result !== SENTINEL ? result.toUpperCase() : null;
}

function readStyleProperty(element, property) {
	const style = element.getAttribute('style');

	if (!style) return null;

	for (const declaration of style.split(';')) {
		const index = declaration.indexOf(':');

		if (index > 0 && declaration.slice(0, index).trim() === property) {
			return declaration.slice(index + 1).trim();
		}
	}

	return null;
}

// Inline style takes precedence over the presentation attribute.
function readPaint(element, property) {
	return readStyleProperty(element, property) ?? element.getAttribute(property);
}

function inheritsPaint(element, property) {
	for (let node = element; node; node = node.parentElement) {
		if (readPaint(node, property) !== null) return true;
	}

	return false;
}

// Lists every explicit fill and stroke color. Shapes without any fill in their ancestry
// render black, which is reported as a fill on the root element.
function findColors(root) {
	const occurrences = [];
	let implicitFill = false;

	for (const element of [root, ...root.querySelectorAll('*')]) {
		if (element.closest('clipPath, mask')) continue;

		for (const property of PAINT_PROPERTIES) {
			const value = readPaint(element, property);
			const color = value ? normalizeColor(value) : null;

			if (color) occurrences.push({ element, property, color });
		}

		if (DRAWABLE_ELEMENTS.has(element.localName) && !inheritsPaint(element, 'fill')) {
			implicitFill = true;
		}
	}

	if (implicitFill) occurrences.push({ element: root, property: 'fill', color: '#000000' });

	return occurrences;
}

export function listColors(root) {
	const colors = [...new Set(findColors(root).map(({ color }) => color))];

	return { colors: colors.slice(0, MAX_COLORS), capped: colors.length > MAX_COLORS };
}

// Adds a class to every element painted with one of the listed colors, so that
// dark-mode rules can override the original paint.
export function tagColors(root, colors) {
	const tags = new Map();

	for (const { element, property, color } of findColors(root)) {
		const index = colors.indexOf(color);

		if (index === -1) continue;

		const name = `makeicons-${property}-${index}`;

		element.classList.add(name);
		tags.set(name, { name, property, index });
	}

	return [...tags.values()];
}

// Inverts black, white and gray; saturated colors are kept.
export function defaultDarkColor(hex) {
	const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

	if (Math.max(r, g, b) - Math.min(r, g, b) > GRAY_TOLERANCE) return hex;

	const inverted = [r, g, b].map((value) => (255 - value).toString(16).padStart(2, '0'));

	return `#${inverted.join('').toUpperCase()}`;
}

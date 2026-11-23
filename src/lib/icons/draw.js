// Diameter of the maskable safe zone relative to the icon side.
const MASKABLE_SAFE_DIAMETER = 0.8;

// Minimum alpha of a pixel considered part of the solid area of a logo.
const OPAQUE_ALPHA = 250;

function roundedRect(context, x, y, width, height, radius) {
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));

	context.beginPath();
	context.moveTo(x + r, y);
	context.arcTo(x + width, y, x + width, y + height, r);
	context.arcTo(x + width, y + height, x, y + height, r);
	context.arcTo(x, y + height, x, y, r);
	context.arcTo(x, y, x + width, y, r);
	context.closePath();
}

// Fits the image inside the box keeping its aspect ratio, centered.
function fitContain(image, x, y, width, height) {
	const scale = Math.min(width / image.width, height / image.height);
	const w = image.width * scale;
	const h = image.height * scale;

	return { x: x + (width - w) / 2, y: y + (height - h) / 2, width: w, height: h };
}

// The radius is a percentage of the shorter side of the box.
function clipToRoundedBox(context, { x, y, width, height }, radius) {
	roundedRect(context, x, y, width, height, Math.min(width, height) * (radius / 100));
	context.clip();
}

function drawImageContain(context, image, x, y, width, height) {
	const fit = fitContain(image, x, y, width, height);

	context.drawImage(image, fit.x, fit.y, fit.width, fit.height);
}

// Paints the transparent ends of a line of pixels with its outermost opaque colors.
function extendLine(data, start, step, length) {
	const offset = (index) => start + index * step;
	const opaque = (index) => data[offset(index) + 3] >= OPAQUE_ALPHA;

	let first = 0;

	while (first < length && !opaque(first)) first++;

	if (first === length) return;

	let last = length - 1;

	while (!opaque(last)) last--;

	for (let index = 0; index < length; index++) {
		if (index >= first && index <= last) continue;

		const from = offset(index < first ? first : last);

		data.copyWithin(offset(index), from, from + 3);
		data[offset(index) + 3] = 255;
	}
}

// Fills the empty corners of a logo that reaches all four sides, such as a rounded square.
// Modifies the pixel data in place and reports whether it applied.
export function squareCorners({ data, width, height }) {
	const x = Math.floor(width / 2);
	const y = Math.floor(height / 2);
	const sides = [
		[x, 1],
		[x, height - 2],
		[1, y],
		[width - 2, y]
	];

	const reachesSides = sides.every(
		([column, row]) => data[(row * width + column) * 4 + 3] >= OPAQUE_ALPHA
	);

	if (!reachesSides) return false;

	for (let row = 0; row < height; row++) extendLine(data, row * width * 4, 4, width);
	for (let column = 0; column < width; column++) {
		extendLine(data, column * 4, width * 4, height);
	}

	return true;
}

// Fills the whole square keeping the aspect ratio, cropping any overflow.
function drawImageCover(context, image, size) {
	const layer = document.createElement('canvas');

	layer.width = size;
	layer.height = size;

	const layerContext = layer.getContext('2d', { willReadFrequently: true });
	const scale = Math.max(size / image.width, size / image.height);
	const w = image.width * scale;
	const h = image.height * scale;

	layerContext.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);

	const pixels = layerContext.getImageData(0, 0, size, size);

	if (squareCorners(pixels)) layerContext.putImageData(pixels, 0, 0);

	context.drawImage(layer, 0, 0);
}

// Scales the rounded logo to fit inside the safe circle, shrunk by the margin percentage.
function drawImageInSafeCircle(context, image, size, { margin, radius }) {
	const diameter = size * MASKABLE_SAFE_DIAMETER * (1 - margin / 100);
	const scale = diameter / Math.hypot(image.width, image.height);
	const width = image.width * scale;
	const height = image.height * scale;
	const box = { x: (size - width) / 2, y: (size - height) / 2, width, height };

	context.save();
	clipToRoundedBox(context, box, radius);
	context.drawImage(image, box.x, box.y, width, height);
	context.restore();
}

// Types: any, apple, maskable, monochrome. Margin and corner radius are percentages.
export function drawIcon(canvas, size, image, options, type = 'any') {
	const context = canvas.getContext('2d');
	const solid = options.background === 'solid' ? options.backgroundColor : null;
	const pad = size * (options.margin / 100);
	const box = size - pad * 2;

	context.clearRect(0, 0, size, size);

	// Apple and maskable icons are full-bleed squares: the OS applies its own mask.
	if (type === 'apple' || type === 'maskable') {
		context.fillStyle = solid ?? '#FFFFFF';
		context.fillRect(0, 0, size, size);

		if (!image) return;

		if (type === 'apple') drawImageContain(context, image, pad, pad, box, box);
		else if (options.maskableFit === 'cover') drawImageCover(context, image, size);
		else drawImageInSafeCircle(context, image, size, options);

		return;
	}

	if (type === 'monochrome') {
		if (!image) return;

		const layer = document.createElement('canvas');
		const layerContext = layer.getContext('2d');

		layer.width = size;
		layer.height = size;
		drawImageContain(layerContext, image, pad, pad, box, box);
		layerContext.globalCompositeOperation = 'source-in';
		layerContext.fillStyle = '#000000';
		layerContext.fillRect(0, 0, size, size);
		context.drawImage(layer, 0, 0);

		return;
	}

	context.save();
	roundedRect(context, 0, 0, size, size, size * (options.radius / 100));
	context.clip();

	if (solid) {
		context.fillStyle = solid;
		context.fillRect(0, 0, size, size);
	}

	if (image) {
		const fit = fitContain(image, pad, pad, box, box);

		// With a solid background the radius shapes the background; without one it shapes the logo.
		if (!solid) clipToRoundedBox(context, fit, options.radius);

		context.drawImage(image, fit.x, fit.y, fit.width, fit.height);
	}

	context.restore();
}

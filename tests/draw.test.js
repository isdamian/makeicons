import assert from 'node:assert/strict';
import { test } from 'node:test';
import { drawIcon, squareCorners } from '#lib/icons/draw.js';

const SIZE = 512;
const image = { width: 100, height: 100 };

// Records the image placement and clipping of a maskable icon with a solid background.
function drawMaskable(maskableFit, margin, radius = 0) {
	const result = { placement: null, cornerRadius: null, clips: 0 };
	const context = {
		clearRect() {},
		fillRect() {},
		save() {},
		restore() {},
		beginPath() {},
		moveTo() {},
		closePath() {},
		arcTo: (...args) => (result.cornerRadius = args[4]),
		clip: () => result.clips++,
		drawImage: (_, ...placement) => (result.placement = placement)
	};
	const options = {
		background: 'solid',
		backgroundColor: '#000000',
		margin,
		radius,
		maskableFit
	};

	drawIcon({ getContext: () => context }, SIZE, image, options, 'maskable');

	return result;
}

// Builds a square image that is opaque everywhere except its four corner pixels.
function roundedPixels(size) {
	const data = new Uint8ClampedArray(size * size * 4);

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const corner = (x === 0 || x === size - 1) && (y === 0 || y === size - 1);

			if (!corner) data.set([0, 0, 255, 255], (y * size + x) * 4);
		}
	}

	return { data, width: size, height: size };
}

test('fills the whole canvas with the cover fit, ignoring the radius', () => {
	let placement;

	const layerContext = {
		drawImage: (_, ...args) => (placement = args),
		getImageData: () => ({
			data: new Uint8ClampedArray(SIZE * SIZE * 4),
			width: SIZE,
			height: SIZE
		})
	};

	globalThis.document = { createElement: () => ({ getContext: () => layerContext }) };

	const { clips } = drawMaskable('cover', 10, 20);

	delete globalThis.document;

	assert.deepEqual(placement, [0, 0, SIZE, SIZE]);
	assert.equal(clips, 0);
});

test('fills the corners with the adjacent edge color', () => {
	const pixels = roundedPixels(5);

	pixels.data.set([255, 0, 0, 255], 4);

	assert.equal(squareCorners(pixels), true);
	assert.deepEqual([...pixels.data.slice(0, 4)], [255, 0, 0, 255]);
});

test('leaves a logo that does not reach the sides unchanged', () => {
	const pixels = { data: new Uint8ClampedArray(100), width: 5, height: 5 };

	assert.equal(squareCorners(pixels), false);
	assert.ok(pixels.data.every((value) => value === 0));
});

test('keeps the logo corners on the safe circle without margin', () => {
	const [, , width, height] = drawMaskable('margin', 0).placement;

	assert.ok(Math.abs(Math.hypot(width, height) - SIZE * 0.8) < 0.001);
});

test('shrinks the logo by the margin percentage', () => {
	const [, , width, height] = drawMaskable(null, 10).placement;

	assert.ok(Math.abs(Math.hypot(width, height) - SIZE * 0.8 * 0.9) < 0.001);
});

test('applies the corner radius to the logo with the margin fit', () => {
	const { placement, cornerRadius, clips } = drawMaskable('margin', 10, 20);

	assert.equal(clips, 1);
	assert.ok(Math.abs(cornerRadius - placement[2] * 0.2) < 0.001);
});

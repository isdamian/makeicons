import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeTier, files, resolveFiles, tierIds } from '#lib/icons/presets.js';

const opaquePixels = { vector: false, hasAlpha: false };

test('uses unique file ids and names', () => {
	assert.equal(new Set(files.map((file) => file.id)).size, files.length);
	assert.equal(new Set(files.map((file) => file.name)).size, files.length);
});

test('includes the basic set in the complete set', () => {
	const complete = tierIds('complete');

	assert.ok(tierIds('basic').every((id) => complete.includes(id)));
});

test('omits files the image cannot produce', () => {
	const ids = resolveFiles(tierIds('complete'), opaquePixels).map((file) => file.id);

	assert.ok(!ids.includes('favicon-svg'));
	assert.ok(!ids.includes('monochrome'));
});

test('detects preset and custom selections', () => {
	assert.equal(activeTier(tierIds('basic'), opaquePixels), 'basic');
	assert.equal(activeTier(['head'], opaquePixels), null);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildIco } from '#lib/icons/ico.js';

test('writes the header, directory entries and image data', () => {
	const bytes = buildIco([
		{ size: 16, data: new Uint8Array([1, 2, 3]) },
		{ size: 256, data: new Uint8Array([4, 5]) }
	]);
	const view = new DataView(bytes.buffer);

	assert.equal(view.getUint16(2, true), 1);
	assert.equal(view.getUint16(4, true), 2);
	assert.equal(view.getUint8(6), 16);
	assert.equal(view.getUint8(22), 0);
	assert.equal(view.getUint32(18, true), 38);
	assert.equal(view.getUint32(34, true), 41);
	assert.deepEqual([...bytes.slice(38)], [1, 2, 3, 4, 5]);
});

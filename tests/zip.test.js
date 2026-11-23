import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildZip } from '#lib/icons/zip.js';

test('stores entries with their checksum, size and directory offset', async () => {
	const data = new TextEncoder().encode('123456789');
	const blob = buildZip([{ name: 'a.txt', data }]);
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const view = new DataView(bytes.buffer);
	const end = bytes.length - 22;

	assert.equal(view.getUint32(0, true), 0x04034b50);
	assert.equal(view.getUint32(14, true), 0xcbf43926);
	assert.equal(view.getUint32(18, true), data.length);
	assert.equal(new TextDecoder().decode(bytes.slice(30, 35)), 'a.txt');
	assert.equal(view.getUint32(end, true), 0x06054b50);
	assert.equal(view.getUint16(end + 10, true), 1);
	assert.equal(view.getUint32(end + 16, true), 44);
});

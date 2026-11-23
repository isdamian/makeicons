const HEADER_SIZE = 6;
const ENTRY_SIZE = 16;

// Packs PNG images into an ICO container. A size of 256 or more is stored as 0.
export function buildIco(images) {
	const dataOffset = HEADER_SIZE + images.length * ENTRY_SIZE;
	const total = images.reduce((sum, image) => sum + image.data.length, dataOffset);
	const bytes = new Uint8Array(total);
	const view = new DataView(bytes.buffer);

	view.setUint16(2, 1, true);
	view.setUint16(4, images.length, true);

	let offset = dataOffset;

	images.forEach(({ size, data }, index) => {
		const entry = HEADER_SIZE + index * ENTRY_SIZE;
		const dimension = size >= 256 ? 0 : size;

		view.setUint8(entry, dimension);
		view.setUint8(entry + 1, dimension);
		view.setUint16(entry + 4, 1, true);
		view.setUint16(entry + 6, 32, true);
		view.setUint32(entry + 8, data.length, true);
		view.setUint32(entry + 12, offset, true);
		bytes.set(data, offset);
		offset += data.length;
	});

	return bytes;
}

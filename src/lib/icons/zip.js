const encoder = new TextEncoder();

const crcTable = new Uint32Array(256).map((_, index) => {
	let value = index;

	for (let bit = 0; bit < 8; bit++) {
		value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
	}

	return value >>> 0;
});

function crc32(data) {
	let crc = 0xffffffff;

	for (let index = 0; index < data.length; index++) {
		crc = crcTable[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
	}

	return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date) {
	return {
		time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
		day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
	};
}

// Builds an uncompressed (stored) ZIP archive from { name, data } entries.
export function buildZip(entries) {
	const { time, day } = dosTimestamp(new Date());
	const parts = [];
	const directory = [];
	let offset = 0;

	for (const { name, data } of entries) {
		const nameBytes = encoder.encode(name);
		const crc = crc32(data);

		const local = new Uint8Array(30 + nameBytes.length);
		const localView = new DataView(local.buffer);

		localView.setUint32(0, 0x04034b50, true);
		localView.setUint16(4, 20, true);
		localView.setUint16(6, 0x0800, true);
		localView.setUint16(10, time, true);
		localView.setUint16(12, day, true);
		localView.setUint32(14, crc, true);
		localView.setUint32(18, data.length, true);
		localView.setUint32(22, data.length, true);
		localView.setUint16(26, nameBytes.length, true);
		local.set(nameBytes, 30);

		const entry = new Uint8Array(46 + nameBytes.length);
		const entryView = new DataView(entry.buffer);

		entryView.setUint32(0, 0x02014b50, true);
		entryView.setUint16(4, 20, true);
		entryView.setUint16(6, 20, true);
		entryView.setUint16(8, 0x0800, true);
		entryView.setUint16(12, time, true);
		entryView.setUint16(14, day, true);
		entryView.setUint32(16, crc, true);
		entryView.setUint32(20, data.length, true);
		entryView.setUint32(24, data.length, true);
		entryView.setUint16(28, nameBytes.length, true);
		entryView.setUint32(42, offset, true);
		entry.set(nameBytes, 46);

		parts.push(local, data);
		directory.push(entry);
		offset += local.length + data.length;
	}

	const directorySize = directory.reduce((sum, entry) => sum + entry.length, 0);
	const end = new Uint8Array(22);
	const endView = new DataView(end.buffer);

	endView.setUint32(0, 0x06054b50, true);
	endView.setUint16(8, entries.length, true);
	endView.setUint16(10, entries.length, true);
	endView.setUint32(12, directorySize, true);
	endView.setUint32(16, offset, true);

	return new Blob([...parts, ...directory, end], { type: 'application/zip' });
}

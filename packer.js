const zlib = require('zlib');
const crypto = require('crypto');
const magic = 184;  // CRC-8-ROHC from Scoperta/1
const id = crypto.randomBytes(2);

function serialize(name) {
    const nameBuf = Buffer.from(name, 'utf8');

    if (nameBuf.length > 1000) {
        throw new Error('SerializeError: Name too long (max 1000 bytes)');
    }

    const nameLengthBuf = Buffer.alloc(2);
    nameLengthBuf.writeUInt16BE(nameBuf.length);

    const packetBody = Buffer.concat([
        Buffer.from([magic]),
        id,
        nameLengthBuf,
        nameBuf
    ]);

    const crc = zlib.crc32(packetBody);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc);

    return Buffer.concat([packetBody, crcBuf]);
}

function deserialize(packet) {
    if (!Buffer.isBuffer(packet)) {
        throw new Error('DeserializeError: packet is not a buffer');
    }

    if (packet.length < 9) {
        throw new Error('DeserializeError: packet is shorter than 9 bytes');
    }

    const packet_magic = packet.readUInt8(0);

    if (magic !== packet_magic) {
        throw new Error(`DeserializeError: invalid magic (got 0x${magic.toString(16)}, expected 0x${packet_magic.toString(16)})`);
    }

    const id = packet.readUInt16BE(1);
    const nameLength = packet.readUInt16BE(3);

    if (packet.length < 5 + nameLength + 4) {
        throw new Error(`DeserializeError: packet too short for name length ${nameLength}`);
    }

    if (nameLength > 1000) {
        throw new Error('DeserializeError: Name length exceeds maximum (1000 bytes)');
    }

    const name = packet.subarray(5, 5 + nameLength).toString('utf8');
    const receivedCrc = packet.readUInt32BE(5 + nameLength);

    const body = packet.subarray(0, 5 + nameLength);
    const expectedCrc = zlib.crc32(body);

    if (receivedCrc !== expectedCrc) {
        throw new Error(`DeserializeError: CRC mismatch (got ${receivedCrc}, expected ${expectedCrc})`);
    }

    return {
        magic: packet_magic,
        id: id,
        nameLength: nameLength,
        name: name,
        crc: receivedCrc
    };
}

const ser_packet = serialize("Device");
console.log(ser_packet.toString('hex').toUpperCase());

const deser_packet = deserialize(ser_packet);
console.log(deser_packet);
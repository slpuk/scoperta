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
    const magic = packet.readUInt8(0);
    const id = packet.readUInt16BE(1);
    const nameLength = packet.readUInt16BE(3);
    const name = packet.subarray(5, 5 + nameLength).toString('utf8');
    const receivedCrc = packet.readUInt32BE(5 + nameLength);

    return {
        magic: magic,
        id: id,
        nameLength: nameLength,
        name: name,
        crc: receivedCrc
    };
}

const ser_packet = serialize("Device");
console.log(ser_packet.toString('hex').toUpperCase());

const des_packet = deserialize(ser_packet);
console.log(des_packet);
const zlib = require('zlib');
const crypto = require('crypto');
const magic = 182;  // CRC-8-ROHC of Scoperta/1
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

const ser_packet = serialize("Device");
console.log(packet.toString('hex').toUpperCase());
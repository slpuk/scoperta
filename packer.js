const zlib = require('zlib');

class Packer {
    constructor(version, id) {
        this.version = version;
        this.id = id;
        this.magic = this._crc8(version);
    }

    _crc8(input) {
        const data = Buffer.isBuffer(input) ? input : Buffer.from(input, 'ascii');
        let crc = 0xFF;

        for (let i = 0; i < data.length; i++) {
            crc ^= data[i];

            for (let j = 0; j < 8; j++) {
                if (crc & 0x01) {
                    crc = (crc >>> 1) ^ 0xE0;
                } else {
                    crc >>>= 1;
                }
            }
        }

        return crc;
    }

    pack(name, payload = null) {
        const nameBuf = Buffer.from(name, 'utf8');
        if (nameBuf.length > 255) {
            throw new Error('PackError: Name too long (max 255 bytes)');
        }

        let payloadBuf = Buffer.alloc(0);
        if (payload !== null && payload !== undefined) {
            if (Buffer.isBuffer(payload)) {
                payloadBuf = payload;
            } else if (typeof payload === 'string') {
                payloadBuf = Buffer.from(payload, 'utf8');
            } else if (typeof payload === 'object') {
                payloadBuf = Buffer.from(JSON.stringify(payload), 'utf8');
            } else {
                payloadBuf = Buffer.from(String(payload), 'utf8');
            }

            if (payloadBuf.length > 255) {
                throw new Error('PackError: Payload too long (max 255 bytes)');
            }
        }

        const packetBody = Buffer.concat([
            Buffer.from([this.magic]),
            this.id,
            Buffer.from([nameBuf.length]),
            nameBuf,
            Buffer.from([payloadBuf.length]),
            payloadBuf
        ]);

        const crc = zlib.crc32(packetBody);
        const crcBuf = Buffer.alloc(4);
        crcBuf.writeUInt32BE(crc);

        return Buffer.concat([packetBody, crcBuf]);
    }

    unpack(packet) {
        if (!Buffer.isBuffer(packet)) {
            throw new Error('UnpackError: packet is not a buffer');
        }

        if (packet.length < 9) {
            throw new Error('UnpackError: packet is shorter than 9 bytes');
        }

        let offset = 0;

        const magic = packet.readUInt8(offset);
        offset += 1;

        if (magic !== this.magic) {
            throw new Error(`UnpackError: invalid magic (got 0x${magic.toString(16)}, expected 0x${this.magic.toString(16)})`);
        }

        const id = packet.readUInt16BE(offset);
        offset += 2;

        const nameLength = packet.readUInt8(offset);
        offset += 1;

        if (nameLength > 255) {
            throw new Error('UnpackError: Name length exceeds maximum (255 bytes)');
        }

        if (packet.length < offset + nameLength + 1 + 4) {
            throw new Error(`UnpackError: packet too short for name length ${nameLength}`);
        }

        const name = packet.subarray(offset, offset + nameLength).toString('utf8');
        offset += nameLength;

        const payloadLength = packet.readUInt8(offset);
        offset += 1;

        if (payloadLength > 255) {
            throw new Error('UnpackError: Payload length exceeds maximum (255 bytes)');
        }

        if (packet.length < offset + payloadLength + 4) {
            throw new Error(`UnpackError: packet too short for payload length ${payloadLength}`);
        }

        const payload = packet.subarray(offset, offset + payloadLength);
        offset += payloadLength;

        const receivedCrc = packet.readUInt32BE(offset);

        const body = packet.subarray(0, offset);
        const expectedCrc = zlib.crc32(body);

        if (receivedCrc !== expectedCrc) {
            throw new Error(`UnpackError: CRC mismatch (got ${receivedCrc}, expected ${expectedCrc})`);
        }

        return {
            magic: magic,
            id: id,
            nameLength: nameLength,
            name: name,
            payloadLength: payloadLength,
            payload: payload,
            crc: receivedCrc
        };
    }

    isValid(packet) {
        if (!Buffer.isBuffer(packet) || packet.length < 9) {
            return false;
        }

        let offset = 0;

        const magic = packet.readUInt8(offset);
        if (magic !== this.magic) {
            return false;
        }
        offset += 1;

        offset += 2;

        const nameLength = packet.readUInt8(offset);
        offset += 1;

        if (nameLength > 255 || packet.length < offset + nameLength + 1 + 4) {
            return false;
        }
        offset += nameLength;

        const payloadLength = packet.readUInt8(offset);
        offset += 1;

        if (payloadLength > 255 || packet.length < offset + payloadLength + 4) {
            return false;
        }
        offset += payloadLength;

        const body = packet.subarray(0, offset);
        const expectedCrc = zlib.crc32(body);
        const receivedCrc = packet.readUInt32BE(offset);

        return receivedCrc === expectedCrc;
    }
}

module.exports = Packer;
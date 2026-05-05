const crypto = require('crypto');
const Packer = require('./packer');

const device_id = crypto.randomBytes(2);
packer = new Packer("Scoperta/1", device_id);

const ser_packet = packer.pack("Device");
console.log("Serialized Packet:", ser_packet.toString('hex').toUpperCase());

const deser_packet = packer.unpack(ser_packet);
console.log("Deserialized Packet:", deser_packet);
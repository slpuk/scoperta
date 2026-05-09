const dgram = require('node:dgram');

class Postman {
    constructor(id, packet) {
        this.packet = packet;
        this.socket = dgram.createSocket('udp4');
        this.multicastAddr = '224.0.112.80';
        this.multicastPort = 57620;
        this.id = id.readUInt16BE(0);
    }

    listen() {
        this.socket.on('error', (err) => {
            console.error(`Socket error: ${err.message}`);
        });

        this.socket.on('message', (msg, rinfo) => {
            if (msg.length < 3) {
                return;
            }

            const senderId = msg.readUInt16BE(1);
            if (senderId != this.id) {
                console.log(`Received a packet from ${rinfo.address}:${rinfo.port}`);
                this.onMessage?.(msg, rinfo);
            }
        });

        this.socket.bind(this.multicastPort, () => {
            this.socket.addMembership(this.multicastAddr, '0.0.0.0');
            console.log(`Scoperta working on ${this.multicastAddr}:${this.multicastPort}\n`);
        });
    }

    send() {
        this.socket.send(this.packet, this.multicastPort, this.multicastAddr);
    }

    onReceive(callback) {
        this.onMessage = callback;
    }

    close() {
        try {
            this.socket.dropMembership(this.multicastAddr);
        } catch (err) {
            // Nope.
        }
        this.socket.close();
    }
}

module.exports = Postman;
const dgram = require('node:dgram');
const socket = dgram.createSocket('udp4');

const multicastAddr = '224.0.112.80';
const multicastPort = 57620;

function listen() {
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });

    socket.on('message', (msg, rinfo) => {
        if (msg.length < 3) {
            return;
        }

        const senderId = msg.readUInt16BE(1);
        console.log(`Received a packet from ${rinfo.address}:${rinfo.port}`);
        console.log(msg.toString('utf-8'), "\n");
    });

    socket.bind(multicastPort, () => {
        socket.addMembership(multicastAddr, '0.0.0.0');
        console.log(`Scoperta working on ${multicastAddr}:${multicastPort}\n`);
    });
}

function send() {
    socket.send("Hello, World!", multicastPort, multicastAddr);
}

function close() {
    try {
        socket.dropMembership(multicastAddr);
    } catch (err) {
        // Nope.
    }
    socket.close();
}

listen();

interval = setInterval(() => {
    send();
}, 2000);
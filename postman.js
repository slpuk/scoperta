const dgram = require('node:dgram');
const socket = dgram.createSocket('udp4');

const multicastAddr = '224.0.112.80';
const multicastPort = 57620;

socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`);
});

socket.on('message', (msg, rinfo) => {
    console.log(`Received a packet from ${rinfo.address}:${rinfo.port}`);
});

socket.bind(multicastPort, () => {
    socket.addMembership(multicastAddr, '0.0.0.0');
    console.log(`Scoperta working on ${multicastAddr}:${multicastPort}\n`);
});

interval = setInterval(() => {
    socket.send("Hello, World!", multicastPort, multicastAddr);
}, 2000);
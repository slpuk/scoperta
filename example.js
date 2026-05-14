const Scoperta = require('./index');
const scoperta = new Scoperta('My Device');

scoperta.on('discovery', (device, rinfo) => {
    console.log(`\nDiscovered new device:`);
    console.log(`  ID: ${device.id.toString(16)}`);
    console.log(`  Name: ${device.name}`);
    console.log(`  Address: ${rinfo.address}:${rinfo.port}`);
});

scoperta.on('error', (err) => {
    console.error('Error:', err.message);
});

scoperta.start();

process.on('SIGINT', () => {
    console.log('\nStopping service...');
    scoperta.stop();
    process.exit();
});
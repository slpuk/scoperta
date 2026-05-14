const Packer = require('./packer');
const Postman = require('./postman');
const crypto = require('crypto');

class Scoperta {
    constructor(deviceName) {
        if (!deviceName || deviceName.length > 1000) {
            throw new Error('Device name is required and must be <= 1000 bytes');
        }
        
        this.deviceName = deviceName;
        this.version = "Scoperta/1";
        this.deviceId = crypto.randomBytes(2);
        this.packer = new Packer(this.version, this.deviceId);
        this.packet = this.packer.pack(deviceName);
        this.postman = new Postman(this.deviceId, this.packet);
        this.discoveredDevices = new Map();
    }

    start() {
        this.postman.onReceive((msg, rinfo) => {
            try {
                const device = this.packer.unpack(msg);
                
                this.discoveredDevices.set(device.id, {
                    id: device.id,
                    name: device.name,
                    address: rinfo.address,
                    port: rinfo.port,
                    lastSeen: Date.now()
                });
                
                if (this.onDiscovery) {
                    this.onDiscovery(device, rinfo);
                }
            } catch (err) {
                if (this.onError) {
                    this.onError(err);
                }
            }
        });
        
        this.postman.listen();
        this.postman.send();
        
        this.interval = setInterval(() => {
            this.postman.send();
        }, 10000);
        
        return this;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.postman.close();
        return this;
    }

    getDevices() {
        const now = Date.now();
        for (const [id, device] of this.discoveredDevices) {
            if (now - device.lastSeen > 30000) {
                this.discoveredDevices.delete(id);
            }
        }
        return Array.from(this.discoveredDevices.values());
    }

    on(event, callback) {
        if (event === 'discovery') {
            this.onDiscovery = callback;
        } else if (event === 'error') {
            this.onError = callback;
        }
        return this;
    }
}

module.exports = Scoperta;
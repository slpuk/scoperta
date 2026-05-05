# Scoperta
> A lightweight network service discovery protocol


![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Version](https://img.shields.io/badge/version-0.0.1-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)


## Run
### 1. Copy the repository

```bash
git clone https://github.com/slpuk/scoperta.git
```

### 2. Launch the main script

```bash
npm start
```

## About
__Scoperta__ is an open-source service for network device discovery. It serves as a lightweight alternative to services like Apple's Bonjour or the Linux community's Avahi.

## Architecture
The service operates over the __UDP__ transport protocol using __multicast__ transmission. It runs on the address `224.0.112.80` via port `57620`.

### 1. Packet Format
The service utilizes binary packets with minimal per-packet overhead.

__Packet cheme:__
```
[ Magic          ] - 1 Byte
[ ID             ] - 2 Bytes
[ Name Length    ] - 1 Byte
[ Name           ] - up to 255 Bytes
[ Payload Length ] - 1 Byte
[ Payload        ] - up to 255 Bytes
[ CRC-32         ] - 4 Bytes
```
Field Descriptions:
- `Magic` - A unique version identifier used to implicitly filter out network noise and legacy packets. CRC-8-ROHC hash of `"Scoperta/{version}"`, where version is the protocol version string (e.g., "1", "2").This provides both versioning and noise filtering.
- `ID` - A unique client identifier generated randomly.
- `Name Length` - The length of the client’s name (`Name`).
- `Name` - A user-defined client name, __UTF-8 encoded__, up to 255 bytes.
- `Payload Length` - The length of the `Payload`.
- `Payload` - A user-defined data, up to 255 Bytes.
- `CRC-32` - The packet's checksum for error detection.

_Example `Payload` (JSON):_
```json
{"type":"temperature","value":23.5,"unit":"celsius"}
```

_Note:_ Multi-byte integers (ID, CRC-32) are transmitted in __network byte order (big-endian)__.
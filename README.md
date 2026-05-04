# Scoperta
> A lightweight network service discovery protocol

## About
__Scoperta__ is an open-source service for network device discovery. It serves as a lightweight alternative to services like Apple's Bonjour or the Linux community's Avahi.

## Architecture
The service operates over the __UDP__ transport protocol using __multicast__ transmission. It runs on the address `224.0.112.80` via port `57620`.

### 1. Packet Format
The service utilizes binary packets with minimal per-packet overhead.

__Packet cheme:__
```
[ Magic       ] - 1 Byte
[ ID          ] - 2 Bytes
[ Name Length ] - 2 Bytes
[ Name        ] - up to 1000 Bytes
[ CRC-32      ] - 4 Bytes
```
_Field Descriptions:_
- `Magic` – A unique version identifier used to implicitly filter out network noise and legacy packets.
- `ID` - A unique client identifier generated randomly.
- `Name Length` – The length of the client’s name (`Name`).
- `Name` - A user-defined client name, up to 1000 characters.
- `CRC-32` - The packet's checksum for error detection.

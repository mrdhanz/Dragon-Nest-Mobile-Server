# GateServer — Development and Operations Guide

## Purpose
GateServer is the client gateway for the Dragon Nest Mobile server stack. It manages client sessions, encodes/decodes protocol headers, and forwards traffic to internal services.

## Source Location
- `gateserver/` contains GateServer source code and network modules.
- The client gateway behavior is primarily implemented in `gateserver/network/`.

## Configuration
**Config file**: `exe/conf/gate_conf.xml`

Key fields:
- **Listen**:
  - `clientlink` (client connections).
  - `gslink` (GameServer connections).
- **Connect**:
  - `mslink` (MasterServer).
  - `ctrllink` (ControlServer).
  - `audiolink` (AudioServer).
- **ConnectLimit**: connection rate limits and maximums.
- **Compress / Encrypt**: protocol encoding toggles.

## Runtime Flow
1. GateServer starts and parses the line ID from its config to name its logs.
2. It initializes the session manager and network link handlers.
3. Client connections are accepted by `clientlink`, which maps to sessions and forwards traffic.

## Development Guide
### Extending protocol forwarding
1. Update protocol decoding/encoding in `gateserver/network/clientlink.cpp` if new headers or flags are added.
2. Ensure new protocol IDs are registered in shared protocol definitions.
3. Validate session mapping logic remains stable when adding new RPC types.

### Adding new link handlers
- Add new link classes under `gateserver/network/` and register them in the GateConfig singleton.
- Update `gate_conf.xml` with new `Listen` or `Connect` endpoints as required.

### Validation checklist
- Verify compression/encryption toggles are consistent with GameServer and client expectations.
- Confirm connection limits are appropriate for expected user concurrency.


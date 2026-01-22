# GameServer — Development and Operations Guide

## Purpose
GameServer provides the real-time gameplay simulation and core game logic, including combat, scene management, progression systems, and timed events.

## Source Location
- `gameserver/` contains the GameServer implementation.
- Primary initialization and system registration occur in `gameserver/process.cpp`.

## Configuration
**Config file**: `exe/conf/gs_conf.xml`

Key fields:
- **Connect**: `dblink`, `mslink`, `ctrllink`.
- **External endpoints**: `SdkUrl`, `AntiAddictionUrl`, `DataMoreUrl`, `GameWeixinUrl`.
- **Attributes**: `debug`, `line`, and `cross` (for cross-server mode).

## Runtime Flow
1. GameServer starts with its XML config and parses the line ID.
2. It initializes a large set of gameplay managers and systems.
3. The main loop runs frame updates and logs slow frames.

## Development Guide
### Adding gameplay systems
- Follow the existing manager pattern: create a singleton manager and register it in `Process_Setup()`.
- Ensure any new tables or configuration files are loaded in startup.

### Cross-server behavior
- Use the `cross` attribute in config files for cross-server deployments.
- Ensure cross-specific endpoints and data segregation are handled correctly.

### Validation checklist
- Keep frame budget in mind; slow frames are logged if > 50ms.
- Verify protocol compatibility with GateServer and MasterServer when adding new features.


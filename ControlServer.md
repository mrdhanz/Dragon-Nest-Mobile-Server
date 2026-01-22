# ControlServer — Development and Operations Guide

## Purpose
ControlServer exposes control-plane endpoints for other services and integrates gmtool access for administrative commands. It mediates control traffic between GameServer, GateServer, MasterServer, and LoginServer.

## Source Location
- `controlserver/` contains ControlServer implementation and protocol handlers.

## Configuration
**Config file**: `exe/conf/ctrl_conf.xml`

Key fields:
- **Connect**: `dblink`, `loginlink`.
- **Listen**: `gatelink`, `gslink`, `mslink`, `gmtoollink`.
- **Shm**: shared-memory segment sizing for scene/account/role data.

## Runtime Flow
1. ControlServer starts and initializes shared memory segments.
2. It listens for control-plane traffic and routes GM commands.

## Development Guide
### Adding admin commands
- Implement new command handlers under `controlserver/protocol/`.
- Ensure commands are properly authenticated and routed to target services.

### Shared memory changes
- Update `Shm` configuration and shared structures cautiously; changes affect all services that read shared memory.

### Validation checklist
- Confirm gmtool clients can connect on `gmtoollink`.
- Ensure control-plane commands do not block main processing loops.


# MasterServer — Development and Operations Guide

## Purpose
MasterServer orchestrates persistent and cross-cutting systems such as guilds, rankings, matchmaking, payments, and other global services. It is the central coordinator for shared game state.

## Source Location
- `masterserver/` contains the MasterServer implementation.
- Manager registration is centralized in `masterserver/process.cpp`.

## Configuration
**Config file**: `exe/conf/ms_conf.xml`

Key fields:
- **Connect**: `dblink`, `ctrllink`, `loginlink`.
- **Listen**: `gatelink`, `gslink`.
- **Payment/platform**: `PayUrl`, `MsdkUrl`, `XingeUrl`.
- **Attributes**: `debug`, `AppPlat`.

## Runtime Flow
1. MasterServer starts with `ms_conf.xml` and initializes its managers.
2. It listens for GateServer and GameServer links and routes global operations.

## Development Guide
### Adding global systems
- Add new managers under `masterserver/` and register them in `Process_Setup()`.
- Update schema or configuration files if persistent data is required.

### Payments and platform integration
- Keep configuration fields aligned with handler expectations.
- Validate payment flows in both sandbox and production endpoints.

### Validation checklist
- Verify cross-service RPCs for new features are registered and versioned.
- Ensure global state consistency when introducing new systems.


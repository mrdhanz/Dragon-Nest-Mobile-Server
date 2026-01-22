# Dragon Nest Mobile Server — Comprehensive Documentation

This document consolidates the server architecture, configuration, runtime flows, and operational practices for the Dragon Nest Mobile server repository. It provides **one detailed section per server** along with guidance for developing and extending each service.

## Table of Contents
- [Repository Overview](#repository-overview)
- [Source Layout and Build Targets](#source-layout-and-build-targets)
- [Server Inventory](#server-inventory)
- [Per-Server Documentation](#per-server-documentation)
  - [DBServer](#dbserver)
  - [GateServer](#gateserver)
  - [LoginServer](#loginserver)
  - [AudioServer](#audioserver)
  - [GameServer](#gameserver)
  - [MasterServer](#masterserver)
  - [ControlServer](#controlserver)
  - [VersionServer](#versionserver)
- [Ports and Network Topology](#ports-and-network-topology)
- [Startup, Shutdown, and Operations](#startup-shutdown-and-operations)
- [Database Initialization and Data Seeding](#database-initialization-and-data-seeding)
- [Build and Dependencies](#build-and-dependencies)
- [Operational Reference Notes](#operational-reference-notes)

---

## Repository Overview
The repository provides the server-side implementation for Dragon Nest Mobile. Prebuilt binaries are included so the server can be run without rebuilding, while the C++ source code supports further development and modification. The main README describes the required dependencies, database setup, and the standard startup workflow for the server stack.

---

## Source Layout and Build Targets
The top-level CMake project configures shared include paths (common utilities, protocol code, and third-party libraries) and builds the core services via subdirectories. The default build targets include:
- `dbserver`
- `gateserver`
- `loginserver`
- `audioserver`
- `gameserver`
- `masterserver`
- `controlserver`
- `versionserver`

This is the base set of services that the repository builds directly from source.

---

## Server Inventory
The core service list is defined by the CMake targets above. Operational scripts reference additional services such as `routerserver`, `worldserver`, `idipserver`, `fmserver`, and `centerserver` as part of a full production stack. These services are referenced for completeness but are not built by the default CMake configuration in this repository.

---

## Per-Server Documentation

### DBServer
**Role**: Database access layer for the game and online DBs. It manages SQL connections and exposes internal endpoints for GameServer, MasterServer, and ControlServer.

**Config file**: `exe/conf/db_conf.xml`

**Key configuration fields**:
- Primary DB: `world1`.
- Online DB: `db_Dragon_Nest_online`.
- Listeners: `gslink` (10150), `mslink` (10160), `ctrllink` (10165).
- `AutoCreateDB` and `MaxRegisterNum` determine schema creation and registration limits.

**Development guidance**:
- DBServer code lives under `dbserver/`. Focus on SQL access logic and protocol handlers for database RPCs.
- When adding new persistence features, check the existing task/SQL manager modules and update the DB schema initialization scripts under `DataBaseInits/`.
- Keep thread-count and connection pooling in sync with `db_conf.xml` and workload expectations.

---

### GateServer
**Role**: Client gateway that maintains sessions and forwards protocol traffic to internal services. It performs protocol encoding and session routing.

**Config file**: `exe/conf/gate_conf.xml`

**Key configuration fields**:
- Listeners: `clientlink` (10110) and `gslink` (10131).
- Outbound connections: `mslink` (10120), `ctrllink` (10125), `audiolink` (10170).
- `ConnectLimit` for rate limiting and connection caps.
- `Compress` and `Encrypt` toggles.

**Development guidance**:
- GateServer code is under `gateserver/`. The most critical modules are `network/clientlink.cpp` and the session manager.
- When extending protocol forwarding, keep header encoding, RPC/ptc handling, and session mapping consistent.
- If you change compression or encryption rules, verify compatibility with GameServer and client protocol expectations.

---

### LoginServer
**Role**: Authentication and server-list gateway. Handles login requests, gate list visibility, and GM-related access checks.

**Config file**: `exe/conf/login_conf.xml`

**Key configuration fields**:
- Listeners: `ctrllink` (25000), `clientlink` (25001), `gmtoollink` (25002), `cslink` (25003), `mslink` (28000).
- `ServerState` thresholds for server fullness.
- `MsdkUrl` and platform-specific endpoints.

**Development guidance**:
- LoginServer code is under `loginserver/`. Gate list logic and GM account handling live in `gatemgr/` and `gmmgr/`.
- When modifying authentication flow, review the login verification handlers under `verify/`.
- For server list changes, update the `gateinfo` DB schema and the reload logic referenced by gmtool commands.

---

### AudioServer
**Role**: Dedicated audio service that exposes a gate-facing listener for audio-related protocols.

**Config file**: `exe/conf/audio_conf.xml`

**Key configuration fields**:
- Listener: `gatelink` (10170).
- Optional CenterServer link is present but commented out.

**Development guidance**:
- AudioServer code is under `audioserver/`. Protocol handlers will be in `protocol/` and networking modules.
- Validate audio payload formats and buffer sizes when changing audio pipelines.

---

### GameServer
**Role**: Real-time gameplay simulation and core game logic, including scene management, combat systems, progression, and events.

**Config file**: `exe/conf/gs_conf.xml`

**Key configuration fields**:
- Outbound connections: `dblink` (10150), `mslink` (10130), `ctrllink` (10145).
- External endpoints: `SdkUrl`, `AntiAddictionUrl`, `DataMoreUrl`, `GameWeixinUrl`.
- `debug` and `line` attributes.

**Development guidance**:
- GameServer code is under `gameserver/`. The core runtime bootstrap lives in `process.cpp` and registers most gameplay managers.
- When adding gameplay systems, follow the manager pattern (singleton init + update hooks) and wire new systems into `Process_Setup()`.
- Cross-server behavior is configured via the `cross` attribute and alternate config files (e.g., `gs_cross_conf.xml`).

---

### MasterServer
**Role**: Central orchestration for persistent systems (guilds, rankings, payments, matchmaking) and global coordination.

**Config file**: `exe/conf/ms_conf.xml`

**Key configuration fields**:
- Outbound connections: `dblink` (10160), `ctrllink` (10180), `loginlink` (28000).
- Listeners: `gatelink` (10120), `gslink` (10130).
- Payment and platform integration: `PayUrl`, `MsdkUrl`, `XingeUrl`.
- `debug` and `AppPlat` settings.

**Development guidance**:
- MasterServer code is under `masterserver/`. It initializes a large set of global/persistent managers in `process.cpp`.
- When introducing new global systems (ranking, events, guild extensions), register them in `Process_Setup()` and update schema/data if needed.
- Payment or platform integration changes should align with XML config fields and shared payment handlers.

---

### ControlServer
**Role**: Coordination and control endpoints for other services, including gmtool access. It aggregates control plane requests across GameServer, GateServer, and MasterServer.

**Config file**: `exe/conf/ctrl_conf.xml`

**Key configuration fields**:
- Outbound connections: `dblink` (10165), `loginlink` (25000).
- Listeners: `gatelink` (10125), `gslink` (10145), `mslink` (10180), `gmtoollink` (12895).
- Shared memory configuration (`Shm`).

**Development guidance**:
- ControlServer code is under `controlserver/` and shares protocol handlers for control-plane operations.
- When adding administrative commands, ensure they are authorized and routed correctly to dependent services.

---

### VersionServer
**Role**: Version checks and gmtool connectivity for client versioning.

**Config file**: `exe/conf/version_conf.xml`

**Key configuration fields**:
- Listeners: `clientlink` (24001) and `gmtoollink` (24002).
- `RootPath` for version configuration files.

**Development guidance**:
- VersionServer code is under `versionserver/`. Protocol handlers define how version checks are performed.
- When changing version validation, update both server logic and any client-side assumptions.

---

## Ports and Network Topology
Below is a quick reference of the default endpoints defined in `exe/conf/*.xml`:

- **LoginServer**: `ctrllink` 25000, `clientlink` 25001, `gmtoollink` 25002, `cslink` 25003, `mslink` 28000.
- **GateServer**: `clientlink` 10110, `gslink` 10131, `mslink` 10120, `ctrllink` 10125, `audiolink` 10170.
- **GameServer**: `dblink` 10150, `mslink` 10130, `ctrllink` 10145.
- **MasterServer**: `dblink` 10160, `ctrllink` 10180, `loginlink` 28000; `gatelink` 10120, `gslink` 10130.
- **DBServer**: `gslink` 10150, `mslink` 10160, `ctrllink` 10165.
- **ControlServer**: `gatelink` 10125, `gslink` 10145, `mslink` 10180, `gmtoollink` 12895; `dblink` 10165; `loginlink` 25000.
- **AudioServer**: `gatelink` 10170.
- **VersionServer**: `clientlink` 24001, `gmtoollink` 24002.

---

## Startup, Shutdown, and Operations

### Windows startup
`START_SERVER.bat` launches the core services in order (audio, login, db, game, gate, master, control, version). The batch script expects binaries in `exe/` with configuration files in `exe/conf/`.

### Linux startup
`exe/script/start.sh` supports starting services with `conf.xml` and optional `lineID` for multi-instance services (gameserver/gateserver/routerserver). The script handles pid files per instance and validates parameters before startup.

### Shutdown
Linux stop scripts and the Windows `STOP_SERVER.bat` are provided for orderly shutdown. Service names in these scripts must match the binaries being run.

---

## Database Initialization and Data Seeding
The main README describes the database initialization process using `INITIALIZE_DATABASE.bat`. This script creates required databases and seeds default data. Additional server and user seed data can be found in `DataBaseInits/5. InitServerData.sql`.

---

## Build and Dependencies
The project uses CMake to build the server binaries and shares common headers across services. Service-level dependencies include:
- **GameServer**: MySQL, Lua, protobuf, curl, VOIP libraries, and other third-party dependencies.
- **MasterServer**: MySQL, Lua, protobuf, curl, and OAuth libraries.
- **GateServer**: KCP, protobuf, and core server libraries.
- **LoginServer**: MySQL, protobuf, curl, and core server libraries.

---

## Operational Reference Notes
Operational documentation in `doc/` contains environment-specific guidance, including:
- Endpoint overrides for IDC deployments (`gs_conf.xml`, `ms_conf.xml`, `login_conf.xml`).
- Gate list visibility rules and state semantics for `gateinfo`.
- Maintenance workflows for clearing data and orderly shutdown sequences.

---

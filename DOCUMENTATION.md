# Dragon Nest Mobile Server — Comprehensive Documentation

This document consolidates the server architecture, configuration, runtime flows, and operational practices for the Dragon Nest Mobile server repository. It is intended to serve as a single reference for developers and operators.

## Table of Contents
- [Repository Overview](#repository-overview)
- [Source Layout and Build Targets](#source-layout-and-build-targets)
- [Server Inventory and Roles](#server-inventory-and-roles)
- [Configuration Files and Key Settings](#configuration-files-and-key-settings)
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

## Server Inventory and Roles

### DBServer
**Role**: Database access layer for the game and online DBs. Manages SQL connections and exposes internal endpoints for GameServer, MasterServer, and ControlServer.

### GateServer
**Role**: Client gateway that maintains sessions and forwards protocol traffic to internal services.

### LoginServer
**Role**: Authentication and server-list gateway. It handles login requests, gate list visibility, and GM-related access checks.

### AudioServer
**Role**: Dedicated audio service that exposes a gate-facing listener.

### GameServer
**Role**: Real-time gameplay simulation and core game logic, including scene management, combat systems, progression, and events.

### MasterServer
**Role**: Central orchestration for persistent systems (guilds, rankings, payments, matchmaking) and global coordination.

### ControlServer
**Role**: Coordination and control endpoints for other services, including gmtool access.

### VersionServer
**Role**: Version checks and gmtool connectivity for client versioning.

### Additional services referenced in scripts
Operational scripts reference other services (e.g., routerserver, worldserver, idipserver, fmserver, centerserver) as part of a full production stack. Those services are referenced by startup scripts but are not part of the default CMake build targets in this repository.

---

## Configuration Files and Key Settings
The runtime configuration lives under `exe/conf/`. Each service reads an XML configuration file containing endpoints, logging, and service-specific settings.

### Configuration file mapping
- `audio_conf.xml` → AudioServer
- `db_conf.xml` → DBServer
- `gate_conf.xml` → GateServer
- `gs_conf.xml` → GameServer
- `login_conf.xml` → LoginServer
- `ms_conf.xml` → MasterServer
- `ctrl_conf.xml` → ControlServer
- `version_conf.xml` → VersionServer

### DBServer (`db_conf.xml`)
- Two DB connections: `world1` and `db_Dragon_Nest_online`.
- Listeners for GameServer (`gslink`), MasterServer (`mslink`), and ControlServer (`ctrllink`).
- Supports `AutoCreateDB` and `MaxRegisterNum` settings.

### GateServer (`gate_conf.xml`)
- Listens for clients (`clientlink`) and GameServer (`gslink`).
- Connects to MasterServer (`mslink`), ControlServer (`ctrllink`), and AudioServer (`audiolink`).
- Supports connection limits (`ConnectLimit`), compression, and encryption toggles.

### GameServer (`gs_conf.xml`)
- Connects to DBServer (`dblink`), MasterServer (`mslink`), and ControlServer (`ctrllink`).
- Configures `SdkUrl`, `AntiAddictionUrl`, `DataMoreUrl`, and `GameWeixinUrl`.
- Uses `debug` and `line` attributes for environment and shard/line ID.

### MasterServer (`ms_conf.xml`)
- Connects to DBServer (`dblink`), ControlServer (`ctrllink`), and LoginServer (`loginlink`).
- Listens for GateServer (`gatelink`) and GameServer (`gslink`).
- Configures payment endpoints (`PayUrl`), MSDK endpoint (`MsdkUrl`), and Xinge push endpoint (`XingeUrl`).

### LoginServer (`login_conf.xml`)
- Listens for ControlServer, client, gmtool, centerserver, and MasterServer connections.
- Configures `ServerState` thresholds and `MsdkUrl`.

### ControlServer (`ctrl_conf.xml`)
- Connects to DBServer (`dblink`) and LoginServer (`loginlink`).
- Listens for GateServer (`gatelink`), GameServer (`gslink`), MasterServer (`mslink`), and gmtool.
- Configures shared-memory segments for scene/account/role records.

### AudioServer (`audio_conf.xml`)
- Listens for GateServer (`gatelink`).
- Optional CenterServer link is present but commented out.

### VersionServer (`version_conf.xml`)
- Exposes client and gmtool endpoints for version checks.

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

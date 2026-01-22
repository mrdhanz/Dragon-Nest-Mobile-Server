# Server Lifecycle and Manager Initialization Map

This document maps each server’s startup path (main → Process_Setup → Process_Update) and highlights the key managers and subsystems initialized in each service.

## 1) GateServer
**Entry point**: `gateserver/main.cpp`.

### Startup flow
- Validates config parameter, extracts `line` ID for log naming, then initializes logging.
- Calls `Process_Setup()` to build core managers and register protocols.
- Main loop repeatedly calls `Process_Update()` and runs `CmdLine` updates.【F:gateserver/main.cpp†L1-L83】

### Key managers created in `Process_Setup()`
- `GateConfig` (config + network links)
- `SessionManager` (client session tracking)
- `ServerStateInfo` (server status)
- `CProtocolStat`, `CProtocolCoder` (protocol stats + encode/decode)
- `CGateProfile`, `CrossProtocolBanMgr`
- `CProtocolRegister` (protocol registration)

These managers define GateServer’s role as a session-aware forwarding gateway with protocol-aware routing.【F:gateserver/process.cpp†L1-L40】

---

## 2) GameServer
**Entry point**: `gameserver/main.cpp`.

### Startup flow
- Parses `line` and `cross` values from config, uses them to determine log naming.
- Initializes logging, registers signal handlers, sets up `CmdLine`.
- Calls `Process_Setup()`.
- Enters a frame-timed loop: measures frame duration and logs slow frames (>50ms).【F:gameserver/main.cpp†L1-L90】

### Configuration (`GSConfig`)
- Registers network links: Gate, DB, Web, MS, World, Router, Control.
- Reads settings like `debug`, `cross`, `line`, DB info (if not cross), `SdkUrl`, `DataMoreUrl`, `AntiAddictionUrl`, `GameWeixinUrl`, and frame time.【F:gameserver/config.cpp†L1-L176】

### Manager initialization (high-level)
`Process_Setup()` initializes many gameplay and system managers. The list is extensive, but highlights include:
- Role/scene/AI systems
- Combat systems and skill tables
- Guild, chat, team, ranking, and event managers
- IDIP/tss handling and external integrations

This design puts real-time simulation and gameplay logic in GameServer while relying on other services for coordination and persistence.【F:gameserver/config.cpp†L1-L176】

---

## 3) MasterServer
**Entry point**: `masterserver/main.cpp`.

### Startup flow
- Initializes logging (`masterserver`) and enters a loop calling `Process_Update()` with small sleeps.
- Uses `CmdLine` for runtime controls.【F:masterserver/main.cpp†L1-L67】

### Key manager groups in `Process_Setup()`
- Global configuration and script preloading
- DB and TLog initialization
- Persistent systems: guilds, rankings, mail, auctions, matchmaking, arena, pay
- Social systems: friends, chat, flower, reports
- Cross-server systems and shared memory managers

MasterServer is the orchestration layer for stateful, persistent systems across all game lines/regions.【F:masterserver/process.cpp†L1-L220】

---

## 4) LoginServer
**Entry point**: `loginserver/main.cpp`.

### Startup flow
- Validates config, initializes logging, then calls `Process_Setup()`.
- Update loop calls `Process_Update()` to process network and login token validation.【F:loginserver/main.cpp†L1-L71】

### Key managers
- `LoginConfig`, `MysqlMgr`, `GateMgr`, `GMMgr`
- `WhiteListMgr`, `CLoginControl`, `TokenVerifyMgr`, `AccountBanMgr`
- `ConnectionMgr`, `CPlatNoticeMgr`, `ReadRoleControl`

These provide authentication, server list/gate routing, GM controls, and platform notices.【F:loginserver/process.cpp†L1-L59】

---

## 5) DBServer
**Entry point**: `dbserver/main.cpp`.

### Startup flow
- Initializes logging and `Process_Setup()`.
- `Process_Update()` pumps network traffic and `CMysqlMgr::Process()` to execute DB tasks.【F:dbserver/dbprocess.cpp†L1-L78】

### Key managers
- `DBConfig`, `CMysqlMgr`, `CDbProfiler`
- `ProtoStatistics` used by a timer for periodic HTML snapshots of protocol usage (for debugging).【F:dbserver/dbprocess.cpp†L1-L59】

---

## 6) ControlServer
**Entry point**: `controlserver/main.cpp`.

### Startup flow
- Initializes `ControlConfig` and then shared memory, GS manager, login control, queues, scene config and managers.
- `Process_Update()` calls `ControlConfig::ProcessNetMessage()` to drive IO.

### Key managers
- `ShmMgr`, `CGsManager`, `CLoginControl`, `CAccountSessionMgr`
- `QueuingMgr`, `CWhiteListMgr`, `CAccountKicker`, `CSceneManager`

ControlServer acts as a control-plane hub for account/session flows and login gating.【F:controlserver/process.cpp†L1-L83】

---

## 7) VersionServer
**Entry point**: `versionserver/main.cpp`.

### Startup flow
- Initializes config, reload manager, and connection manager.
- `Process_Update()` only pumps network traffic (no heavy per-tick systems).【F:versionserver/process.cpp†L1-L46】

### Key managers
- `VersionConfig`, `CReloadMgr`, `ConnectionMgr`.

This service is lightweight and focuses on client version checking and gmtool connectivity.【F:versionserver/process.cpp†L1-L46】

---

## 8) AudioServer
**Entry point**: `audioserver/main.cpp`.

### Startup flow
- Initializes `AudioConfig`, `AudioMgr`, and registers protocols.
- Update loop processes network messages and runs `AudioMgr::Update()` each tick.【F:audioserver/process.cpp†L1-L34】


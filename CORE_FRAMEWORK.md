# Core Framework Deep Dive

This document explains the shared C++ framework that every server in this repository relies on: configuration loading, networking, protocol/RPC framing, forwarding, and singleton/timer infrastructure.

## 1) Configuration Base (`Config`)
**Primary file**: `common/include/baseconfig.h`.

### Purpose
`Config` is the base class for server configuration. Each server-specific config class extends it, reads XML settings, and sets up network links. The base class owns:
- The list of `BaseLink` handlers attached to the server.
- The `INetWork` instance that drives socket IO.
- Common configuration fields (server name/id/zone, root path, config path).【F:common/include/baseconfig.h†L1-L66】

### Key methods
- `Init(config)` → loads XML, initializes network, and reads server-specific settings.【F:common/include/baseconfig.h†L14-L56】
- `ProcessNetMessage()` → pumps the underlying network event loop by delegating to `INetWork` (called every server tick).【F:common/include/baseconfig.h†L14-L56】
- `AddLinkHandler(BaseLink*)` → registers link handlers that receive decoded protocol/RPC callbacks.【F:common/include/baseconfig.h†L40-L54】

### Why it matters
Every server runs its IO loop by calling `Config::ProcessNetMessage()` from its `Process_Update()` function, making `Config` the shared entry point for handling network traffic and dispatching to server-specific link logic.【F:common/include/baseconfig.h†L14-L56】

---

## 2) Networking Layer (`INetWork`, `CNetProcessor`)
**Primary files**: `common/include/network.h`, `common/include/netproc.h`.

### `INetWork`
`INetWork` is the abstract IO interface. It defines methods for:
- `Listen`, `Connect`, `DisConnect`, `Send`
- `ProcessMsg` (poll network events)
- address lookup for local/remote endpoints
- attaching per-connection user data

Constants define buffer sizes, maximum packet size, and event types (connect, receive, error, close).【F:common/include/network.h†L7-L90】

### `CNetProcessor`
`CNetProcessor` bridges the `INetWork` backend with protocol/RPC processing and `BaseLink` handlers.

Key responsibilities:
- Owns a connection → `BaseLink` map.
- Sends protocol/RPC data with `Send(...)` overloads.
- Receives events (`OnRecv`, `OnClose`, etc.) and forwards to the associated `BaseLink`.

The `Config` class initializes `INetWork`, then registers it with `CNetProcessor` so all servers can share the same event dispatch mechanism.【F:common/include/netproc.h†L1-L63】

---

## 3) Protocol and RPC Framing
**Primary files**: `common/include/coder.h`, `common/include/protocol.h`, `common/include/crpc.h`.

### Packet headers
Two headers define wire format:
- `ProtocolHead` for PTC messages.
- `RpcHead` for RPC calls and replies.

Flags in `PtcHeadFlag` encode message type (protocol vs RPC), request/reply, compression, and keep-alive behaviors.【F:common/include/coder.h†L13-L44】

### `CProtocol`
`CProtocol` is the base class for protocol messages. Each protocol:
- Identifies itself with a `dwType`.
- Serializes/deserializes protobuf payloads.
- Implements `Process(connID)` to handle inbound messages.
- Registers itself in a global map so packets can be instantiated by type ID.【F:common/include/protocol.h†L11-L48】

### `CRpc`
`CRpc` handles request/response RPC flows:
- `Process(connID)` handles either the call or reply depending on end type.
- Timeout and delayed reply support are built in.
- Uses `CNetProcessor::Send` to dispatch replies automatically for server-side RPCs.【F:common/include/crpc.h†L21-L100】

---

## 4) Link Handling & Forwarding (`BaseLink`)
**Primary file**: `common/include/baselink.h`.

### `BaseLink`
`BaseLink` is the primary message handler used by all servers. It:
- Decodes incoming packets (`DecodeHead`).
- Routes them to protocol (`OnProtocol`) or RPC (`OnRpc`) processing.
- Allows forwarding rules for relay-style servers (GateServer).

Each server implements concrete `BaseLink` subclasses (for example, GateServer’s `clientlink` and `gslink`) and registers them with its `Config` instance.【F:common/include/baselink.h†L71-L145】

### `ForwardInterface`
`ForwardInterface` lets a link decide where to route incoming traffic. It supports:
- Picking a target connection based on protocol/RPC headers.
- Optionally rewriting packet headers and body when forwarding.

This is the mechanism GateServer uses for session-based forwarding between clients and internal services.【F:common/include/baselink.h†L42-L69】

---

## 5) Singleton & Timer Infrastructure
**Primary files**: `common/include/singleton.h`, `common/include/timer.h`.

### Singleton macros
All servers use singleton managers (e.g., `GSConfig`, `MSConfig`, `MysqlMgr`). The macros define:
- `CreateInstance`, `DestroyInstance`, `Instance()` access.
- `SINGLETON_CREATE_INIT*` helpers to initialize and error-check startup sequence.

This pattern drives the initialization order in `Process_Setup()` functions across all servers.【F:common/include/singleton.h†L5-L23】

### Timers
The `ITimer` and `ITimerManager` interface defines a cross-server timer API with:
- Interval and repetition count
- Support for timer callbacks and delegates
- `Update()` called inside server loops

Servers like DBServer and MasterServer use this for periodic statistics collection and operational tasks.【F:common/include/timer.h†L8-L47】

---

## 6) Standard Server Update Loop Pattern
The core framework establishes a consistent runtime loop:
1. `main.cpp` loads config and sets up logging.
2. `Process_Setup()` initializes singleton managers.
3. Each loop tick calls `Config::ProcessNetMessage()` and other per-server updates.
4. `Process_Stop()` toggles a running flag to exit gracefully.
5. `Process_Cleanup()` tears down managers in reverse order.

This is implemented in each server’s `process.cpp` and `main.cpp`, enabling predictable behavior across the stack.【F:gameserver/main.cpp†L1-L93】【F:gateserver/process.cpp†L1-L52】


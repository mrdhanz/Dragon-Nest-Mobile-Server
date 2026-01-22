# GameServer Gameplay Architecture Deep Dive

This document focuses on the **GameServer** gameplay model: entity/component structure, networking sync, and how gameplay state is packaged for clients.

## 1) Entity + Component Model
**Primary files**: `gameserver/entity/XObject.h`, `gameserver/component/XComponent.h`.

### `XObject` (entity host)
- Owns a `Unit` and tracks current position, facing, and state.
- Maintains component pointers (indexed by component ID) and action routing.
- Provides accessors for key components like `XNetComponent`, `XSkillComponent`, `XBuffComponent`, `XStateMachine`, etc.【F:gameserver/entity/XObject.h†L15-L168】

`XObject` is the hub for gameplay logic because each component can register actions and receive updates each tick. The `Update()` method runs the attached components and state-machine logic, while movement/position updates are tracked at the object level for easy sync to clients.【F:gameserver/entity/XObject.h†L36-L143】

### `XComponent` (behavioral units)
- The base class for all gameplay components (skills, movement, networking, buffs, AI).
- Components register action handlers using `RegisterAction`, receive updates in `Update(float dt)`, and access the host `XObject` and associated `XEntity`.
- Components can be enabled/disabled dynamically via `Enable()` and maintain their own action subscription state.【F:gameserver/component/XComponent.h†L15-L57】

---

## 2) Network Sync via `XNetComponent`
**Primary file**: `gameserver/component/XNetComponent.cpp`.

### Broadcast helpers
`XNetComponent` centralizes client-facing sync for:
- Skill results (`BroadcastSkillResult`)
- Movement notifications (`BroadcastMoveAction`)
- Random warning position data (`BroadcastRandomWarningPos`)
- Correct location updates (`BroadcastCorrectLocation`)
- Cooldown updates (`BroadcastCDCall`)

Each of these functions constructs protocol messages (e.g., `PtcG2C_SkillResult`, `PtcG2C_SyncMoveNotify`) and dispatches them either to the entire scene or to the local player only, depending on the update type.【F:gameserver/component/XNetComponent.cpp†L37-L178】

### Movement/reporting flow
When the object moves, `ReportMoveAction()` checks if the scene uses grid-based visibility. If so, it packages the movement into a compact form (pos X/Z packed into a single integer) and broadcasts only to visible entities. This is a bandwidth optimization that avoids full scene broadcasts.【F:gameserver/component/XNetComponent.cpp†L120-L166】

### Step sync packaging
`PackageSyncData()` builds `StepSyncData` packets. It:
- Packs position, facing, action state, and sequence into a compact `common` field.
- Adds optional fields depending on current state (casting, being hit, freeze state).
- Tracks `_last_sync_*` values to minimize redundant sync messages.

This is the key method used for incremental movement/state sync in combat and fast-paced gameplay zones.【F:gameserver/component/XNetComponent.cpp†L180-L277】

---

## 3) Why this model matters
- **Component isolation**: Each gameplay system can be developed as a separate component without touching the core entity class.
- **Net sync centralization**: `XNetComponent` is the primary gateway for client updates, keeping protocol packaging consistent.
- **State compression**: Sync data is intentionally packed (bitfields + combined values) to reduce network payload size.

These design choices reflect a performance-focused server model for real-time gameplay simulation.


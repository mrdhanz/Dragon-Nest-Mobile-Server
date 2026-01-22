# LoginServer — Development and Operations Guide

## Purpose
LoginServer handles authentication, gate list visibility, and GM-related login controls. It is the entry point for client logins and provides the server list to clients.

## Source Location
- `loginserver/` contains LoginServer source code.
- Gate list logic is under `loginserver/gatemgr/`.
- GM account and reload logic is under `loginserver/gmmgr/`.

## Configuration
**Config file**: `exe/conf/login_conf.xml`

Key fields:
- **Listen**:
  - `ctrllink` (control server).
  - `clientlink` (client connections).
  - `gmtoollink` (GM tool access).
  - `cslink` (center server link).
  - `mslink` (MasterServer link).
- **ServerState**: server fullness thresholds.
- **MsdkUrl**: MSDK endpoint for login verification.

## Runtime Flow
1. LoginServer starts with `login_conf.xml` and initializes log output.
2. It loads gate list data from `login_db.gateinfo`.
3. Client logins are verified and routed to gate servers.

## Development Guide
### Updating login verification
- Check handlers in `loginserver/verify/` for platform-specific login flows.
- Update configuration parsing if new endpoints are needed.

### Extending gate list or GM controls
- Modify `loginserver/gatemgr/` and ensure updates are reflected in the `gateinfo` table.
- Use gmtool reload hooks to refresh data without restart.

### Validation checklist
- Confirm gate list visibility flags match expectations in `login_db`.
- Ensure GM-related toggles are consistent with `debug` settings across servers.


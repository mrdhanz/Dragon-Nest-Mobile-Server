# VersionServer — Development and Operations Guide

## Purpose
VersionServer handles client version validation and exposes gmtool connectivity for version-related operations.

## Source Location
- `versionserver/` contains VersionServer implementation and protocol handlers.

## Configuration
**Config file**: `exe/conf/version_conf.xml`

Key fields:
- **Listen**: `clientlink` (24001) and `gmtoollink` (24002).
- **RootPath**: path to version configuration files.

## Runtime Flow
1. VersionServer starts and listens for client version checks.
2. It returns version information and compatibility responses to clients.

## Development Guide
### Updating version logic
- Update protocol handlers under `versionserver/protocol/`.
- Ensure version configuration files referenced under `RootPath` are updated accordingly.

### Validation checklist
- Confirm client version responses match expected client logic.
- Verify gmtool access for version reloads or diagnostics.


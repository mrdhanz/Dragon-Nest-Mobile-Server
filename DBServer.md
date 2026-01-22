# DBServer — Development and Operations Guide

## Purpose
DBServer is the database access layer for the Dragon Nest Mobile server stack. It manages connections to the game database and the online database, and exposes endpoints for GameServer, MasterServer, and ControlServer to execute database tasks.

## Source Location
- `dbserver/` contains the DBServer source code and database task implementations.
- Common protocol registrations and shared utilities are in `common/` and `share/`.

## Configuration
**Config file**: `exe/conf/db_conf.xml`

Key fields:
- **DB**: primary world database connection (e.g., `world1`).
- **OnlineDB**: online DB connection (e.g., `db_Dragon_Nest_online`).
- **Listen**: inbound endpoints for `gslink`, `mslink`, and `ctrllink`.
- **AutoCreateDB**: enables automatic schema creation.
- **MaxRegisterNum**: caps registration volume.

## Runtime Flow
1. DBServer starts and reads `db_conf.xml`.
2. It initializes DB connection pools and listens for incoming service connections.
3. Database requests are queued and dispatched through DB task handlers.

## Development Guide
### Adding a new DB task
1. Add a new task class under `dbserver/db/task/` to encapsulate your query or update.
2. Register or route the task from the appropriate protocol handler in `dbserver/protocol/`.
3. Update SQL schema files if the task requires new tables or fields (`DataBaseInits/`).
4. Ensure your task correctly handles connection errors and transaction boundaries.

### Extending schema
- Update `DataBaseInits/` SQL scripts and any initialization logic in `INITIALIZE_DATABASE.bat`.
- If `AutoCreateDB` is enabled, confirm that new tables or fields are created as expected.

### Validation checklist
- Ensure DB thread counts in `db_conf.xml` match expected load.
- Confirm new queries use prepared statements or safe query builders when available.


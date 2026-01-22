# AudioServer — Development and Operations Guide

## Purpose
AudioServer provides a dedicated service for audio-related traffic. It receives audio payloads via GateServer and exposes protocol handlers for audio features.

## Source Location
- `audioserver/` contains AudioServer source code and protocol handlers.

## Configuration
**Config file**: `exe/conf/audio_conf.xml`

Key fields:
- **Listen**: `gatelink` (default port 10170).
- Optional CenterServer links may be configured but are commented out by default.

## Runtime Flow
1. AudioServer starts with its XML config and initializes its link handlers.
2. GateServer routes audio-related traffic to the AudioServer listener.

## Development Guide
### Adding audio features
- Implement protocol handlers under `audioserver/protocol/`.
- Add new messages to shared protocol definitions if required.

### Validation checklist
- Validate buffer sizes for audio payloads.
- Ensure GateServer routing configuration matches the AudioServer port.


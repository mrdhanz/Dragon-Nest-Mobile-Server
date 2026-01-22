# DDoS Mitigation Guide

This document outlines a layered, pragmatic DDoS mitigation strategy for the Dragon Nest Mobile server stack. The focus is on **network-layer controls**, **service-level throttling**, and **operational playbooks** that align with the existing server architecture (GateServer as the primary client ingress, with internal service links for Game/Master/Login/etc.).

> **Scope**: The guidance below assumes GateServer is the main public ingress point and that other services are reachable only on internal networks or VPNs.

---

## 1) Threat Model & Entry Points

### Primary public targets
- **GateServer clientlink** (TCP/UDP ports configured in `exe/conf/gate_conf.xml`).
- **LoginServer clientlink** (used by clients before GateServer handoff).
- **VersionServer clientlink** (client version check).

### High-risk attack types
- **L4 volumetric floods** (SYN/UDP floods) against client-facing ports.
- **L7 floods** (protocol spam, malformed packets, repeated login attempts).
- **Connection exhaustion** (socket/handshake overload).
- **Amplification via UDP** if exposed.

---

## 2) Network Edge Protections (Layer 3/4)

### 2.1 Use a DDoS-protected edge
- Place all client-facing endpoints behind a DDoS-protected provider (cloud edge, ISP scrubbing, or dedicated mitigation service).
- Only expose **GateServer**, **LoginServer**, and **VersionServer** to the public Internet.
- Keep internal links (MS/GS/DB/CTRL/etc.) on private networks and deny public access.

### 2.2 Rate limiting at the edge
Enforce per-IP limits at the firewall or load balancer:
- **SYN rate**: cap new TCP handshakes per IP.
- **Conn rate**: cap concurrent connections per IP.
- **UDP PPS**: cap UDP packets per second if UDP is enabled.

### 2.3 Geoblocking / ASN filtering (optional)
If your player base is region-limited, use geographic or ASN allowlists to drop irrelevant traffic early.

---

## 3) GateServer-Level Hardening (Layer 7)

### 3.1 Connection limits
Configure GateServer connection limits in `exe/conf/gate_conf.xml`:
- `ConnectLimit` values should be tuned for your expected player concurrency.
- Set a reasonable `maxConnection` to protect memory and file descriptor limits.

### 3.2 Protocol throttling
At the application level:
- Add per-connection request rate counters in GateServer session handling.
- Disconnect or throttle clients that exceed thresholds (e.g., too many RPCs per second).
- Consider per-IP rolling rate limits for new sessions.

### 3.3 Packet validation & early drops
Ensure GateServer drops malformed or oversized packets early:
- Enforce maximum payload size.
- Validate protocol header flags before dispatch.
- Drop unknown protocol types rather than attempting fallback behavior.

### 3.4 Enable/verify compression settings
If compression is enabled, ensure it is applied **only after** validating packet headers to avoid decompression bomb scenarios. Keep compression thresholds high enough to avoid overhead under attack.

---

## 4) LoginServer & VersionServer Hardening

### 4.1 LoginServer
- Limit repeated login attempts (per IP and per account).
- Add exponential backoff on token verification failures.
- Maintain a fail2ban-style denylist for abusive IPs.

### 4.2 VersionServer
- Cache version responses aggressively.
- Consider serving version manifests via CDN when possible.
- Apply strict rate limits; version checking should be lightweight and predictable.

---

## 5) Internal Service Isolation

### 5.1 Private network only
- DBServer, MasterServer, GameServer, ControlServer, AudioServer should **never** accept public traffic.
- Enforce firewall rules to allow only internal subnets/VPNs.

### 5.2 Service-to-service ACLs
- Restrict internal service ports to expected peers (e.g., GateServer → GameServer only).
- Use host-based firewalls or security groups to enforce these ACLs.

---

## 6) Observability & Detection

### 6.1 Baseline traffic
- Monitor baseline PPS, connections, and request rates per server.
- Track per-protocol usage rates (GateServer protocol stats) to identify spikes.

### 6.2 Log correlation
- Aggregate logs from Gate/Login/Version servers.
- Alert on spikes in connect failures, protocol decode errors, or sudden session churn.

---

## 7) Emergency Playbook

### 7.1 Immediate actions
1. Enable stricter rate limits at edge and firewall.
2. Temporarily reduce allowed new connections per IP.
3. If login path is overloaded, throttle login endpoints to prioritize existing sessions.

### 7.2 Recovery steps
- Roll back limits gradually after traffic stabilizes.
- Identify abusive IPs and add to denylist.
- Post-mortem review of traffic patterns and adjust thresholds.

---

## 8) Suggested Configuration Checklist
- [ ] Only Gate/Login/Version servers are public.
- [ ] Edge rate limits enforced (SYN/conn/PPS).
- [ ] GateServer connection caps set in `gate_conf.xml`.
- [ ] Application-level throttling for RPC/PTC spam.
- [ ] Fail2ban/denylist active for abusive IPs.
- [ ] Metrics dashboards and alerting enabled.

---

## 9) Notes for Multi-Line Deployments
For deployments with multiple GateServer/GameServer lines:
- Separate GateServer instances per line, each with its own connection limits.
- Load balance across gate lines with global rate limits.
- Ensure each line has independent failover and isolation.


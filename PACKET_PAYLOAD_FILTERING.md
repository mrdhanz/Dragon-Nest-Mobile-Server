# Packet Payload Filtering (Incoming Traffic)

This guide shows **host-level payload filtering** for incoming traffic using `iptables` and, optionally, `nftables`. It is intended to protect the public ingress services (GateServer/LoginServer/VersionServer) by dropping packets that match known-bad signatures (e.g., obvious protocol abuse, junk payloads, or attack strings).

> **Warning**: Payload filtering can cause false positives. Always test in staging and roll out gradually.

---

## 1) When to use payload filtering
- You are seeing repeated malformed or abusive packets that can be matched by **stable byte patterns**.
- You need a quick temporary mitigation while application-level checks are being deployed.
- You can tolerate some false positives, or you can tightly scope filters to specific ports.

---

## 2) iptables payload filtering

### 2.1 `-m string` (simple string match)
Use `-m string` to match a literal byte or ASCII pattern in incoming TCP payloads.

```bash
# Drop packets containing the ASCII string "badpayload" on GateServer port
iptables -A INPUT -p tcp --dport 10110 \
  -m string --algo bm --string "badpayload" \
  -j DROP
```

### 2.2 Hex string matching
You can match raw bytes by hex. Example (ASCII "GET /" as hex):

```bash
iptables -A INPUT -p tcp --dport 10110 \
  -m string --algo bm --hex-string "|47 45 54 20 2f|" \
  -j DROP
```

### 2.3 `u32` match for binary offsets
Use `-m u32` to match protocol-specific offsets (advanced). Example:

```bash
# Drop packets where bytes at offset 0x10 equal 0xdeadbeef
iptables -A INPUT -p tcp --dport 10110 \
  -m u32 --u32 "0x10=0xdeadbeef" \
  -j DROP
```

---

## 3) Gate/Login/Version scoped filters
Always scope payload filters to specific ports to avoid collateral damage:

```bash
# GateServer clientlink
iptables -A INPUT -p tcp --dport 10110 -m string --algo bm --string "badpayload" -j DROP

# LoginServer clientlink
iptables -A INPUT -p tcp --dport 25001 -m string --algo bm --string "badpayload" -j DROP

# VersionServer clientlink
iptables -A INPUT -p tcp --dport 24001 -m string --algo bm --string "badpayload" -j DROP
```

---

## 4) nftables alternative (recommended for new setups)
If you use `nftables`, you can match payload substrings similarly:

```bash
# Example table/chain (adjust interface and ports)

nft add table inet filter
nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }

# Allow established
nft add rule inet filter input ct state established,related accept

# Drop payload containing "badpayload" on GateServer port
nft add rule inet filter input tcp dport 10110 @th,64,96 == 0x6261647061796c6f6164 drop
```

---

## 5) Operational guidance
- **Start with logging**: log matched packets for a short period before dropping.
- **Keep rules narrow**: match only on specific ingress ports and known signatures.
- **Document patterns**: keep a mapping of signatures → incidents so you can remove stale filters.
- **Monitor false positives**: if players report disconnects, roll back the filter.

---

## 6) Example workflow
1. Identify abusive payload pattern in logs or packet captures.
2. Add a temporary `iptables -m string` rule scoped to the affected port.
3. Verify reduction in abusive traffic.
4. Adjust or remove the rule after the incident stabilizes.


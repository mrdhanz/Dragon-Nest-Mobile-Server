# DDoS Protection with iptables

This guide provides a concrete, **iptables-based** DDoS protection baseline tailored to this server stack. It focuses on protecting **public ingress services** (GateServer, LoginServer, VersionServer) while keeping internal service links private.

> **Important**: Adjust interface names, ports, and rate limits for your environment. Test changes on a staging server first to avoid locking yourself out.

---

## 1) Assumptions
- Public ingress services:
  - **GateServer clientlink** (default 10110)
  - **LoginServer clientlink** (default 25001)
  - **VersionServer clientlink** (default 24001)
- Internal services (Game/Master/DB/Control/Audio) **not** exposed publicly.
- You will replace the placeholders below with the ports actually configured in `exe/conf/*.xml`.

---

## 2) Variables (edit to match your config)
```bash
# Network interface (example: eth0)
IFACE="eth0"

# Public ports (adjust to your config)
GATE_TCP_PORT=10110
LOGIN_TCP_PORT=25001
VERSION_TCP_PORT=24001

# Optional UDP (only if you expose UDP)
GATE_UDP_PORT=10110

# Private subnets allowed to access internal services
PRIVATE_NETS=("10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16")
```

---

## 3) Base policy and kernel hardening
Apply strict default policies and enable common TCP protections.

```bash
# Default deny
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Drop invalid packets
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

# Allow established/related
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Basic kernel anti-spoof
sysctl -w net.ipv4.conf.all.rp_filter=1
sysctl -w net.ipv4.conf.default.rp_filter=1

# SYN flood protection
sysctl -w net.ipv4.tcp_syncookies=1
sysctl -w net.ipv4.tcp_synack_retries=3
```

---

## 4) Allow SSH (be careful)
```bash
# Replace 22 if you use a non-standard SSH port
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -j ACCEPT
```

---

## 5) Public ingress protection (Gate/Login/Version)

### 5.1 Per-IP connection limits
Limit concurrent connections per IP on public ports to mitigate connection exhaustion.

```bash
# GateServer
iptables -A INPUT -p tcp --dport $GATE_TCP_PORT -m connlimit --connlimit-above 50 --connlimit-mask 32 -j REJECT --reject-with tcp-reset

# LoginServer
iptables -A INPUT -p tcp --dport $LOGIN_TCP_PORT -m connlimit --connlimit-above 20 --connlimit-mask 32 -j REJECT --reject-with tcp-reset

# VersionServer
iptables -A INPUT -p tcp --dport $VERSION_TCP_PORT -m connlimit --connlimit-above 20 --connlimit-mask 32 -j REJECT --reject-with tcp-reset
```

### 5.2 New connection rate limits
Throttle new connections per IP using the `hashlimit` module.

```bash
# GateServer new connections (tune rate and burst)
iptables -A INPUT -p tcp --dport $GATE_TCP_PORT -m conntrack --ctstate NEW \
  -m hashlimit --hashlimit-name gate_conn --hashlimit 20/sec --hashlimit-burst 40 --hashlimit-mode srcip --hashlimit-htable-expire 10000 \
  -j ACCEPT

# LoginServer new connections
iptables -A INPUT -p tcp --dport $LOGIN_TCP_PORT -m conntrack --ctstate NEW \
  -m hashlimit --hashlimit-name login_conn --hashlimit 5/sec --hashlimit-burst 10 --hashlimit-mode srcip --hashlimit-htable-expire 10000 \
  -j ACCEPT

# VersionServer new connections
iptables -A INPUT -p tcp --dport $VERSION_TCP_PORT -m conntrack --ctstate NEW \
  -m hashlimit --hashlimit-name version_conn --hashlimit 5/sec --hashlimit-burst 10 --hashlimit-mode srcip --hashlimit-htable-expire 10000 \
  -j ACCEPT
```

### 5.3 Drop excess new connections
```bash
iptables -A INPUT -p tcp --dport $GATE_TCP_PORT -m conntrack --ctstate NEW -j DROP
iptables -A INPUT -p tcp --dport $LOGIN_TCP_PORT -m conntrack --ctstate NEW -j DROP
iptables -A INPUT -p tcp --dport $VERSION_TCP_PORT -m conntrack --ctstate NEW -j DROP
```

---

## 6) Optional UDP protection (if UDP is enabled)
If UDP is exposed, rate-limit aggressively:

```bash
iptables -A INPUT -p udp --dport $GATE_UDP_PORT -m hashlimit \
  --hashlimit-name gate_udp --hashlimit 50/sec --hashlimit-burst 100 --hashlimit-mode srcip --hashlimit-htable-expire 10000 \
  -j ACCEPT

iptables -A INPUT -p udp --dport $GATE_UDP_PORT -j DROP
```

---

## 7) Restrict internal services to private subnets only
Block public access to internal service ports and only allow private nets.

```bash
# Example internal ports (replace with actual config)
INTERNAL_PORTS=(10120 10130 10145 10150 10160 10165 10170 10180)

for net in "${PRIVATE_NETS[@]}"; do
  for port in "${INTERNAL_PORTS[@]}"; do
    iptables -A INPUT -p tcp -s "$net" --dport "$port" -j ACCEPT
  done
  for port in "${INTERNAL_PORTS[@]}"; do
    iptables -A INPUT -p udp -s "$net" --dport "$port" -j ACCEPT
  done
  done

# Drop all other access to internal ports
for port in "${INTERNAL_PORTS[@]}"; do
  iptables -A INPUT -p tcp --dport "$port" -j DROP
  iptables -A INPUT -p udp --dport "$port" -j DROP
  done
```

---

## 8) Logging suspicious traffic (optional)
Log limited rate of dropped packets for visibility.

```bash
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables-drop: " --log-level 4
```

---

## 9) ASN filtering (Telkomsel, Indosat, XL Axiata, etc.)
`iptables` cannot filter by ASN directly. The typical pattern is:\n
1. **Resolve ASN → IP prefixes** using `bgpq4` (or your provider’s published prefix list).\n
2. **Apply ipset rules** that allow/deny those prefixes at the firewall.\n
Below is a concrete example using `ipset` and `bgpq4`:\n

### 9.1 Create ipset lists
```bash
ipset create asn_allow hash:net
ipset create asn_block hash:net
```

### 9.2 Build prefix lists from ASN
Replace ASNs with the correct official ASNs for each provider.\n
```bash
# Example (replace with official ASNs):
# Telkomsel: AS23693 (example only; verify)
# Indosat:   AS4761 (example only; verify)
# XL Axiata: AS24203 (example only; verify)

bgpq4 -4 -l TELKOMSEL AS23693 | sed 's/\\t/ /g' > /tmp/telkomsel_prefixes.txt
bgpq4 -4 -l INDOSAT   AS4761  | sed 's/\\t/ /g' > /tmp/indosat_prefixes.txt
bgpq4 -4 -l XLAXIATA  AS24203 | sed 's/\\t/ /g' > /tmp/xlaxiata_prefixes.txt
```

### 9.3 Populate the ipset lists
```bash
for p in $(cat /tmp/telkomsel_prefixes.txt /tmp/indosat_prefixes.txt /tmp/xlaxiata_prefixes.txt); do
  ipset add asn_allow "$p"
done
```

### 9.4 Apply the ipset allowlist
Use this if you want to **only allow** traffic from official providers.\n
```bash
iptables -I INPUT -m set --match-set asn_allow src -j ACCEPT
iptables -A INPUT -j DROP
```

### 9.5 Apply the ipset blocklist (optional)
If you want to **block specific ASNs** instead of allowlisting:\n
```bash
iptables -I INPUT -m set --match-set asn_block src -j DROP
```

### 9.6 Automate updates
ASN prefixes change. Update `ipset` daily with cron:\n
```bash
0 4 * * * /usr/local/bin/update_asn_ipset.sh
```

**Note**: Always verify the correct official ASN numbers from the provider’s documentation.\n

---

## 10) Save rules
Persist iptables rules depending on your distro:

```bash
# Debian/Ubuntu
apt-get install -y iptables-persistent
netfilter-persistent save

# RHEL/CentOS
service iptables save
```

---

## 11) Operational checklist
- [ ] Confirm Gate/Login/Version ports match `exe/conf/*.xml`.
- [ ] Verify internal service ports are private-only.
- [ ] Tune rate limits to match observed traffic baselines.
- [ ] Monitor for false positives and adjust limits.
- [ ] Keep emergency access (SSH) open.

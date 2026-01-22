# Official ASN Lists (Global Sources)

This repository should not hardcode a "complete list of all ASNs in the world" because ASNs change frequently. Instead, use the **official Regional Internet Registry (RIR)** datasets, which are the authoritative sources for allocated and assigned ASNs.

Below are the official sources and a repeatable method to build a current ASN list.

---

## 1) Official RIR Sources (Authoritative)
Each RIR publishes a "delegated" dataset containing the current ASN allocations for its region:
- **AFRINIC** (Africa)
- **APNIC** (Asia-Pacific)
- **ARIN** (North America)
- **LACNIC** (Latin America & Caribbean)
- **RIPE NCC** (Europe, Middle East, parts of Central Asia)

These datasets are considered the official sources for ASN allocations.

---

## 2) How to Build a Global ASN List (Repeatable)
The standard approach is to download each RIR’s delegated stats file and extract ASN entries.

### Example script (build `asns.txt`)
```bash
#!/usr/bin/env bash
set -euo pipefail

RIRS=(
  "https://ftp.afrinic.net/pub/stats/afrinic/delegated-afrinic-latest"
  "https://ftp.apnic.net/pub/stats/apnic/delegated-apnic-latest"
  "https://ftp.arin.net/pub/stats/arin/delegated-arin-extended-latest"
  "https://ftp.lacnic.net/pub/stats/lacnic/delegated-lacnic-latest"
  "https://ftp.ripe.net/pub/stats/ripencc/delegated-ripencc-latest"
)

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

for url in "${RIRS[@]}"; do
  curl -fsSL "$url" -o "$TMPDIR/$(basename "$url")"
done

# Extract ASN allocations into a flat list
# Columns: registry|cc|type|start|value|date|status
# For ASN: start = first ASN, value = count
# Expand ranges to individual ASNs
awk -F'|' '$3=="asn" && $7 ~ /allocated|assigned/ {print $4, $5}' "$TMPDIR"/* \
  | while read -r start count; do
      end=$((start + count - 1))
      seq "$start" "$end"
    done \
  | sort -n \
  > asns.txt

wc -l asns.txt
```

This yields an **up-to-date global ASN list** derived from the official RIR datasets.

---

## 3) Optional: Keep it Updated
Add a cron job to refresh daily:

```bash
0 3 * * * /usr/local/bin/update_asn_list.sh
```

---

## 4) Note on “Official ASN” Terminology
There is no single global registry file that is more official than the **combined RIR delegated datasets**. The RIRs are the authoritative sources for ASN allocations in their respective regions.


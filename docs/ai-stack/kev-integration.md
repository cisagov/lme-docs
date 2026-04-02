---
title: "KEV Integration"
sidebar_position: 5
description: "How LME integrates CISA's Known Exploited Vulnerabilities catalog for real-time vulnerability enrichment."
---

# KEV Integration

LME automatically integrates with CISA's **Known Exploited Vulnerabilities (KEV)** catalog. When Wazuh detects a vulnerability on one of your endpoints, LME checks it against the KEV catalog. If the vulnerability is a known exploited vulnerability, LME generates a high-priority alert so you know to act immediately.

## What is the KEV Catalog?

The [CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) is a list of vulnerabilities that are **actively being exploited in the wild**. CISA maintains it and updates it regularly. Each entry includes:

- The CVE identifier (e.g., CVE-2024-1234)
- The affected vendor and product
- A description of the vulnerability
- Whether it is used in ransomware campaigns
- A **remediation due date** — the date by which CISA says federal agencies must patch

## How It Works

![KEV Enrichment Pipeline](/img/ai-stack/kev-pipeline.svg)

1. **Daily sync:** A systemd timer runs `kev_sync.py` to download the latest KEV catalog from CISA and save it locally
2. **Wazuh detects a vulnerability:** When Wazuh's vulnerability detector finds a CVE on an endpoint, it fires an alert
3. **KEV enrichment:** The `custom-kev` integration script checks the CVE against the local catalog
4. **Enriched alert:** If the CVE is in the KEV catalog, a **Level 15** (maximum severity) alert is generated with full KEV metadata
5. **Dashboard visibility:** The enriched alert appears in Elasticsearch and the LME Dashboard

## What You See

When a KEV match is found, the enriched alert includes:

- **Alert Level 15** — the highest Wazuh alert level, ensuring it gets attention
- **Rule ID 99901** — LME's custom rule for KEV matches
- **Vulnerability name** and description from the CISA catalog
- **Vendor and product** affected
- **Ransomware usage** — whether this vulnerability is known to be used in ransomware attacks
- **CISA due date** — the recommended remediation deadline
- **Overdue flag** — whether the remediation deadline has already passed

## Viewing KEV Status in the Dashboard

1. Open the LME Dashboard at `https://<your-lme-server-ip>:8502`
2. Navigate to the **KEV Tracker** view
3. You will see:
   - **Catalog stats** — total number of KEVs in the local catalog
   - **Sync history** — when the catalog was last updated
   - **Manual sync** button — trigger an immediate catalog update

## Managing the KEV Sync

### Checking Sync Status

The KEV catalog syncs automatically via a systemd timer. To check when it last ran:

```bash
sudo systemctl status lme-kev-sync.timer
```

To see the last sync result:

```bash
sudo systemctl status lme-kev-sync.service
```

### Manually Triggering a Sync

#### Via the Dashboard

Click the **Pull** button in the KEV Tracker view.

#### Via the Command Line

```bash
sudo systemctl start lme-kev-sync.service
```

Or run the script directly:

```bash
sudo python3 /opt/lme/scripts/kev_sync.py
```

### Changing the Sync Schedule

The sync timer is a systemd timer unit. To change the schedule:

1. Edit the timer:
   ```bash
   sudo systemctl edit lme-kev-sync.timer
   ```

2. Add an override section. For example, to sync every 6 hours:
   ```ini
   [Timer]
   OnCalendar=
   OnCalendar=*-*-* 00/6:00:00
   ```

3. Reload and restart:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart lme-kev-sync.timer
   ```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| KEV catalog | `/opt/lme/config/wazuh_cluster/kev_catalog.json` | Local copy of the CISA KEV feed |
| Sync history | `/opt/lme/config/kev_history.json` | Log of sync events (last 100 entries) |
| Sync script | `/opt/lme/scripts/kev_sync.py` | Downloads and processes the KEV feed |
| Wazuh integration | Inside `lme-wazuh-manager` container at `/var/ossec/integrations/custom-kev` | Enriches Wazuh alerts with KEV data |
| Catalog in Wazuh | Inside `lme-wazuh-manager` container at the configured catalog path | Read-only copy used by the integration |
| Systemd timer | `/etc/systemd/system/lme-kev-sync.timer` | Controls the sync schedule |
| Systemd service | `/etc/systemd/system/lme-kev-sync.service` | Runs the sync script |

## How the Wazuh Integration Works

The `custom-kev` script is a Wazuh **integration**. Wazuh calls it automatically whenever a vulnerability-detector alert fires. Here is what happens:

1. Wazuh passes the alert file path as an argument to `custom-kev`
2. The script reads the alert JSON
3. It extracts the CVE ID from `data.vulnerability.cve` (or by searching the alert text)
4. It loads the KEV catalog from disk
5. If the CVE is found:
   - Builds a new Level 15 alert with all KEV metadata
   - Checks if the CISA due date has passed (marks it as "overdue")
   - Sends the enriched alert to the Wazuh alerts queue via Unix socket
6. If the CVE is not found, the script exits silently (no extra alert)

## Configuring KEV Settings

### Via the Dashboard

1. Go to **Settings** > **KEV Configuration**
2. You will see two cards:

**Catalog Sync card:**
- Shows the **last pull** timestamp and a freshness badge:
  - **"Current"** (green) — synced within the last 24 hours
  - **"Stale"** (yellow) — last sync was more than 24 hours ago
  - **"Never pulled"** — no sync has been performed yet
- **"Pull now"** button — click to download the latest KEV catalog immediately. Shows "Pulling..." with a spinner, then a success/error message.
- **Auto-pull toggle** — enable to automatically sync the catalog on a schedule
- **Pull frequency** dropdown (appears when auto-pull is on): Every 6 hours, Every 12 hours, Daily, or Weekly

**Alert Settings card:**
- **"Alert on new KEV match"** toggle — when on, a Level 15 Wazuh alert fires whenever a host CVE matches a KEV entry
- **"Alert on overdue remediation"** toggle — when on, alerts fire when a matched KEV passes its CISA remediation due date
- **"Ransomware-linked KEVs only"** toggle — when on (shown in orange), only alerts for CVEs confirmed to be used in ransomware campaigns

3. Adjust toggles and settings as needed
4. Click **"Save settings"** to persist your changes

### KEV Configuration Variables

The KEV Ansible role uses these variables (set in `ansible/roles/kev/defaults/main.yml`):

| Variable | Default | Description |
|----------|---------|-------------|
| `kev_scripts_dir` | `/opt/lme/scripts` | Where the sync script is installed |
| `kev_config_dir` | `/opt/lme/config/wazuh_cluster` | Where the catalog is stored |
| `kev_wazuh_container` | `lme-wazuh-manager` | Name of the Wazuh container |
| `kev_catalog_path` | `<kev_config_dir>/kev_catalog.json` | Path to the local catalog |
| `kev_history_path` | `/opt/lme/config/kev_history.json` | Path to the sync history log |
| `kev_vuln_rule_group` | `vulnerability-detector` | Wazuh rule group that triggers KEV lookup |

## Troubleshooting

### KEV sync fails

1. Check the sync service logs:
   ```bash
   sudo journalctl -u lme-kev-sync.service -n 30
   ```

2. Common causes:
   - **No internet access** — the server cannot reach `www.cisa.gov`
   - **DNS resolution failure** — check DNS configuration
   - **Firewall blocking HTTPS** — port 443 outbound must be open

3. Test manually:
   ```bash
   curl -sI https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
   ```

### KEV alerts not appearing

1. Verify the catalog is populated:
   ```bash
   python3 -c "import json; d=json.load(open('/opt/lme/config/wazuh_cluster/kev_catalog.json')); print(f'{len(d)} CVEs in catalog')"
   ```

2. Verify the integration is configured in Wazuh:
   ```bash
   sudo podman exec lme-wazuh-manager cat /var/ossec/etc/ossec.conf | grep -A5 custom-kev
   ```

3. Verify the integration script exists in the container:
   ```bash
   sudo podman exec lme-wazuh-manager ls -la /var/ossec/integrations/custom-kev
   ```

4. Check Wazuh logs for integration errors:
   ```bash
   sudo podman exec lme-wazuh-manager cat /var/ossec/logs/ossec.log | grep -i kev | tail -20
   ```

### Catalog shows 0 CVEs

The sync script may not have run yet. Trigger it manually:

```bash
sudo systemctl start lme-kev-sync.service
```

Then verify:

```bash
cat /opt/lme/config/kev_history.json | python3 -m json.tool | tail -10
```

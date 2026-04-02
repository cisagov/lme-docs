---
title: "Ludus Range Experiment"
sidebar_position: 2
description: "Quickstart guide for deploying the LME role validation experiment on a Ludus v2 cyber range — 4 VMs testing all 5 ludus_* Ansible roles."
---

# LME Role Validation Experiment

Deploy and validate all 5 Ludus-compatible Ansible roles for LME and Caldera on a Ludus v2 cyber range. This confirms end-to-end telemetry: endpoints shipping logs to Elasticsearch via Elastic Agent and Wazuh, with Caldera providing adversary emulation.

## Architecture

```
                    VLAN 10 — 10.1.10.0/24
 ┌────────────────────────────────────────────────┐
 │                                                │
 │  lme-server (.10)        caldera-srv (.20)     │
 │  ├─ Elasticsearch 8.x    ├─ MITRE Caldera 5.3  │
 │  ├─ Kibana               ├─ Automation Scripts  │
 │  ├─ Fleet Server         └──────────┐          │
 │  └─ Wazuh Manager                   │          │
 │       │                             │          │
 │       ▼ agents enroll               ▼ sandcat  │
 │  WIN11-EP (.30)          ubuntu-ep (.40)       │
 │  ├─ Elastic Agent        ├─ Elastic Agent      │
 │  ├─ Wazuh Agent          ├─ Wazuh Agent        │
 │  ├─ Sysmon               └─ auditd rules       │
 │  └─ Caldera Agent                              │
 └────────────────────────────────────────────────┘
```

## VM Specifications

| VM | Template | RAM | CPUs | IP | Roles |
|----|----------|-----|------|----|-------|
| lme-server | ubuntu-24.04-x64-server | 32 GB | 4 | 10.1.10.10 | `ludus_lme_server` |
| caldera-srv | ubuntu-24.04-x64-server | 8 GB | 2 | 10.1.10.20 | `ludus_caldera_server`, `ludus_caldera_scripts` |
| WIN11-EP | win11-22h2-x64-enterprise | 8 GB | 2 | 10.1.10.30 | `ludus_lme_agents`, `ludus_caldera_agent` |
| ubuntu-ep | ubuntu-24.04-x64-desktop | 4 GB | 2 | 10.1.10.40 | `ludus_lme_agents` |

**Total resource requirement:** 52 GB RAM, 10 CPUs

## Roles Under Test

| # | Role | Deployed To | What It Does |
|---|------|-------------|--------------|
| 1 | `ludus_lme_server` | lme-server | Installs LME stack (ELK + Wazuh + Fleet) via `install.sh` |
| 2 | `ludus_lme_agents` | WIN11-EP, ubuntu-ep | Installs Elastic Agent + Wazuh Agent on endpoints |
| 3 | `ludus_caldera_server` | caldera-srv | Installs MITRE Caldera from source with systemd service |
| 4 | `ludus_caldera_agent` | WIN11-EP | Deploys Caldera sandcat agent on Windows |
| 5 | `ludus_caldera_scripts` | caldera-srv | Deploys automation scripts for Caldera operations |

## Prerequisites

- Ludus v2 server (tested with v2.0.15)
- API key for your Ludus user
- Templates built: `ubuntu-24.04-x64-server-template`, `ubuntu-24.04-x64-desktop-template`, `win11-22h2-x64-enterprise-template`
- WireGuard tunnel to Ludus range network

## Quickstart

### Step 0: Set Environment

```bash
export LUDUS_API_KEY="<your-user>.<your-key>"
export LUDUS_URL="https://<ludus-server-ip>:8080"
```

### Step 1: Upload Roles to Ludus

```bash
# From the LME repo root, for each role:
for role in ludus_lme_server ludus_lme_agents ludus_caldera_server ludus_caldera_agent ludus_caldera_scripts; do
  tar -czf "/tmp/${role}.tar.gz" -C ansible/roles "$role"
  curl -sk -X PUT -H "X-API-KEY: $LUDUS_API_KEY" \
    -F "file=@/tmp/${role}.tar.gz" \
    "$LUDUS_URL/api/v2/ansible/role/fromtar"
done
```

### Step 2: Set Range Configuration

```bash
curl -sk -X PUT -H "X-API-KEY: $LUDUS_API_KEY" \
  -H "Content-Type: application/x-yaml" \
  --data-binary @detection-engineering/ludus-range-config.yml \
  "$LUDUS_URL/api/v2/range/config"
```

### Step 3: Deploy Range

```bash
curl -sk -X POST -H "X-API-KEY: $LUDUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' "$LUDUS_URL/api/v2/range/deploy"
```

### Step 4: Monitor Deployment

```bash
# Check status
curl -sk -H "X-API-KEY: $LUDUS_API_KEY" "$LUDUS_URL/api/v2/range" | python3 -m json.tool

# Tail logs
curl -sk -H "X-API-KEY: $LUDUS_API_KEY" "$LUDUS_URL/api/v2/range/logs"
```

### Step 5: Verify Services

```bash
# Elasticsearch health (via WireGuard)
curl -sk -u elastic:<password> https://10.1.10.10:9200/_cluster/health

# Kibana (open in browser)
# https://10.1.10.10:5601

# Fleet enrolled agents
curl -sk -u elastic:<password> https://10.1.10.10:5601/api/fleet/agents

# Caldera UI
# http://10.1.10.20:8888
```

## Verification Criteria

| # | Criterion | How to Check |
|---|-----------|-------------|
| P0-001 | Elasticsearch reachable | `curl -sk https://10.1.10.10:9200` returns cluster info |
| P0-002 | Elastic Agent enrolled (WIN11-EP) | Fleet UI shows agent, status "Healthy" |
| P0-003 | Elastic Agent enrolled (ubuntu-ep) | Fleet UI shows agent, status "Healthy" |
| P0-004 | Wazuh Agent active (WIN11-EP) | Wazuh manager `agent_control -l` shows Active |
| P0-005 | Wazuh Agent active (ubuntu-ep) | Wazuh manager `agent_control -l` shows Active |
| P1-001 | Caldera agent checking in | Caldera UI shows WIN11-EP agent |
| P1-002 | Caldera scripts functional | `run_config.py` lists abilities |
| P2-001 | Sysmon events in Kibana | Filter `event.module: sysmon` shows Windows events |
| P2-002 | auditd events in Kibana | Filter `event.module: auditd` shows Linux events |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| LME install times out | Check `ludus_lme_server_memory_limit`; ensure 32GB RAM allocated |
| Elastic Agent won't enroll | Verify Fleet server URL resolves; check enrollment token |
| Wazuh agent not connecting | Confirm Wazuh manager IP matches `ludus_lme_agents_server_ip` |
| Caldera agent not checking in | Verify Caldera server IP and port 8888 reachable from Windows VM |
| Desktop template not built | `POST /api/v2/templates` with `{"names":["ubuntu-24.04-x64-desktop"]}` |

For Podman-specific issues (commands hanging, SQLite lock deadlocks), see [Podman Troubleshooting](/docs/reference/troubleshooting#podman-commands-hang-sqlite-lock-deadlock).

---

## Further Reading

- [Detection Engineering Overview](./overview) — goals, design, and implementation stages
- [Range Configuration Reference](./range-config) — detailed VM inventory and Ludus config
- [LME Documentation](https://github.com/cisagov/LME)
- [MITRE Caldera](https://caldera.mitre.org/)
- [Ludus Documentation](https://docs.ludus.cloud)

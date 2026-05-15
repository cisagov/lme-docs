---
title: "Range Configuration Reference"
sidebar_position: 3
description: "Ludus range configuration reference for the LME detection engineering experiment: VM inventory, role variables, network topology, and API commands."
---

# Range Configuration Reference

Reference for the Ludus cyber range configuration used in the LME detection engineering experiment. This page documents the VM inventory, role variables, network topology, and common Ludus API commands.

## Network Topology

All VMs on VLAN 10 (`10.1.10.0/24`). Router at `10.1.10.254`. No inter-VLAN rules needed for Stage 1.

## VM Inventory

| VM | IP | Template | RAM | CPUs | Roles |
|----|----|----------|-----|------|-------|
| lme-server | 10.1.10.10 | ubuntu-24.04-x64-server | 32 GB | 4 | `ludus_lme_server` |
| caldera-srv | 10.1.10.20 | ubuntu-24.04-x64-server | 8 GB | 2 | `ludus_caldera_server`, `ludus_caldera_scripts` |
| WIN11-EP | 10.1.10.30 | win11-22h2-x64-enterprise | 8 GB | 2 | `ludus_lme_agents`, `ludus_caldera_agent` |
| ubuntu-ep | 10.1.10.40 | ubuntu-24.04-x64-desktop | 4 GB | 2 | `ludus_lme_agents` |

## Range Configuration (YAML)

The configuration below is stored in `detection-engineering/ludus-range-config.yml` in the LME repository. Key points:

- **Role dependencies** — `ludus_lme_agents` depends on `ludus_lme_server` completing first; `ludus_caldera_agent` depends on `ludus_caldera_server`; `ludus_caldera_scripts` depends on `ludus_caldera_server`
- **Templated IPs** — Uses `range_second_octet` for portability across Ludus users
- **Placeholder secrets** — `CHANGEME` values for `elastic_password` and `enrollment_token` must be replaced with actual values after LME server deploys

```yaml
ludus:
  # LME Server (Elasticsearch, Kibana, Fleet, Wazuh Manager)
  - vm_name: "{{ range_id }}-lme-server"
    hostname: "lme-server"
    template: ubuntu-24.04-x64-server-template
    vlan: 10
    ip_last_octet: 10
    ram_gb: 32
    cpus: 4
    linux: true
    roles:
      - ludus_lme_server
    role_vars:
      ludus_lme_server_version: "2.2.0"

  # Caldera Server (Adversary Emulation + Automation Scripts)
  - vm_name: "{{ range_id }}-caldera-server"
    hostname: "caldera-srv"
    template: ubuntu-24.04-x64-server-template
    vlan: 10
    ip_last_octet: 20
    ram_gb: 8
    cpus: 2
    linux: true
    roles:
      - ludus_caldera_server
      - name: ludus_caldera_scripts
        depends_on:
          - vm_name: "{{ range_id }}-caldera-server"
            role: ludus_caldera_server

  # Windows 11 Endpoint (Elastic Agent + Wazuh + Sysmon + Caldera)
  - vm_name: "{{ range_id }}-win11-endpoint"
    hostname: "WIN11-EP"
    template: win11-22h2-x64-enterprise-template
    vlan: 10
    ip_last_octet: 30
    ram_gb: 8
    cpus: 2
    windows:
      sysprep: false
    roles:
      - name: ludus_lme_agents
        depends_on:
          - vm_name: "{{ range_id }}-lme-server"
            role: ludus_lme_server
      - name: ludus_caldera_agent
        depends_on:
          - vm_name: "{{ range_id }}-caldera-server"
            role: ludus_caldera_server
    role_vars:
      ludus_lme_agents_server_ip: "10.{{ range_second_octet }}.10.10"
      ludus_lme_agents_elastic_password: "CHANGEME"
      ludus_lme_agents_elastic_version: "8.18.8"
      ludus_lme_agents_enrollment_token: "CHANGEME"
      ludus_lme_agents_wazuh_version: "4.9.1"
      ludus_lme_agents_wazuh_manager_ip: "10.{{ range_second_octet }}.10.10"
      ludus_caldera_agent_server_ip: "10.{{ range_second_octet }}.10.20"

  # Ubuntu Endpoint (Elastic Agent + Wazuh + auditd)
  - vm_name: "{{ range_id }}-ubuntu-endpoint"
    hostname: "ubuntu-ep"
    template: ubuntu-24.04-x64-server-template
    vlan: 10
    ip_last_octet: 40
    ram_gb: 4
    cpus: 2
    linux: true
    roles:
      - name: ludus_lme_agents
        depends_on:
          - vm_name: "{{ range_id }}-lme-server"
            role: ludus_lme_server
    role_vars:
      ludus_lme_agents_server_ip: "10.{{ range_second_octet }}.10.10"
      ludus_lme_agents_elastic_password: "CHANGEME"
      ludus_lme_agents_elastic_version: "8.18.8"
      ludus_lme_agents_enrollment_token: "CHANGEME"
      ludus_lme_agents_wazuh_version: "4.9.1"
      ludus_lme_agents_wazuh_manager_ip: "10.{{ range_second_octet }}.10.10"
```

## Ludus API Quick Reference

```bash
export LUDUS_API_KEY="<your-user>.<your-key>"
export LUDUS_URL="https://<ludus-server-ip>:8080"

# Check range status
curl -sk -H "X-API-KEY: $LUDUS_API_KEY" "$LUDUS_URL/api/v2/range"

# View deployment logs
curl -sk -H "X-API-KEY: $LUDUS_API_KEY" "$LUDUS_URL/api/v2/range/logs"

# Deploy full range (VMs + roles)
curl -sk -X POST -H "X-API-KEY: $LUDUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' "$LUDUS_URL/api/v2/range/deploy"

# Deploy roles only (skip VM creation)
curl -sk -X POST -H "X-API-KEY: $LUDUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"onlyRoles":true}' "$LUDUS_URL/api/v2/range/deploy"

# Check template build status
curl -sk -H "X-API-KEY: $LUDUS_API_KEY" "$LUDUS_URL/api/v2/templates"
```

## Verification Checklist

1. Elasticsearch reachable at `https://10.1.10.10:9200`
2. Kibana reachable at `https://10.1.10.10:5601`
3. Fleet shows 2 enrolled agents (WIN11-EP + ubuntu-ep)
4. Wazuh manager shows 2 registered agents
5. Caldera UI at `http://10.1.10.20:8888` shows 1 agent (WIN11-EP)
6. Caldera scripts can list abilities via API

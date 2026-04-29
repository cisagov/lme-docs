---
title: "LME Security Dashboard"
sidebar_position: 2
description: "Complete guide to the LME Security Dashboard — view alerts, analyze with AI, browse vulnerabilities, and configure settings."
---

# LME Security Dashboard

The LME Security Dashboard is a web application that gives you a single place to view security alerts, analyze them with AI, track vulnerabilities, manage detection rules, and configure your LME AI stack.

## Accessing the Dashboard

Open your browser and go to:

```
https://<your-lme-server-ip>:8502
```

You will see a certificate warning because LME uses self-signed TLS certificates. Click through the warning to proceed.

## Dashboard Layout

### Header Bar

The header bar is always visible at the top and shows:

- **Health pills** — real-time status of:
  - **ES** — Elasticsearch cluster health (green/yellow/red)
  - **LLM** — LiteLLM proxy status (ok/error)
  - **pgvector** — vector database status (ok/error)
- **Active model pill** — shows the name of the AI model currently in use
  - Purple background = local model (running on your server)
  - Blue background = cloud model (uses an API key)
  - Click the model pill to jump to model settings
- **Refresh button** — reloads alerts and health status

### Navigation Bar

Four main tabs below the header:

| Tab | What it Contains |
|-----|-----------------|
| **Alerts** | Security alerts from Kibana, Wazuh, Sysmon, and Windows Defender |
| **Vulnerabilities** | Per-host vulnerability breakdown with KEV enrichment |
| **Detection Engineering** | ElastAlert2 rules, Kibana rules, Sigma conversion, KEV stats |
| **Settings** | AI model management, KEV configuration, document ingestion, general settings |

---

## Alerts View

The Alerts view has a **left panel** showing alert cards and a **right panel** with an AI chat assistant.

### Filtering Alerts

Above the alert list, you have several filters:

1. **Search bar** — type to filter alerts by any field (name, host, user, IP, etc.). Results update automatically as you type.
2. **Time range** dropdown — choose from: Last 15 min, 1 hour, 4 hours, 12 hours, 24 hours (default), 3 days, 7 days, 30 days, or 90 days.
3. **Machine filter** dropdown — appears when alerts come from multiple hosts. Select a specific host or "All machines".

### Alert Source Tabs

Four tabs, each showing a count badge:

- **Kibana Alerts** — alerts from Elasticsearch detection rules. Has a "Min severity" filter (Critical, High, Medium+, Low+).
- **Wazuh Alerts** — alerts from the Wazuh HIDS. Has a "Min level" filter (5 through 12).
- **Sysmon** — Windows Sysmon events. Automatically filtered to high-value event IDs (8, 10, 25, 6, 9, 15, 17-21, 255).
- **Windows Defender** — antivirus/antimalware alerts. Has a "Min severity" filter.

### Reading Alert Cards

Each alert card shows:

- **Severity badge** — color-coded (red = critical, orange = high, yellow = medium, green = low)
- **Rule name or description**
- **Timestamp** — when the alert fired
- **Host/agent name** — which machine triggered it
- **User** — which user account was involved (if applicable)
- **Source/destination IP** — network connection details (if applicable)
- **Command line** — the process that triggered the alert (if applicable)

### Analyzing an Alert with AI

This is how you get the AI to explain what an alert means and what to do about it:

1. Find the alert you want to investigate
2. Click the **"Analyze"** button on the alert card
3. An "Analyzing..." indicator appears below the card
4. The AI reads the full alert JSON and returns three sections:
   - **What happened** — plain-English explanation
   - **Risk** — how serious this is
   - **Action** — what you should do next
5. The analysis appears in a colored box below the alert

### Viewing Alert Details

Click the **"Details"** button on any alert card to expand it and see the full raw JSON data. Click **"Hide"** to collapse it.

### Infinite Scroll

As you scroll down the alert list, more alerts load automatically. You will see "Loading more..." at the bottom, and "All alerts loaded" when you reach the end.

### AI Chat Sidebar

The right side of the Alerts view has a persistent AI chat panel. See [Using the AI Chat](./ai-chat.md) for full details. Key points:

- **RAG toggle** — the "Docs ON/OFF" button switches between RAG mode (answers grounded in LME documentation) and plain chat. RAG is on by default.
- **Clear button** — resets the conversation
- **Send** — press Enter to send, Shift+Enter for a new line

---

## Vulnerabilities View

Click the **Vulnerabilities** tab to see a risk-ranked view of all your monitored hosts and their known vulnerabilities.

### Overview

The top shows:
- Total number of monitored machines
- Total vulnerability count across all machines
- A **Refresh** button

### Host Cards

Each Wazuh agent is shown as a card ranked by risk score (most vulnerable first). The top 3 are highlighted with red, orange, and gray rank badges. Each card shows:

- Agent name, ID, and OS
- Severity breakdown pills (Critical, High, Medium, Low counts)
- Total CVE count and maximum CVSS score
- A proportional color bar showing severity distribution

### Drilling into a Host

1. Click anywhere on a host card to expand it
2. A **severity filter** appears: All, Critical, High, Medium, Low
3. A table of CVEs appears with columns:
   - **CVE** — linked to the NVD entry (opens in new tab)
   - **Severity** — color-coded badge
   - **CVSS score**
   - **Package** — affected software name and version
   - **Description**
   - **Detected date**
4. CVEs that appear in the **CISA KEV catalog** show a red "KEV" badge, plus the CISA due date and a "Ransomware" label if applicable
5. Scroll down to load more CVEs (50 at a time)

---

## Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| Dashboard | 8502 | HTTPS |
| Log Analyzer | 8501 | HTTPS |
| Elasticsearch | 9200 | HTTPS |
| Kibana | 5601 | HTTPS |
| LiteLLM Proxy | 4000 | HTTPS |
| llama.cpp | 8080 | HTTPS (internal) |
| Embeddings | 8081 | HTTPS (internal) |
| pgvector | 5432 | TCP |

## Troubleshooting

### Dashboard shows "ES: red" or "ES: unreachable"

The dashboard cannot connect to Elasticsearch.

1. Check Elasticsearch is running: `sudo systemctl status lme-elasticsearch`
2. Test connectivity: `curl -sk https://localhost:9200`
3. Restart if needed: `sudo systemctl restart lme-elasticsearch`

### Dashboard shows "LLM: unreachable"

The LiteLLM proxy is not responding.

1. Check the service: `sudo systemctl status lme-litellm`
2. Check llama.cpp (LiteLLM depends on it): `sudo systemctl status lme-llama-cpp`
3. Restart the AI stack:
   ```bash
   sudo systemctl restart lme-llama-cpp
   sleep 5
   sudo systemctl restart lme-litellm
   ```

### Dashboard shows "pgvector: unreachable"

The vector database is not responding.

1. Check the service: `sudo systemctl status lme-pgvector`
2. Restart: `sudo systemctl restart lme-pgvector`
3. If RAG was working before, re-ingest docs from Settings > Documents

### AI responses are slow or low quality

The default 1.2B model is small and fast but has limited reasoning ability. Options:
- Download a larger local model (see [Managing Models](./managing-models.md))
- Connect a cloud model for better analysis quality

### "Certificate error" when accessing the dashboard

LME uses self-signed TLS certificates. This is expected.

- **Chrome:** Click "Advanced" then "Proceed to site"
- **Firefox:** Click "Advanced" then "Accept the Risk and Continue"
- **Edge:** Click "Continue to site"

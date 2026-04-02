---
title: "Log Analyzer"
sidebar_position: 6
description: "How to use the Streamlit-based Log Analyzer for browsing and AI-analyzing Elasticsearch security alerts."
---

# Log Analyzer

The Log Analyzer is a lightweight web application for browsing Elasticsearch security alerts and analyzing them with AI. Built with [Streamlit](https://streamlit.io/), it provides a simpler alternative to the full LME Dashboard for users who just want to quickly scan alerts and get AI insights.

## Accessing the Log Analyzer

Open your browser and go to:

```
https://<your-lme-server-ip>:8501
```

You will see a certificate warning (self-signed TLS) — click through to proceed.

## Interface Overview

The Log Analyzer has two main areas:

### Sidebar: AI Chat Assistant

The left sidebar contains a persistent chat interface. You can ask the AI security questions at any time while browsing alerts. The conversation history is maintained for the duration of your session.

**Example questions:**
- "What does Sysmon Event ID 1 mean?"
- "Is it normal to see multiple failed login attempts from the same IP?"
- "How should I investigate a suspicious PowerShell execution?"

### Main Area: Security Alerts

The main area displays the 50 most recent alerts from Elasticsearch's `.alerts-security.alerts-*` index, sorted by timestamp (newest first).

Each alert shows:
- **Alert name** — what the detection rule flagged
- **Timestamp** — when the alert fired
- **Severity** — color-coded (critical = red, high = orange, medium = yellow, low = green)
- **Host** — which machine triggered the alert
- **User** — which user account was involved
- **Source/Destination IP** — network connection details (if applicable)
- **Command line** — the process command that triggered the alert (if applicable)
- **Reason** — why the detection rule matched

### Per-Alert Actions

For each alert, you can:

1. **Analyze** — sends the full alert JSON to the AI, which returns:
   - What happened (1 sentence)
   - Risk level (1 sentence)
   - What to do (1-2 sentences)

2. **Expand JSON** — view the complete raw alert data in JSON format

## How It Works

![Log Analyzer Data Flow](/img/ai-stack/log-analyzer-flow.svg)

- **Alert browsing:** Queries Elasticsearch directly for security alerts
- **AI analysis:** Sends prompts to LiteLLM, which routes to the active model (local or cloud)
- **Chat:** Full conversation history is sent with each message for context

## Configuration

The Log Analyzer is configured through environment variables set in its container quadlet file. You generally do not need to change these — they are set automatically during installation.

| Variable | Default | Description |
|----------|---------|-------------|
| `ELASTICSEARCH_URL` | `https://lme-elasticsearch:9200` | Elasticsearch endpoint |
| `ELASTICSEARCH_USER` | `elastic` | Elasticsearch username |
| `ELASTICSEARCH_PASSWORD` | *(from podman secret)* | Elasticsearch password |
| `LITELLM_URL` | `https://lme-litellm:4000` | LiteLLM proxy endpoint |
| `LITELLM_API_KEY` | `sk-lme-llama-proxy` | LiteLLM API key |
| `LITELLM_MODEL` | `gemma-3-1b` | Default model for analysis |

## Comparison: Log Analyzer vs Dashboard

| Feature | Log Analyzer (:8501) | Dashboard (:8502) |
|---------|---------------------|-------------------|
| Alert browsing | Recent 50 alerts | Multiple sources, host-based views |
| AI analysis | Per-alert + sidebar chat | Per-alert + RAG chat + streaming |
| Detection rules | Not available | Full rule management |
| KEV tracking | Not available | Full KEV integration |
| Model management | Not available | Switch models, add cloud providers |
| Technology | Streamlit | FastAPI + Alpine.js |
| Complexity | Simple, focused | Feature-rich |

**When to use the Log Analyzer:**
- You want a quick glance at recent alerts
- You prefer a simpler interface
- You are new to LME and want to start simple

**When to use the Dashboard:**
- You need to manage detection rules
- You want RAG-powered documentation Q&A
- You need model management or KEV tracking
- You want more detailed alert views

## Checking the Service

```bash
# Check if the log analyzer is running
sudo systemctl status lme-log-analyzer

# View logs
sudo podman logs lme-log-analyzer --tail 20

# Restart if needed
sudo systemctl restart lme-log-analyzer
```

## Troubleshooting

### "Connection refused" when accessing port 8501

The Log Analyzer container may not be running:

```bash
sudo systemctl status lme-log-analyzer
```

If it is not running, start it:

```bash
sudo systemctl start lme-log-analyzer
```

### No alerts showing

1. Verify Elasticsearch has alert data:
   ```bash
   source /opt/lme/scripts/extract_secrets.sh -p
   curl -sk -u elastic:$elastic "https://localhost:9200/.alerts-security.alerts-*/_count"
   ```

2. If the count is 0, no alerts have been generated yet. You need:
   - Kibana detection rules enabled (see [Dashboard docs](./dashboard.md))
   - Endpoints sending logs to LME

### AI analysis button does nothing

Check that LiteLLM is running:

```bash
sudo systemctl status lme-litellm
curl -sk https://localhost:4000/health
```

If LiteLLM is down, restart the AI stack:

```bash
sudo systemctl restart lme-llama-cpp
sleep 5
sudo systemctl restart lme-litellm
```

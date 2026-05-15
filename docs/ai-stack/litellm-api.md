---
title: "LiteLLM API Reference"
sidebar_position: 7
description: "How to call the LME LLM API directly from scripts, tools, or other applications using the OpenAI-compatible endpoint."
---

# LiteLLM API Reference

LME runs a [LiteLLM](https://docs.litellm.ai/) proxy that provides an **OpenAI-compatible API** for all LLM interactions. This means any tool or script that works with the OpenAI API can talk to your LME AI stack — no code changes needed.

## Connection Details

| Setting | Value |
|---------|-------|
| **Base URL** | `https://<your-lme-server-ip>:4000` |
| **API Key** | `sk-lme-llama-proxy` |
| **Default Model** | `lfm2.5-1.2b-instruct` |

:::info
The API uses self-signed TLS certificates. You will need to disable certificate verification in your client (e.g., `curl -k` or `verify=False` in Python).
:::

## Quick Test

Verify the API is working:

```bash
curl -sk https://localhost:4000/health
```

Expected response:

```json
{"status": "healthy"}
```

## Endpoints

### List Available Models

```bash
curl -sk https://localhost:4000/v1/models \
  -H "Authorization: Bearer sk-lme-llama-proxy"
```

Returns all models configured in LiteLLM (both local and cloud).

### Chat Completions

This is the main endpoint for sending messages to the LLM.

```bash
curl -sk https://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-lme-llama-proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "lfm2.5-1.2b-instruct",
    "messages": [
      {"role": "user", "content": "What is a brute force attack?"}
    ]
  }'
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model name from your LiteLLM config |
| `messages` | array | Conversation history (see below) |
| `temperature` | float | Randomness (0.0 = deterministic, 1.0 = creative). Default: 0.7 |
| `max_tokens` | integer | Maximum response length. Default: varies by model |
| `stream` | boolean | Set `true` for streaming responses (SSE) |

**Message format:**

```json
{
  "messages": [
    {"role": "system", "content": "You are a security analyst."},
    {"role": "user", "content": "Analyze this alert..."},
    {"role": "assistant", "content": "Previous AI response..."},
    {"role": "user", "content": "Follow-up question..."}
  ]
}
```

- `system` — sets the AI's behavior/persona (optional, use at most once)
- `user` — your messages
- `assistant` — previous AI responses (for multi-turn conversations)

### Streaming Responses

Add `"stream": true` to get responses word-by-word via Server-Sent Events:

```bash
curl -sk https://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-lme-llama-proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "lfm2.5-1.2b-instruct",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

## Python Examples

### Using the `requests` Library

```python
import requests
import urllib3
urllib3.disable_warnings()  # Suppress self-signed cert warnings

LITELLM_URL = "https://your-lme-server:4000"
API_KEY = "sk-lme-llama-proxy"

response = requests.post(
    f"{LITELLM_URL}/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "lfm2.5-1.2b-instruct",
        "messages": [
            {"role": "user", "content": "Explain what a reverse shell is."}
        ],
        "temperature": 0.7,
        "max_tokens": 500,
    },
    verify=False,
    timeout=300,
)

result = response.json()
print(result["choices"][0]["message"]["content"])
```

### Using the OpenAI Python SDK

Since LiteLLM is OpenAI-compatible, you can use the official OpenAI Python library:

```python
from openai import OpenAI
import httpx

client = OpenAI(
    base_url="https://your-lme-server:4000/v1",
    api_key="sk-lme-llama-proxy",
    http_client=httpx.Client(verify=False),  # Self-signed cert
)

response = client.chat.completions.create(
    model="lfm2.5-1.2b-instruct",
    messages=[
        {"role": "system", "content": "You are a cybersecurity expert."},
        {"role": "user", "content": "What does Sysmon Event ID 3 indicate?"},
    ],
)

print(response.choices[0].message.content)
```

Install the SDK: `pip install openai httpx`

## Container-to-Container Usage

If you are running your own containers on the LME Podman network, use the internal hostname:

| Setting | Value |
|---------|-------|
| **Base URL** | `https://lme-litellm:4000` |
| **API Key** | `sk-lme-llama-proxy` |

The LME internal CA certificate is available at `/run/secrets/lme_certs/ca/ca.crt` inside containers on the `lme` network.

## Practical Examples

### Analyze an Elasticsearch Alert

```bash
# Get the latest alert from Elasticsearch
source /opt/lme/scripts/extract_secrets.sh -p
ALERT=$(curl -sk -u elastic:$elastic \
  "https://localhost:9200/.alerts-security.alerts-*/_search?size=1&sort=@timestamp:desc" \
  | python3 -m json.tool)

# Send it to the LLM for analysis
curl -sk https://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-lme-llama-proxy" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"lfm2.5-1.2b-instruct\",
    \"messages\": [
      {\"role\": \"system\", \"content\": \"You are a security analyst. Analyze the following alert and explain: 1) What happened 2) Risk level 3) Recommended action\"},
      {\"role\": \"user\", \"content\": $(echo "$ALERT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}
    ]
  }"
```

### Batch Analyze Multiple Alerts

```python
import requests
import json
import urllib3
urllib3.disable_warnings()

ES_URL = "https://localhost:9200"
ES_USER = "elastic"
ES_PASS = "your-elastic-password"  # From extract_secrets.sh
LITELLM_URL = "https://localhost:4000"
API_KEY = "sk-lme-llama-proxy"

# Fetch recent alerts
alerts = requests.get(
    f"{ES_URL}/.alerts-security.alerts-*/_search",
    auth=(ES_USER, ES_PASS),
    json={"size": 10, "sort": [{"@timestamp": "desc"}]},
    verify=False,
).json()

# Analyze each alert
for hit in alerts["hits"]["hits"]:
    alert = hit["_source"]
    name = alert.get("kibana.alert.rule.name", "Unknown")

    response = requests.post(
        f"{LITELLM_URL}/v1/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "lfm2.5-1.2b-instruct",
            "messages": [
                {"role": "system", "content": "Briefly assess this security alert in 2-3 sentences."},
                {"role": "user", "content": json.dumps(alert, indent=2)[:4000]},
            ],
            "max_tokens": 200,
        },
        verify=False,
    ).json()

    analysis = response["choices"][0]["message"]["content"]
    print(f"\n--- {name} ---")
    print(analysis)
```

## Changing the API Key

The default API key is `sk-lme-llama-proxy`. To change it:

1. Edit the LiteLLM config:
   ```bash
   sudo nano /opt/lme/config/litellm_config.yaml
   ```

2. Find and change the `master_key` value:
   ```yaml
   general_settings:
     master_key: sk-your-new-key-here
   ```

3. Restart LiteLLM:
   ```bash
   sudo systemctl restart lme-litellm
   ```

4. Update any scripts or tools that use the old key.

## Troubleshooting

### "Connection refused" on port 4000

LiteLLM may not be running:

```bash
sudo systemctl status lme-litellm
```

LiteLLM depends on llama.cpp — check that first:

```bash
sudo systemctl status lme-llama-cpp
```

### Slow responses

- The local model runs on CPU by default. Response time depends on your server's CPU power.
- Larger models are slower. The default 1.2B model is the fastest option.
- Check server load: `htop` or `top`

### "Invalid API key"

Make sure you are using the correct key. Check the config:

```bash
grep master_key /opt/lme/config/litellm_config.yaml
```

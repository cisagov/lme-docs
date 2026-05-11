---
title: "FAQ / Troubleshooting"
description: "Troubleshooting / FAQ for LME dashboard"
---

# Troubleshooting

## Dashboard shows "ES: red" or "ES: unreachable"

The dashboard cannot connect to Elasticsearch.

1. Check Elasticsearch is running: `sudo systemctl status lme-elasticsearch`
2. Test connectivity: `curl -sk https://localhost:9200`
3. Restart if needed: `sudo systemctl restart lme-elasticsearch`

## Dashboard shows "LLM: unreachable"

The LiteLLM proxy is not responding.

1. Check the service: `sudo systemctl status lme-litellm`
2. Check llama.cpp (LiteLLM depends on it): `sudo systemctl status lme-llama-cpp`
3. Restart the AI stack:
   ```bash
   sudo systemctl restart lme-llama-cpp
   sleep 5
   sudo systemctl restart lme-litellm
   ```

## Dashboard shows "pgvector: unreachable"

The vector database is not responding.

1. Check the service: `sudo systemctl status lme-pgvector`
2. Restart: `sudo systemctl restart lme-pgvector`
3. If RAG was working before, re-ingest docs from Settings > Documents

## AI responses are slow or low quality

The default 1.2B model is small and fast but has limited reasoning ability. Options:
- Download a larger local model (see [Managing Models](./managing-models.md))
- Connect a cloud model for better analysis quality

## "Certificate error" when accessing the dashboard

LME uses self-signed TLS certificates. This is expected.

- **Chrome:** Click "Advanced" then "Proceed to site"
- **Firefox:** Click "Advanced" then "Accept the Risk and Continue"
- **Edge:** Click "Continue to site"

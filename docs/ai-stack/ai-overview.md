---
title: "AI Stack Overview"
sidebar_position: 1
description: "Understand the AI-powered components LME deploys for security analysis, including local LLMs, RAG chat, and vulnerability enrichment."
---

# AI Stack Overview

LME includes an AI-powered security analysis layer that runs **entirely on your own infrastructure**. No data leaves your network. The AI stack helps security analysts investigate alerts, understand vulnerabilities, and get answers about LME documentation — all through a web-based dashboard.

## What Gets Deployed

When LME installs, it automatically sets up these AI components:

![LME AI Stack Architecture](/img/ai-stack/ai-stack-architecture.svg)

### Component Summary

| Component | Port | Purpose |
|-----------|------|---------|
| **LME Dashboard** | 8502 | Web UI for alerts, AI chat, model management, detection rules, KEV tracking |
| **Log Analyzer** | 8501 | Simpler Streamlit-based log browser with AI analysis |
| **LiteLLM Proxy** | 4000 | API gateway that routes LLM requests to local or cloud models |
| **llama.cpp** | 8080 | Runs the local chat LLM (no internet required) |
| **Embeddings Server** | 8081 | Generates text embeddings for RAG document search |
| **pgvector** | 5432 | PostgreSQL with vector extensions — stores document embeddings for RAG |

### What is RAG?

RAG stands for **Retrieval-Augmented Generation**. When you ask a question in the AI chat, LME:

1. Converts your question into a vector embedding
2. Searches the pgvector database for relevant LME documentation chunks
3. Sends those relevant docs as context along with your question to the LLM
4. The LLM gives you an answer grounded in the actual documentation

This means the AI can answer questions about LME accurately, based on the real docs — not just its general training data.

## What Models are Used

LME ships with two local models that run on your hardware:

| Model | Size | Purpose | Server |
|-------|------|---------|--------|
| **LFM2.5-1.2B-Instruct** | ~0.8 GB | Chat and analysis | llama.cpp (:8080) |
| **nomic-embed-text-v1.5** | ~0.3 GB | Text embeddings for RAG | Embeddings (:8081) |

Both models are downloaded automatically during installation and stored at `/opt/lme/llama-models/`.

:::tip
The default 1.2B parameter model is lightweight and runs on modest hardware. You can switch to larger, more capable models through the dashboard if your server has more resources. See [Managing Models](./managing-models.md).
:::

## Optional: Cloud Model Support

While LME works completely offline with local models, you can optionally connect cloud LLM providers for more capable analysis:

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Azure OpenAI
- Google Vertex AI (Gemini)
- AWS Bedrock
- Ollama (self-hosted)

Cloud models are configured through the dashboard UI or by editing the LiteLLM config file. See [Managing Models](./managing-models.md) for details.

## Accessing the AI Features

After LME is installed, access the dashboard at:

```
https://<your-lme-server-ip>:8502
```

The log analyzer is available at:

```
https://<your-lme-server-ip>:8501
```

Both use the LME TLS certificates (self-signed by default), so your browser will show a certificate warning — this is expected.

## Updating the RAG Documentation Index

The RAG system needs a local copy of the LME documentation stored as vector embeddings in pgvector. This is set up automatically during installation, but you can re-index if the docs have been updated:

1. Open the dashboard at `https://<your-lme-server-ip>:8502`
2. Go to **Settings** > **Documents**
3. You will see:
   - **Chunk count** — how many documentation chunks are stored
   - **Last updated** — when the index was last refreshed
   - **Source** — the LME docs website that was crawled
4. Click **"Pull Latest Documentation"**
5. The button shows **"Scraping & indexing... this takes a few minutes"**
6. When complete: **"Done — N chunks indexed"**

This crawls the LME documentation website, converts pages to text, chunks them, generates embeddings, and stores everything in pgvector.

## Next Steps

- [LME Security Dashboard](./dashboard.md) — full guide to the dashboard UI
- [Using the AI Chat](./ai-chat.md) — how to interact with the AI for security analysis
- [Detection Engineering](./detection-engineering.md) — import Kibana rules, convert Sigma rules, create ElastAlert2 rules
- [Managing Models](./managing-models.md) — switch models, add cloud providers, download new local models
- [KEV Integration](./kev-integration.md) — CISA Known Exploited Vulnerabilities enrichment
- [Log Analyzer](./log-analyzer.md) — the Streamlit-based log browser
- [LiteLLM API Reference](./litellm-api.md) — calling the LLM API directly from scripts

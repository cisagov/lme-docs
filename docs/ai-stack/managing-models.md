---
title: "Managing Models"
sidebar_position: 4
description: "How to switch AI models, download new local models, and configure cloud LLM providers in LME."
---

# Managing Models

LME supports both local models (running on your server) and cloud models (via API). You can switch between them at any time through the dashboard or by editing configuration files.

## Default Models

LME ships with two models, downloaded automatically during installation:

| Model | File | Size | Purpose |
|-------|------|------|---------|
| LFM2.5-1.2B-Instruct | `LFM2.5-1.2B-Instruct-Q4_K_M.gguf` | ~0.8 GB | Chat and analysis |
| nomic-embed-text-v1.5 | `nomic-embed-text-v1.5.Q4_K_M.gguf` | ~0.3 GB | Text embeddings (RAG) |

Models are stored in `/opt/lme/llama-models/` on the LME server.

## Settings Navigation

All model management is under the **Settings** tab in the dashboard. The Settings page has a left sidebar with five sections:

- **AI Models** — add, remove, and switch between configured models (local and cloud)
- **Local Models** — manage downloaded `.gguf` files, download new ones, switch the active local model
- **KEV Configuration** — CISA KEV sync settings (see [KEV Integration](./kev-integration.md))
- **Documents** — RAG documentation ingestion status and re-ingestion
- **General** — auto-refresh and default RAG mode toggles

## Switching Local Models

### Via the Dashboard

1. Open the dashboard at `https://<your-lme-server-ip>:8502`
2. Go to **Settings** > **Local Models**
3. You will see all downloaded `.gguf` files listed, with file sizes. The currently active model has a green border and an "Active" badge.
4. Click the **"Switch"** button next to the model you want to activate
5. A confirmation dialog appears: **"Switch llama.cpp to 'filename'? This will restart the llama.cpp container. AI chat will be briefly unavailable."**
6. Click **OK**
7. The status badge changes to **"Restarting..."** (yellow)
8. Wait for the status to change to **"Running"** (green) — this typically takes 10-30 seconds
9. The model pill in the header updates to the new model name

### Via the Command Line

On the LME server:

1. Edit the model config file:

   ```bash
   sudo nano /opt/lme/config/llama-cpp-model.json
   ```

2. Set the model filename:

   ```json
   {
     "model": "your-model-filename.gguf"
   }
   ```

3. Touch the trigger file to activate the switch:

   ```bash
   sudo touch /opt/lme/config/.llama-model-updated
   ```

4. A systemd path watcher detects the change and runs the switch script automatically. Check the status:

   ```bash
   cat /opt/lme/config/llama-cpp-status.json
   ```

   It will show `"switching"` then `"ready"` when complete.

### What Happens During a Model Switch

1. The model filename is validated (must exist in `/opt/lme/llama-models/`)
2. The `--model` argument in the llama.cpp container quadlet file is updated
3. `systemctl daemon-reload` runs to pick up the change
4. The `lme-llama-cpp` service restarts with the new model
5. Status is written to `/opt/lme/config/llama-cpp-status.json`

## Downloading New Local Models

### Via the Dashboard

1. Go to **Settings** > **Local Models**
2. Find the **search box** below the installed models list
3. Enter a search term and press **Enter** or click **"Search"**. You can search by:
   - Repository path: `google/gemma-3-1b-it`, `meta-llama/Llama-3.2-1B-Instruct`
   - General terms: `mistral 7b`, `phi-3-mini`, `gemma 1b`
4. The dashboard shows **"Searching..."** then displays result cards
5. Each result card shows a HuggingFace repository with a list of `.gguf` files, including:
   - Filename
   - File size (MB or GB)
   - Quantization type (e.g., Q4_K_M, Q5_K_M, Q8_0)
6. Hover over a file to reveal the **"Download"** button
7. Click **"Download"**
8. A **progress card** appears showing the download with a spinning icon, filename, and downloaded size
9. When complete, the model appears in the **Installed Models** list above and can be switched to immediately

:::tip
The search is smart about GGUF repos. If you search for a model like `google/gemma-3-1b-it`, it automatically checks for `-GGUF` suffix variants and popular quantizer repos (bartowski, mradermacher, QuantFactory) to find pre-quantized versions.
:::

### Via the Command Line

You can download GGUF models directly from HuggingFace:

```bash
cd /opt/lme/llama-models/

# Example: download a Mistral 7B model
sudo wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
```

After downloading, switch to the model using either the dashboard or command line method above.

### Choosing a Model

| Model Size | RAM Needed | Quality | Speed | Good For |
|-----------|-----------|---------|-------|----------|
| 1-3B parameters | 2-4 GB | Basic | Fast | Quick summaries, simple Q&A |
| 7B parameters | 6-8 GB | Good | Moderate | Most security analysis tasks |
| 13B parameters | 12-16 GB | Very good | Slower | Complex analysis, detailed reports |
| 70B+ parameters | 48+ GB | Great | Slow | Most complex analysis (needs powerful hardware) |

:::tip
Look for models with `Q4_K_M` quantization — this is a good balance of quality and size. Avoid `Q2` (too low quality) and `f16` (too large for most hardware).
:::

### Deleting Local Models

#### Via the Dashboard

1. Go to **Settings** > **Local Models**
2. Click the **trash icon** next to the model you want to remove
3. A confirmation dialog appears: **"Delete 'filename'? This cannot be undone."**
4. Click **OK** to confirm

:::warning
You cannot delete the model that is currently active. The dashboard will reject the request (HTTP 409). Switch to a different model first.
:::

#### Via the Command Line

```bash
sudo rm /opt/lme/llama-models/<model-filename>.gguf
```

## Adding Cloud Models

Cloud models offer higher quality analysis but require internet access and an API key from the provider.

### Via the Dashboard

1. Go to **Settings** > **AI Models**
2. Scroll down to the **Add Model** form
3. Select a **provider** by clicking one of the four buttons:
   - **Local** (llama.cpp) — for adding another local model endpoint
   - **OpenAI** (GPT-4o, etc.)
   - **Anthropic** (Claude)
   - **OpenRouter** (multi-provider gateway)
4. After selecting a provider, **quick-pick buttons** appear with suggested model IDs (e.g., "gpt-4o", "claude-3-sonnet"). Click one to auto-fill the Model ID field, or type your own.
5. Fill in the fields:
   - **Display Name** — what this model is called in the dashboard (e.g., "GPT-4o")
   - **Model ID** — the LiteLLM model identifier (e.g., `gpt-4o`, `anthropic/claude-3-sonnet-20240229`)
   - **API Key** — your provider's API key (e.g., `sk-...` for OpenAI). This field only appears for cloud providers.
   - **API Base URL** — (optional) pre-filled based on provider. Override for custom endpoints.
6. Click **"Add Model"**
7. The button shows **"Saving..."**
8. The model appears in the **Configured Models** list above

The API key is encrypted using Fernet symmetric encryption (derived from the LME Ansible vault password) and stored securely at `/opt/lme/config/llm_keys.enc`. A systemd path watcher detects the change, decrypts the keys, injects them into a Podman secret, and restarts LiteLLM — all automatically.

:::info
After adding a model, you still need to **switch to it** to start using it. See [Switching the Active Model](#switching-the-active-model) below.
:::

### Via the Configuration File

1. Edit the LiteLLM config:

   ```bash
   sudo nano /opt/lme/config/litellm_config.yaml
   ```

2. Add a model entry under the `model_list`:

   ```yaml
   model_list:
     # Existing local model
     - model_name: lfm2.5-1.2b-instruct
       litellm_params:
         model: openai/LFM2.5-1.2B-Instruct-Q4_K_M
         api_base: https://lme-llama-cpp:8080/v1
         api_key: dummy
         ssl_verify: false

     # Add a cloud model (example: OpenAI GPT-4)
     - model_name: gpt-4
       litellm_params:
         model: gpt-4
         api_key: sk-your-openai-key-here
   ```

3. Restart LiteLLM:

   ```bash
   sudo systemctl restart lme-litellm
   ```

### Supported Cloud Providers

Here are example configurations for each supported provider:

#### OpenAI

```yaml
- model_name: gpt-4
  litellm_params:
    model: gpt-4
    api_key: sk-your-key-here
```

#### Anthropic (Claude)

```yaml
- model_name: claude-3-sonnet
  litellm_params:
    model: anthropic/claude-3-sonnet-20240229
    api_key: sk-ant-your-key-here
```

#### Azure OpenAI

```yaml
- model_name: azure-gpt-4
  litellm_params:
    model: azure/your-deployment-name
    api_base: https://your-resource.openai.azure.com/
    api_key: your-azure-key
    api_version: "2024-02-15-preview"
```

#### Google Vertex AI (Gemini)

```yaml
- model_name: gemini-pro
  litellm_params:
    model: vertex_ai/gemini-pro
    vertex_project: your-gcp-project
    vertex_location: us-central1
```

#### AWS Bedrock

```yaml
- model_name: bedrock-claude
  litellm_params:
    model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
    aws_access_key_id: your-access-key
    aws_secret_access_key: your-secret-key
    aws_region_name: us-east-1
```

#### Ollama (Self-Hosted)

```yaml
- model_name: ollama-llama3
  litellm_params:
    model: ollama/llama3
    api_base: http://your-ollama-server:11434
```

### Removing Cloud Models

#### Via the Dashboard

1. Go to **Settings** > **AI Models**
2. Find the model in the **Configured Models** list
3. Hover over the model card to reveal the **"Remove"** button
4. Click **"Remove"**
5. A confirmation dialog appears: **"Remove model 'name'?"**
6. Click **OK** — the model is removed from the LiteLLM configuration

#### Via the Configuration File

Remove the model entry from `/opt/lme/config/litellm_config.yaml` and restart LiteLLM:

```bash
sudo systemctl restart lme-litellm
```

## Switching the Active Model

The **active model** is the one used for all AI chat and analysis requests.

### Via the Dashboard

1. Go to **Settings** > **AI Models**
2. In the **Configured Models** list, find the model you want to use
3. Click the **"Use"** button on that model's card
4. The model is instantly activated — the green "In Use" badge moves to the selected model
5. The model pill in the header bar updates to the new model name

You can also click the **model pill** in the header bar to jump directly to this screen.

:::info
Switching between configured models is instant — no service restart needed. The change takes effect on your next chat message or analysis request.
:::

### Via the API

```bash
curl -sk -X POST https://localhost:8502/api/models/active \
  -H "Content-Type: application/json" \
  -d '{"model_name": "gpt-4"}'
```

## How API Keys are Secured

Cloud API keys follow this security pipeline:

1. You enter the key in the dashboard
2. The dashboard encrypts it using **Fernet symmetric encryption** derived from the LME Ansible vault password (PBKDF2, 100,000 iterations)
3. The encrypted blob is written to `/opt/lme/config/llm_keys.enc`
4. A trigger file is touched: `/opt/lme/config/.llm-keys-updated`
5. A systemd path watcher detects the change
6. The `sync_llm_keys.py` script decrypts the keys and injects them into a **Podman secret** (`llm-keys`)
7. LiteLLM is restarted and reads the keys from `/run/secrets/llm_keys`

At no point are plain text API keys stored on disk outside of the Podman secret mount.

## Troubleshooting

### Model switch stuck on "switching"

Check the switch script status:

```bash
sudo journalctl -u lme-llama-model.service -n 20
```

Common causes:
- The model file does not exist in `/opt/lme/llama-models/`
- The llama.cpp service failed to restart

### LiteLLM not picking up cloud model

1. Verify the config syntax:
   ```bash
   python3 -c "import yaml; yaml.safe_load(open('/opt/lme/config/litellm_config.yaml'))"
   ```
2. Check LiteLLM logs:
   ```bash
   sudo podman logs lme-litellm --tail 50
   ```
3. Restart LiteLLM:
   ```bash
   sudo systemctl restart lme-litellm
   ```

### "Model not found" error in chat

The model name in your chat request must match a `model_name` in the LiteLLM config. Check available models:

```bash
curl -sk https://localhost:4000/v1/models -H "Authorization: Bearer sk-lme-llama-proxy"
```

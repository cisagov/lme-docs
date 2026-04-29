---
title: "Using the AI Chat"
sidebar_position: 3
description: "How to use the LME AI chat for security analysis, alert investigation, and RAG-powered documentation Q&A."
---

# Using the AI Chat

LME's AI chat lets you interact with a large language model (LLM) directly from the dashboard. You can ask security questions, get AI analysis of alerts, and query the LME documentation. Everything runs on your own infrastructure — no data is sent externally unless you configure a cloud model.

## Where to Find the Chat

The AI chat appears as a **sidebar panel on the right side** of two views:

- **Alerts view** — titled "AI Assistant"
- **Detection Engineering view** — titled "Detection Assistant"

Each has its own independent conversation history.

## How to Send a Message

1. Type your question in the text area at the bottom of the chat panel
2. Press **Enter** to send (or click the arrow button)
3. Your message appears as a blue bubble on the right
4. A thinking animation plays while the AI processes
5. The AI response appears as a gray bubble on the left, with text streaming in word by word

**Keyboard shortcuts:**
- **Enter** — send the message
- **Shift+Enter** — insert a new line (for multi-line messages)
- **Escape** — clear the search bar (in the alerts area)

## RAG Mode: Documentation-Grounded Answers

RAG (Retrieval-Augmented Generation) is a mode that searches the LME documentation before answering. This grounds the AI's response in real, accurate documentation rather than general knowledge.

### How to Toggle RAG Mode

1. Look for the **"Docs ON"** or **"Docs"** button at the top of the chat panel
2. Click it to toggle RAG mode on or off:
   - **"Docs ON"** (highlighted) = RAG is active — answers are grounded in LME docs
   - **"Docs"** (not highlighted) = RAG is off — the AI uses only its general knowledge

RAG mode is **on by default**.

### What Happens When RAG is On

When you send a message with RAG enabled:

1. Your question is converted to a vector embedding by the embeddings server
2. The embedding is compared against all LME documentation chunks stored in pgvector
3. The top 10 most relevant documentation passages are retrieved (filtered by a minimum similarity threshold of 0.55 and a minimum length of 200 characters)
4. Those passages are included as context in the prompt sent to the LLM
5. The AI answers based on the documentation, not just its training data
6. **Source cards** appear below the response showing:
   - Section title of each matched document
   - URL to the documentation page (clickable, opens in a new tab)
   - Similarity percentage (how relevant the match was)
   - A short excerpt from the matched passage

If no relevant documentation is found, the AI will say so and provide a link to the LME docs website.

### When to Use RAG vs. Regular Chat

| Use RAG (Docs ON) for | Use regular chat (Docs OFF) for |
|---|---|
| "How do I change the elastic password?" | "What is a pass-the-hash attack?" |
| "What ports does LME need open?" | "Write a KQL query for failed logins" |
| "How do I add a Wazuh agent?" | "Explain this CVE to me" |
| "Why is my Kibana not loading?" | "What does Sysmon Event ID 3 mean?" |

:::tip
If you are asking about LME itself (configuration, troubleshooting, features), always use RAG mode. The documentation context dramatically improves accuracy.
:::

## Analyzing Alerts with AI

### From the Alert Card

1. Go to the **Alerts** view
2. Find the alert you want to investigate
3. Click the **"Analyze"** button on the alert card
4. An "Analyzing..." indicator appears
5. The AI receives the full alert JSON (trimmed to 4KB) and responds with exactly three sections:
   - **What happened** — a plain-English explanation of the alert
   - **Risk** — how serious this is
   - **Action** — specific steps you should take
6. The analysis appears in a colored box directly below the alert card

This works on all four alert tabs (Kibana, Wazuh, Sysmon, Windows Defender).

### From the Chat Panel

You can also paste alert data into the chat:

1. Click **"Details"** on an alert card to expand the JSON
2. Copy the JSON
3. Paste it into the chat with a question like: "Analyze this alert and tell me if it's a real threat"
4. The AI breaks down the alert and gives you guidance

This is useful when you want a follow-up conversation about a specific alert.

## Clearing Conversations

Click the **"Clear"** button at the top of the chat panel to reset the conversation history and start fresh.

Conversation history is also cleared when you refresh the page.

## How the AI Pipeline Works

![How RAG Chat Works](/img/ai-stack/rag-pipeline.svg)

## Tips for Better Results

### Be Specific

| Less effective | More effective |
|---|---|
| "Help with alerts" | "I see 50 Sysmon Event ID 1 alerts from PC-04 in the last hour — is this normal?" |
| "Explain this" | "What does this Wazuh level 12 alert mean and should I be concerned?" |
| "How does LME work" | "How does LME collect Windows event logs from endpoints?" |

### Provide Context When Analyzing Alerts

Include as much context as you can:
- Use the **Analyze** button (sends the full alert automatically) rather than manually describing the alert
- Mention whether this is a one-time event or recurring
- Mention what kind of environment this is (production, test, etc.)

### Understand Model Limitations

The default local model (LFM2.5 1.2B) is small and fast but has limited reasoning. For complex analysis:
- Download a larger local model (7B+ parameters) — see [Managing Models](./managing-models.md)
- Connect a cloud model (GPT-4, Claude) for the best quality
- See [Managing Models](./managing-models.md) for instructions

## Privacy

- **Local models:** All processing happens on your LME server. No data leaves your network.
- **Cloud models:** If you configure a cloud model, your prompts (including alert data) are sent to that cloud provider. Only use cloud models if your organization's data handling policies allow it.
- **RAG data:** The documentation in pgvector comes from the public LME docs website. No sensitive data is stored in the RAG database.

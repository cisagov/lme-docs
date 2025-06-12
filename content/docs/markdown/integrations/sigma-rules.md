---
title: Sigma Rules to Kibana Alerts 
---

# Sigma to Kibana Conversion Script

## What it does

Downloads the latest Sigma detection rules from GitHub and converts them to Kibana-compatible format. The script handles Windows, macOS, and Linux rules, then optionally uploads them directly to your Kibana instance.

## Prerequisites

- Python 3, pip, curl, jq, and unzip

## How to use it

```bash
cd ~/LME/scripts/sigma/
chmod +x convert_sigma_to_kibana.sh
./convert_sigma_to_kibana.sh
```

## What happens

1. Downloads latest Sigma rules from official repository
2. Converts rules for all three platforms (Windows/macOS/Linux)
3. Creates NDJSON files in `output/` directory
4. Prompts to upload directly to Kibana or do it manually

## Manual upload (if needed)

1. Open Kibana at `https://localhost:5601`
2. Go to **Security → Rules → Import Rules**
3. Upload the files from `output/` directory

## Important notes

- All rules are **disabled by default** for security
- Review and enable rules individually based on your environment
- Script downloads fresh rules each time it runs
- 

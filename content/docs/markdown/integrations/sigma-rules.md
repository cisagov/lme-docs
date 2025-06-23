---
title: Sigma Rules to Kibana Alerts 
---

# Sigma to Kibana Conversion Script

## Overview

This script automates the process of downloading the latest Sigma detection rules from GitHub and converting them into a format compatible with Kibana. It supports Windows, macOS, and Linux environments and offers the option to upload the converted rules directly to your Kibana instance.

## Prerequisites

Ensure the following tools are installed on your system:

- Python 3
- pip
- curl
- jq
- unzip

## How to Use

To get started, make sure you've installed all the prerequisites listed above. This script is intended to be run from the command line and will handle downloading, converting, and preparing Sigma rules for Kibana.

```bash
cd ~/LME/scripts/sigma/
chmod +x convert_sigma_to_kibana.sh
./convert_sigma_to_kibana.sh
```

This script will then walk you through the rest of the process interactively.

## What the Script Does

1. Downloads the latest Sigma rules from the official repository.
   
2. Converts rules for all three platforms (i.e., Windows/macOS/Linux).
   
3. Creates NDJSON files in `output/` directory.
 
4. Prompts you to either upload the files directly to Kibana or do so manually.

## Manual Upload (if needed)

1. Navigate to **`https://localhost:5601`** to open Kibana.
   
2. Navigate to **Security → Rules → Import Rules**.
   
3. Upload the ***files from the `output/` directory***.

## Important notes

- All rules are **disabled by default** for security.
  
- Review and enable individual rules based on your environment.
  
- The script pulls the latest Sigma rules each time it is run.
  

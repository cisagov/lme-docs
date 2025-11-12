---
title: "Offline Install (Airgapped)"
---

# LME Offline Installation Guide

## Supported Operating Systems
This offline installation process works on:

- Ubuntu 24.04
- Red Hat Enterprise Linux 9+

**Important:** The offline preparation machine and the target offline machine must be running the same OS.

## On Internet-Connected Machine (Preparation)

### Prerequisites
Ensure git is installed on your system:

**Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install git
```

**Red Hat:**
```bash
sudo dnf install git
```

### 1. Clone the Repository
```bash
git clone https://github.com/cisagov/LME.git
cd LME
```

### 2. Expand Disk (Red Hat Only)
**Red Hat users only:** Run the disk expansion script before preparing offline resources. This will require 
admin credentials.

**Note:** Ubuntu users should NOT run this script.

```bash
sudo ./scripts/expand_disk_for_offline.sh
```

### 3. Prepare Offline Resources
```bash
./scripts/prepare_offline.sh
```

**This process will take upwards of 30 minutes** and will:
- Download container images
- Download system packages
- Download agent installers
- Download CVE database
- Create a compressed archive with all resources

### 4. Locate and Transfer the Archive

When complete, you will find a `.tar.gz` file in your home directory (`~/`):
```
lme-offline-YYYYMMDD-HHMMSS.tar.gz
```
Transfer this archive to your offline air-gapped machine according to your organization's security policy.

## On Offline Air-Gapped Machine (Installation)

**Important:** The offline machine must be running the same OS as the preparation machine.

### 1. Extract the Archive
```bash
tar -xzf lme-offline-*.tar.gz
```

### 2. Navigate to LME Directory
```bash
cd LME
```

### 3. Run Offline Installation
```bash
./install.sh --offline
```
The installation script will automatically:

- Install required system packages
- Configure container runtime
- Load container images
- Set up CVE database
- Configure for air-gapped operation
- Complete the LME installation

### 4. Agent Deployment

Your offline LME instance must be on a network where your airgapped endpoints can reach it. 
Recommend using a python3 http server to install the agent. 

1. On the LME server:

```bash
cd ~/LME/offline_resources/agents/
```

```bash
python3 -m http.server 8000
```

This makes the agent resources available for download to the local endpoint.

2. From an endpoint navtigate to ```http://lme-server-ip-address:8000``` and download the agent you need. 

Once you have downloaded the agent to the endpoint you can install it into fleet using the normal installation steps. You would just skip the download steps.
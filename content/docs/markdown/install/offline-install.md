---
title: "Offline Install (Airgapped)"
---

# LME Offline Installation Guide

## Supported Operating Systems
This offline installation process works on:

- Ubuntu 24.04
- Red Hat Enterprise Linux (RHEL) 9+

**Important: The offline preparation machine and the target offline machine must be running the same Operating System (OS).**

## Internet-Connected Machine (Preparation)

### Prerequisites
Ensure git is installed on your system:

**Ubuntu:**

Run the following commands to install git:
```bash
sudo apt-get update
sudo apt-get install git
```

**Red Hat:**

Run the following command to install git:
```bash
sudo dnf install git
```

### 1. Clone the Repository

Run the following commands to clone the Logging Made Easy (LME) repository and move into the directory:

```bash
git clone https://github.com/cisagov/LME.git
cd LME
```

### 2. Expand Disk (Red Hat Only)
**Note: This step applies only to Red Hat users. Run the disk-expansion script before preparing offline resources. Administrator credentials are required.**

**Important: Ubuntu users should not run this script.**

Run the following command to expand the disk:

```bash
sudo ./scripts/expand_disk_for_offline.sh
```

### 3. Prepare Offline Resources

Run the following script to generate all offline resources:
```bash
./scripts/prepare_offline.sh
```

This process may take up to 30 minutes and will:
- Download container images
- Download system packages
- Download agent installers
- Download Common Vulnerabilities and Exposures (CVE) database
- Create a compressed archive with all resources

### 4. Locate and Transfer the Archive

When preparation is complete, a `.tar.gz` file will appear in the home directory (`~/`):

```
lme-offline-YYYYMMDD-HHMMSS.tar.gz
```
Transfer this archive to your offline air-gapped machine according to your organization's security policy.

## Offline Air-Gapped Machine (Installation)

**Important: The offline machine must be running the same OS as the preparation machine.**

### 1. Extract the Archive

Run the following command to extract the archive:
```bash
tar -xzf lme-offline-*.tar.gz
```

### 2. Navigate to LME Directory

Run the following command in the LME Directory:
```bash
cd LME
```

### 3. Run Offline Installation

Run the following script to start the offline installation:
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

Your offline LME instance must be on a network where your air-gapped endpoints can reach it. It is recommended to use a python3 Hypertext Transfer Protocol (HTTP) server to host the agent installers. 

#### a. Start the HTTP Server on the LME Server

Navigate to the agents directory and then run the following command:

```bash
cd ~/LME/offline_resources/agents/
```

To start a simple HTTP server, run the following command:

```bash
python3 -m http.server 8000
```

This makes the agent resources available for download to the local endpoint.

#### b. Download the Agent from the Endpoint

From an endpoint, navigate to **http://lme-server-ip-address:8000** and download the agent you need. 

Once the agent is downloaded to the endpoint, install it in Fleet using the standard installation steps, skipping only the download portion.
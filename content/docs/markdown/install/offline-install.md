---
title: "Air-Gapped Install"
---

# LME Offline Installation Guide

## Supported Operating Systems
This offline installation process works on:

- Ubuntu 24.04
- Red Hat Enterprise Linux 9+

**Important:** The offline preparation machine and the target offline machine must be running the same OS.

![air-gapped install diagram](/doc/imgs/Air-Gapped-Solution-Diagram.png)

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

### 2. Size and Volume requirements
The prepare offline script will use quite a bit of space. As it will be downloading many required packages and images. 
When you create your prepare offline machine ensure the root path has at least 50GB in order to create and store the files that get zipped into the tar.gz.

Your Air-Gapped machine must have enough space to both unzip these files, and then install them into the /opt/lme path. Ensure that the both the path you unzip at, and /opt/ have over 50GB of space to do a proper install.

/var/ path is where your logs will get saved via the Podman volume. Ensure this path has ample space if you aren't going to be using an external storage device. Adjust your index management policies to fit the size you have here. (i.e. delete logs after 14 days instead of 30, etc)

### 3. Prepare Offline Resources (On the internet connected machine)
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
---
title: Install
---
# Install

## Table of Contents
1. [Quick Start](#1-quick-start)
   
2. [What is LME?](#2-what-is-lme)
   
    2.1 [Description](#21-description)

    2.2 [How Does LME Work?](#22-how-does-lme-work)

    2.3 [What Firewall Rules Do I Need to Set Up?](#23-what-firewall-rules-do-i-need-to-set-up)
   
3. [Prerequisites](#3-prerequisites)

    3.1 [Estimated Installation Times](#31-estimated-installation-times)
   
4. [Downloading and Installing LME](#4-downloading-and-installing-lme)

    4.1 [Upgrading](#41-upgrading)
   
    4.2 [Downloading LME](#42-downloading-lme)

      4.2.1 [Update System Packages](#421-update-system-packages)

      4.2.2 [Download and Extract LME](#422-download-and-extract-lme)

    4.3 [Install LME](#43-install-lme)

    4.4 [Verify Container Status](#44-verify-container-status)

    4.5 [Post-Installation Steps](#45-post-installation-steps)

    4.6 [Installing Sysmon (Windows Clients Only)](#46-installing-sysmon-windows-clients-only)
   
    4.7 [Deploying Agents](#47-deploying-agents)

   
   
5. [Next Steps](#5-next-steps)
   
     5.1 [Retrieving Passwords](#51-retrieving-passwords)
   
     5.2 [Starting and Stopping LME](#52-starting-and-stopping-lme)
   
     5.3 [Uninstall LME](#53-uninstall-lme)

    5.3.1 [Complete Uninstall](#531-complete-uninstall)

   5.3.2 [Optional Uninstall Steps](#532-optional-uninstall-steps)

     5.4 [Customizing LME](#54-customizing-lme)
   
6. [Documentation](#6-documentation)

     6.1 [Logging Guidance](#61-logging-guidance)

     6.2 [Reference](#62-reference)

     6.3 [Maintenance](#63-maintenance)

     6.4 [Agents](#64-agents)

     6.5 [Endpoint Tools](#65-endpoint-tools)
   
7. [Developer Notes](#7-developer-notes)

     7.1 [Git Clone and Git Checkout Notes](#71-git-clone-and-git-checkout-notes)

     7.2 [Installation Details](#72-installation-details)

     7.3 [Notes on Folders, Permissions, and Service](#73-notes-on-folders-permissions-and-service)

     7.4 [Other Post-Install Setup](#74-other-post-install-setup)

## 1. Quick Start

**Step 1: Install Logging Made Easy (LME)**

- Ensure that apt-get is updated/upgraded and that you have jq, curl, and unzip installed.
  ```bash
  sudo apt update && sudo apt upgrade -y && sudo apt-get install -y jq curl unzip
  ```
- Pull down the most up-to-date version of LME and unzip it.
  ```bash
  # Debian/Ubuntu:
  sudo apt update && sudo apt upgrade -y && sudo apt-get install -y jq curl

  # RedHat (comes with curl minimal):
  sudo dnf -y install jq unzip

  # Run this to download on all systems; run as regular user, not root:
  curl -s https://api.github.com/repos/cisagov/LME/releases/latest | jq -r '.assets[0].browser_download_url' | xargs -I {} sh -c 'curl -L -O {} && unzip -d ~/LME $(basename {})'

  # Move to the LME directory in the home directory of the user:
  cd ~/LME

  # Run the installer (On RedHat, if going to run in se enforcing mode, run setenforce 1 before running the installer):
  ./install.sh
  ```

**Step 2: Access LME Credentials**

- The LME installation scripts set the passwords for all LME container service accounts. To view and print the login credentials, reference [Retrieving Passwords](#51-retrieving-passwords).

**Step 3: Continue Setup**

- Navigate to the [Post-Installation Steps](#45-post-installation-steps) section and follow the next instructions.

## 2. What is LME? 

For a more detailed understanding of LME's architecture, reference the [LME Architecture Documentation](/docs/markdown/reference/architecture.md).

### 2.1 Description

LME runs on Ubuntu 22.04 and 24.04, Debian 12.10, and RedHat 9 (experimental). It uses Podman containers to provide:

- Log Management
- Endpoint Security
- Monitoring
- Alerting
- Visualization Capabilities
  
LME integrates Wazuh, Elastic, and ElastAlert. This modular, flexible architecture supports scalable log storage, real-time search, and efficient threat detection--all designed to evolve with your organization's logging needs. 

**Note: Reference the [Supported Linux Distribution documentation](https://cisagov.github.io/lme-docs/docs/markdown/reference/change-me/) for more information on recommended Linux distributions for installing LME.**

### 2.2 How does LME Work?

Understanding LME from a user perspective involves three key components:

![diagram](/docs/imgs/lme-architecture-v2.png) 

- **Collecting**: Logs are collected via agents
  
  - **Wazuh Agents**: Enables Endpoint Detection and Response (EDR) on client systems, providing advanced security features (e.g., intrusion detection and anomaly detection). For more information, reference the [Wazuh's Agent Documentation](https://github.com/wazuh/wazuh-agent).
    
  - **Elastic Agents**: Enhance log collection and management, allowing for greater control and customization in how data is collected and analyzed. Agents also feature a vast collection of integrations for many log types/applications. For more information, reference the [Elastic's Agent Documentation](https://github.com/elastic/elastic-agent).  
   
- **Viewing**: Logs are viewable Kibana dashboards
    
  - [Kibana](https://www.elastic.co/kibana) is the visualization and analytics interface in LME, providing users with tools to visualize and monitor log data stored in Elasticsearch.
  
  - It enables the creation of custom dashboards and visualizations, allowing users to easily track security events, detect anomalies, and analyze trends.
  
  - Kibana's intuitive interface supports real-time insights into the security posture of an organization, making it an essential tool for data-driven decision-making in LME's centralized logging and security monitoring framework.
   
- **Alerting**: Setting up notifications for log monitoring using Elastalert
  
  -  [ElastAlert](https://elastalert2.readthedocs.io/en/latest/index.html) is an open-source alerting framework, to automate alerting based on data stored in Elasticsearch.
  
  -  It monitors Elasticsearch for specific patterns, thresholds, or anomalies, and generates alerts when predefined conditions are met.
  
  -  This provides proactive detection of potential security incidents, enabling faster response and investigation.
  
  -  ElastAlert's flexible rule system allows for custom alerts tailored to your organization's security monitoring needs, making it a critical component of the LME alerting framework. 
 
### 2.3 What Firewall Rules Do I Need to Set Up?

Please reference our documentation around Cloud and firewall setup for more information on how you can [expose these ports](/docs/markdown/logging-guidance/cloud.md).

To collect logs, the following ports must be open on the LME server and accessible from all client systems:  

 - Elasticsearch: *9200*
 - Kibana: *443,5601*
 - Wazuh: *1514,1515,1516,55000,514*
 - Agent: *8220*

**Note: Kibana defaults to port 5601, but it's also configured to listen on port 443 for HTTPS access.**

## 3. Prerequisites

If you're unsure whether your system meets the prerequisites for installing LME, reference our [Prerequisites Documentation](/docs/markdown/prerequisites.md).

The main prerequisite is setting up hardware for your Ubuntu server, which should have at least:

- Two (2) processors
- 16 GB RAM
- 128 GB of dedicated storage for LME's Elasticsearch database

**For Lower-Spec Systems:**

If you need to run LME with less than 16 GB of RAM or minimal hardware:

- Reference our [Troubleshooting Guide](/docs/markdown/reference/troubleshooting.md#memory-in-containers-need-more-ramless-ram-usage) to configure Podman quadlets for reduced memory usage

- We recommend:

  - Elasticsearch: limit to 8 GB RAM
  - Kibana: limit to 4GB RAM 

**For Large Environments:**

If your server will support hundreds of clients, you'll need more resources and possibly a dedicated machine for Elasticsearch. Reference our [documentation for an expanded discussion around scaling LME](/docs/markdown/prerequisites.md#scaling-the-solution) or more information.

### 3.1 Estimated Installation Times

Here's a reference timeline based on real-world installations. Actual times may vary depending on system resources and network speed.

| Milestones 				| Time 		| Timeline 	|
| ------------- 			| ------------- | ------------- |
| Download LME 				| 0:31.49 	| 0:31.49 	|
| Set Environment 			| 0:35.94 	| 1:06.61 	|
| Installing LME Ansible Playbook 	| 4:03.63 	| 6:41.66 	|
| All Containers Active 		| 6:41.66 	| 13:08.92 	|
| Accessing Elastic 			| 0:38.97 	| 13:47.60 	|
| Deploy Linux Elastic Agent 		| 0:49.95 	| 16:41.45 	|
| Deploy Windows Elastic Agent 		| 1:32.00 	| 18:13.40 	|
| Deploy Linux Wazuh Agent 		| 1:41.99 	| 19:55.34 	|
| Deploy Windows Wazuh Agent 		| 1:55.00 	| 21:51.22 	|
| Download LME Zip on Windows 		| 2:22.43	| 24:13.65 	|
| Install Sysmon 			| 1:04.34 	| 25:17.99 	|
| Windows Integration 		 	| 0:39.93 	| 25:57.27 	|

## 4. Downloading and Installing LME

This section provides the procedures for downloading, configuring, and installing LME on a server.

**Note: Reference the [Supported Linux Distribution documentation](https://cisagov.github.io/lme-docs/docs/markdown/reference/change-me/) for more information on recommended Linux distributions for installing LME.**

### 4.1 Upgrading

If you are upgrading from an older version of LME to LME 2.0, reference our [Upgrading documentation](/docs/markdown/maintenance/upgrading.md).

### 4.2 Downloading LME

#### 4.2.1 Update System Packages

To update your package list and install the necessary tools, run:

```bash
# Debian based:
sudo apt update && sudo apt upgrade -y && sudo apt-get install -y jq curl

# Redhat based:
sudo dnf -y install jq unzip 
```

#### 4.2.2 Download and Extract LME

To download the latest release of LME and extract it to `~/LME`, run:

```bash
curl -s https://api.github.com/repos/cisagov/LME/releases/latest | jq -r '.assets[0].browser_download_url' | xargs -I {} sh -c 'curl -L -O {} && unzip -d ~/LME $(basename {})'
```

### 4.3 Install LME
 
- To change directory to the LME directory in your home directory, run:

  ```bash
  cd ~/LME
  ./install.sh
  ```
- This script will:

  - Prompt you to select an IP address for other machines to connect to
  - Attempt to auto-detect IPs, or allow you to enter one manually
  - Install Ansible (if not already installed)
  - Automatically run Ansible playbooks for your operating system 

**Note: The services may take several minutes to start. Please be patient.**

### 4.4 Verify Container Status

- To check that the containers are running and healthy, run:

  ```bash
  sudo -i podman ps --format "{{.Names}} {{.Status}}"
  ```  

- Expected output:

  ```shell
  lme-elasticsearch Up 20 minutes (healthy)
  lme-elastalert2 Up 20 minutes
  lme-wazuh-manager Up 20 minutes (healthy)
  lme-kibana Up 19 minutes (healthy)
  lme-fleet-server Up 14 minutes
  ```

**Note: The Fleet server is the last one to start and may take extra time.**

**Note: If the output differs, reference the [Troubleshooting Guide](/docs/markdown/reference/troubleshooting.md#installation-troubleshooting).**

- Navigate to the [Post-Installation Steps](#45-post-installation-steps) section and follow the next instructions.

### 4.5 Post-Installation Steps

If you encounter any issues, reference the [Post-Installation Troubleshooting Guide](/docs/markdown/reference/troubleshooting.md#post-installation-troubleshooting).

### 4.6 Installing Sysmon (Windows Clients Only)

For Windows clients, installing Sysmon is essential to obtain comprehensive logs and ensure proper data visualization in the dashboards. Follow these steps to install Sysmon on each Windows client machine:

- Download and unzip the ***LME folder*** on the Windows client.

- Run the following command in an Administrator PowerShell session from inside the unzipped folder:
  
   ```powershell
   .\scripts\install_sysmon.ps1
   ```

- To temporarily set the PowerShell script execution policy to "Unrestricted" to allow the execution of downloaded scripts (if necessary), run:
  
  ```powershell
  Set-ExecutionPolicy Unrestricted
  ```
### 4.7 Deploying Agents 

To populate the dashboards with data, you need to install agents. Detailed guides for deploying Wazuh and Elastic agents are available in the following documents:

 - [Deploy Wazuh Agent](/docs/markdown/agents/wazuh-agent-management.md)
   
 - [Deploying Elastic-Agent](/docs/markdown/agents/elastic-agent-management.md)


## 5. Next Steps

Reference the [Documentation section](#6-documentation) for additional information.

### 5.1 Retrieving Passwords

- To navigate to the **LME directory**, run:

  ```bash
  cd ~/LME
  ```

- To view the service user passwords, run:
  
  ```bash
  ./scripts/extract_secrets.sh -p
  ```

**NOTE: Manually changing these passwords in the encrypted file, or via others means (i.e., manually changing the elastic logon password in Kibana) will break connectivity between containers.**

For more information on passwords, reference the [Password Encryption documentation](/docs/markdown/reference/passwords.md).

### 5.2 Starting and Stopping LME

To manage the LME services, run the following commands:

- **Stop all LME services:**
  
  ```bash
  sudo -i systemctl stop lme.service
  ```

- **Restart all LME services:**
  
  ```bash
  sudo -i systemctl restart lme.service
  ```

- **Start all LME services:**
  
  ```bash
  sudo -i systemctl start lme.service
  ```

### 5.3 Uninstall LME

**Note: Dependencies will not be removed. You can consult the Ansible scripts to identify and remove the installed dependencies and created directories if desired.**
 
 <span style="color:red">**Warning: This will delete all LME data and services.**</span>

#### 5.3.1 Complete Uninstall

To do a complete uninstall, run the following commands:

- **Stop LME services:**
  ```bash
  sudo systemctl stop lme*
  ```

- **Reset systemd service states:**
  ```bash
  sudo systemctl reset-failed
  ```

- **Remove all Podman volumes:**
   
  ```bash
  sudo -i podman volume rm -a
  ```

- **Remove all Podman secrets:**
  
  ```bash
  sudo -i podman secret rm -a
  ```

- **Delete LME directories:**
  
  ```bash
  sudo rm -rf /opt/lme /etc/lme /etc/containers/systemd
  ```

- **Reset Podman:**
  
  <span style="color:red">**Warning: Do not run this if you have other Podman containers).**</span> 
  
  ```bash
  sudo -i podman system reset --force
  ```

  <span style="color:red">**Warning: This will delete all LME data and services.**</span>

#### 5.3.2 Optional Uninstall Steps

For optional uninstall steps, run the following commands:

- **Stop LME services:**
  
  ```bash
  sudo systemctl stop lme*
  sudo systemctl disable lme.service
  sudo -i podman stop $(sudo -i podman ps -aq)
  sudo -i podman rm $(sudo -i podman ps -aq)
  ```

- **Delete LME volumes:**
  
   - To delete only LME volumes:
     
     ```bash
     sudo -i podman volume ls --format "{{.Name}}" | grep lme | xargs podman volume rm
     ```
  
   - To delete all volumes:
     
     ```bash
     sudo -i podman volume rm -a
     ```
 
### 5.4 Customizing LME

LME is actively maintained and regularly updated with new features and community-requested improvements. Below are a few common customization options to help tailor your LME deployment to your organization's specific needs:

- [Alerting](/docs/markdown/maintenance/elastalert-rules.md) - custom notifications for triggered alerts using elastalert2
- [Active Response](/docs/markdown/agents/wazuh-active-response.md) - create custom Wazuh active response actions to automatically respond to a malicious event Wazuh detects. 
- [Backups](/docs/markdown/maintenance/backups.md) - customize backups of logs for your organizations own compliance needs.
- [Custom log types](/docs/markdown/agents/elastic-agent-management.md#lme-elastic-agent-integration-example) - use elastic agents built in [integrations](https://www.elastic.co/guide/en/integrations/current/index.html) ingest a log type specific to your organization.
 
## 6. Documentation

### 6.1 Logging Guidance

 - [LME in the Cloud](/docs/markdown/logging-guidance/cloud.md)
 - [Retention Settings](/docs/markdown/logging-guidance/retention.md)
 - [Filtering Logs in LME Cloud](/docs/markdown/logging-guidance/filtering.md)

### 6.2 Reference

 - [FAQ](/docs/markdown/reference/faq.md) 
 - [Dashboard Descriptions](/docs/markdown/reference/dashboard-descriptions.md)
 - [LME Security Model](/docs/markdown/reference/security-model.md)
 - [Architecture](/docs/markdown/reference/architecture.md)
 - [Configuring LME](/docs/markdown/reference/configuration.md)
 - [Password Encryption](/docs/markdown/reference/passwords.md)
 - [Troubleshooting LME Install](/docs/markdown/reference/troubleshooting.md)

### 6.3 Maintenance

 - [ElastAlert2 Rule Writing](/docs/markdown/maintenance/elastalert-rules.md)
 - [Backing Up LME Logs](/docs/markdown/maintenance/backups.md)  
 - [Certificates](/docs/markdown/maintenance/certificates.md) 
 - [Encryption at Rest](/docs/markdown/maintenance/Encryption_at_rest_option_for_users.md)
 - Data management:
   - [Elasticsearch Index Lifecycle Management](/docs/markdown/maintenance/index-management.md)
   - [Podman Volume Management](/docs/markdown/maintenance/volume-management.md)
 - Upgrading:
   - [Upgrading 1x -> 2x](/docs/markdown/maintenance/upgrading.md) 
   - [Upgrading Future 2.x](/docs/markdown/maintenance/upgrading.md)

### 6.4 Agents

 - [Elastic Agent Management - Enrollment Guide](/docs/markdown/agents/elastic-agent-management.md)
 - Wazuh:
   - [Wazuh Configuration Management](/docs/markdown/maintenance/wazuh-configuration.md)
   - [Example Setup for Wazuh Active Response](/docs/markdown/agents/wazuh-active-response.md)
   - [LME Wazuh Agent Enrollment Guide](/docs/markdown/agents/wazuh-agent-management.md)
    
### 6.5 Endpoint Tools

To make best use of the agents, complement them with utilities that generate forensically relevant data to analyze and support detections. Consider adding them to Windows/Linux.

- **Windows**
  - [Installing Sysmon on Windows Machines (manual install)](/docs/markdown/endpoint-tools/install-sysmon.md)
    
- **Linux**
  - [Installing and Configuring Auditd on Linux Systems](/docs/markdown/endpoint-tools/install-auditd.md)

## 7. Developer Notes

### 7.1 Git Clone and Git Checkout

- Git clone and git checkout your development branch on the server:

  ```bash
  git clone https://github.com/cisagov/LME.git
  cd LME
  git checkout YOUR_BRANCH_NAME_HERE
  ```

- Once you've gotten your changes/updates added, please submit a pull request following our [Guidelines](/CONTRIBUTING.md)

### 7.2 Non-Default Installation

- If you installed LME in a custom directory, pass the `CLONE_DIRECTORY` variable to the playbook by running:

  ```bash
  ansible-playbook ./ansible/install_lme_local.yml -e "clone_dir=/path/to/clone/directory" 
  ```

**Note: If you have issues accessing a file or directory, please note permissions and notes on folder structure [here](#74-notes-on-folders-permissions-and-service)**.

- This also assumes your user can sudo without a password. If you need to input a password when you sudo, run the following command with the `-K` flag and it will prompt you for a password:
   
  ```bash
  ansible-playbook -K ./ansible/install_lme_local.yml -e "clone_dir=/path/to/clone/directory" 
  ```

- In the `BECOME password` prompt, enter the ***password*** for your user you would normally give `sudo`, so the playbook is able to sudo as expected.

### 7.3 Installation Details

Below we've documented in more detail what exactly occurs during the installation and post-installation ansible scripts:

- Setup **/opt/lme** and check for **sudo access**.
- Configure **other required directories/files**.
- **Setup password information**: Configures the password vault and other configurations for the service user passwords.  
- **Setup [NixOS](https://nixos.org/)**: nix is the open source package manager we use to install the latest version of Podman.
- **Set service user passwords**: Sets the service user passwords that are encrypted according to the [LME Security Model](/docs/markdown/reference/security-model.md).
- **Install Quadlets**: Installs quadlet files in the directories to be setup as systemd services.
- **Setup Containers for root**: The containers listed in `$clone_directory/config/containers.txt` will be pulled and tagged.
- **Start lme.service**: Kicks off the start of LME service containers.

### 7.3 Folders, Permissions, and Service

- `/opt/lme` will be owned by root. All LME services will run and execute as unprivileged users. The active LME configuration is stored in `/opt/lme/config`. 

  - To access any file at `/opt/lme/`, you'll need to make sure you're in a root shell (e.g. `sudo -i su`) or you run whatever command you're wanting to access in that directory as root (e.g. `sudo ls /opt/lme/config`).
 
- Other relevant directories are listed here:
  
  - `/root/.config/containers/containers.conf`: LME will setup a custom Podman configuration for secrets management via [Ansible Vault](https://docs.ansible.com/ansible/latest/cli/ansible-vault.html)
  - `/etc/lme`: Storage directory for the master password and user password vault
  - `/etc/lme/pass.sh`: the master password file
  - `/etc/containers/systemd`: Directory where LME installs its quadlet service files
  - `/etc/systemd/system`: Directory where lme.service is installed
 
- The master password will be stored in `/etc/lme/pass.sh` and owned by root, while service user passwords will be stored in `/etc/lme/vault/`

- `lme.service` is a kick start systemd service. It will always succeed and is designed so that the other lme services can be stopped and restarted by stopping/restarting `lme.service`.

   - **To stop all of LME:**
    
     ```bash
     sudo -i systemctl stop lme.service
     ```

   - **To restart all of LME:**
    
     ```bash
     sudo -i systemctl restart lme.service
     ```

   - **To start all of LME:**
    
     ```bash
     sudo -i systemctl start lme.service
     ```

### 7.4 Other Post-Install Setup 

A few final steps are required to complete your setup:

- Configure Elastic Fleet
- Address minor Wazuh issues (this will be automated in a future release)
- Set up custom LME dashboards
- Set up Wazuh's dashboards
- Enable a read-only user role for analysts to connect and query LME data

Luckily, we've included a post-install script to streamline these steps. Before running it, ensure your Podman containers are up and healthy by running the following command:

```bash
sudo -i podman ps --format "{{.Names}} {{.Status}}"
```

The expected output:

```bash
lme-elasticsearch Up 49 minutes (healthy)
lme-wazuh-manager Up 48 minutes
lme-kibana Up 36 minutes (healthy)
lme-fleet-server Up 35 minutes
```

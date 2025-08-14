---
title: Developer Guide
---
# Developer Guide

This section is intended for contributors and developers working on LME's source code, not for general installation or operational use. It provides guidance on settting up a local development environment, understanding
the code structure, building and testing components, and following contribution standards.

### Git Clone and Git Checkout

- Git clone and git checkout your development branch on the server:

  ```bash
  git clone https://github.com/cisagov/LME.git
  cd LME
  git checkout YOUR_BRANCH_NAME_HERE
  ```

- Once you've gotten your changes/updates added, please submit a pull request following our [Contributing Guidelines](https://github.com/cisagov/LME/blob/main/CONTRIBUTING.md).

### Non-Default Installation

- If you installed LME in a custom directory, pass the `CLONE_DIRECTORY` variable to the playbook by running:

  ```bash
  ansible-playbook ./ansible/install_lme_local.yml -e "clone_dir=/path/to/clone/directory" 
  ```

**Note:** If you have issues accessing a file or directory, please note permissions and notes on folder structure in section 7.4 below.

- This also assumes your user can sudo without a password. If you need to input a password when you sudo, run the following command with the `-K` flag and it will prompt you for a password:
   
  ```bash
  ansible-playbook -K ./ansible/install_lme_local.yml -e "clone_dir=/path/to/clone/directory" 
  ```

- In the `BECOME password` prompt, enter the ***password*** for your user you would normally give `sudo`, so the playbook is able to sudo as expected.

### Installation Details

Below we've documented in more detail what exactly occurs during the installation and post-installation ansible scripts:

- Setup **/opt/lme** and check for **sudo access**.
- Configure **other required directories/files**.
- **Setup password information**: Configures the password vault and other configurations for the service user passwords.  
- **Setup [Nix](https://nixos.org/)**: nix is the open source package manager we use to install the latest version of Podman.
- **Set service user passwords**: Sets the service user passwords that are encrypted according to the [Security Model](/docs/markdown/reference/security-model.md).
- **Install Quadlets**: Installs quadlet files in the directories to be setup as systemd services.
- **Setup Containers for root**: The containers listed in `$clone_directory/config/containers.txt` will be pulled and tagged.
- **Start lme.service**: Kicks off the start of LME service containers.

### Folders, Permissions, and Service

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

### Other Post-Install Setup 

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

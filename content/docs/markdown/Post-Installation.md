---
title: Post-Installation Steps
---
# Post-Installation Steps
Once LME is installed and running, there are a few essential tasks to complete before it’s fully operational and ready for daily use. This guide walks you through the key post-installation activities that ensure data is flowing into dashboards, security monitoring is configured, and your environment is tuned for your organization’s needs.
You’ll find instructions for:
- **Deploying Agents**: Installing Wazuh and Elastic agents to start collecting and forwarding logs.
- **Installing Sysmon**: Enabling richer log data from Windows clients for improved visibility.
- **Retrieving Passwords**: Accessing and managing service credentials securely.
- **Managing Services**: Starting, stopping, and restarting LME components.
- **Uninstalling LME**: Removing LME fully or partially, including dependencies and data.
- **Customizing LME**: Configuring alerting, active response, backups, and custom log types.
Completing these steps will ensure LME is not only deployed but actively monitoring, alerting, and ready to support your security operations.


### Deploying Agents 

To populate the dashboards with data, you need to install agents. Detailed guides for deploying Wazuh and Elastic agents are available in the following documents:

 - [Deploy Wazuh Agent](/docs/markdown/agents/wazuh-agent-management.md)
   
 - [Deploying Elastic-Agent](/docs/markdown/agents/elastic-agent-management.md)

### Installing Sysmon (Windows Clients Only)

For Windows clients, installing Sysmon is essential to obtain comprehensive logs and ensure proper data visualization in the dashboards. Follow these steps to install Sysmon on each Windows client machine:

- Download and unzip the ***LME folder*** on the Windows client.

- Run the following command in an Administrator PowerShell session from inside the unzipped folder. Reference the [Install Sysmon script](https://github.com/cisagov/LME/blob/main/scripts/install_sysmon.ps1):
  
   ```powershell
   .\scripts\install_sysmon.ps1
   ```

- To temporarily set the PowerShell script execution policy to "Unrestricted" to allow the execution of downloaded scripts (if necessary), run:
  
  ```powershell
  Set-ExecutionPolicy Unrestricted
  ```


### Retrieving Passwords

- To navigate to the **LME directory**, run:

  ```bash
  cd ~/LME
  ```

- To view the service user passwords, run:
  
  ```bash
  ./scripts/extract_secrets.sh -p
  ```

**Note:** Manually changing these passwords in the encrypted file, or via others means (i.e., manually changing the elastic logon password in Kibana) will break connectivity between containers.

For more information about passwords, reference the [Password Encryption Section](/docs/markdown/reference/passwords.md).

### Starting and Stopping LME

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

### Uninstalling LME
The steps below cover options for completely uninstalling LME and also provides steps for a partial uninstall.

**Note:** Dependencies will not be removed. You can consult the Ansible scripts to identify and remove the installed dependencies and created directories if desired.
 
 <span style="color:red">**Warning: This will delete all LME data and services.**</span>

#### Complete Uninstall

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

#### Optional Uninstall Steps

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


### Troubleshooting

If you encounter any issues, reference the [Post-Installation Troubleshooting Guide](/docs/markdown/reference/troubleshooting.md#post-installation-troubleshooting).
 

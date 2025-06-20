---
title: LME Wazuh Agent Enrollment Guide
---
# LME Wazuh Agent Enrollment Guide

Reference the [Wazuh Agent Install Documentation](https://documentation.wazuh.com/4.7/installation-guide/wazuh-agent/index.html) for official Wazuh installation information.

This guide walks you through the process of enrolling a Wazuh agent in the Logging Made Easy (LME) system.

## Important Note

Ensure that the Wazuh agent version you're installing is not newer than your Wazuh manager version, as this can lead to compatibility issues.

## Variables

Throughout this guide, the following variables will be used. Replace them with your specific values:

- `{WAZUH_AGENT_VERSION}` - the version of the Wazuh agent you're installing (e.g., 4.9.0-1).
- `{WAZUH_MANAGER_IP}` - the IP address of your Wazuh manager (e.g., 10.0.0.2).
 
To determine the version of Wazuh currently running on your system, run:

```bash
sudo -i podman exec -it lme-wazuh-manager /var/ossec/bin/wazuh-control -j info | jq
```

The output should look similar to this:

```json
{
  "error": 0,
  "data": [
    {
      "WAZUH_VERSION": "v4.7.5"
    },
    {
      "WAZUH_REVISION": "40720"
    },
    {
      "WAZUH_TYPE": "server"
    }
  ]
}
```
- When using the Wazuh agent version variable, **remove the v** and **add -1** at the end, as expected by Wazuh (e.g., `4.7.5-1`).
- You can verify the version's accuracy by cross-referencing it with Wazuh's [List of Versions](https://documentation.wazuh.com/current/installation-guide/packages-list.html).

## Steps to Enroll a Wazuh Agent (***Windows***)

1. **Download the Wazuh Agent**
   - Download the **Wazuh agent Microsoft Installer** (MSI) from the following URL:
     
     ```
     https://packages.wazuh.com/4.x/windows/wazuh-agent-{WAZUH_AGENT_VERSION}-1.msi
     ```
     
   - Replace `{WAZUH_AGENT_VERSION}` with the ***appropriate version number***.
   - Alternatively, use this **PowerShell command**:
     
     ```powershell
        # Replace the values with the values you have above
        # where {WAZUH_AGENT_VERSION}=4.7.5
        # where {WAZUH_MANAGER_IP}=10.1.0.5
        Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.5-1.msi -OutFile wazuh-agent-4.7.5-1.msi;`
        Start-Process msiexec.exe -ArgumentList '/i wazuh-agent-4.7.5-1.msi /q WAZUH_MANAGER="10.1.0.5"' -Wait -NoNewWindow
        ```

2. **Install the Wazuh Agent**
   - Open a **command prompt** with administrator privileges.
   - Navigate to the ***directory containing the downloaded MSI file***.
   - Install the agent by running:
     
     ```powershell
     wazuh-agent-{WAZUH_AGENT_VERSION}.msi /q WAZUH_MANAGER="{WAZUH_MANAGER_IP}"
     ```
   - Replace `{WAZUH_AGENT_VERSION}` with the ***version you downloaded***.
   - Replace `{WAZUH_MANAGER_IP}` with the ***IP address of your Wazuh manager***.

3. **Verify Installation**
   - After installation, the Wazuh agent service should start automatically.
   - You can verify the service status in the Windows Services manager.
   - Ensure the service starts. If it doesn't start automatically, open PowerShell and mannually run:
     
     ```powershell
     NET START Wazuh
     ```


## Steps to Enroll a Wazuh Agent (***Debian-Based Systems***)

1.  **Open a command prompt**
    - Open a **command prompt** with administrator privileges.

2.  **Add Wazuh GPG Key**

    Add the Wazuh GPG key by running:

    ```bash
    curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
    ```

4. **Add Wazuh Repository**

  Add the Wazuh repository by running:
   
   ```bash
   echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee -a /etc/apt/sources.list.d/wazuh.list
   ```

5. **Update Package Information**

   Update the package information by running:
   
   ```bash
   apt-get update
   ```

6. **Install Wazuh Agent and Configure Wazuh Manager IP Variable**
   
   Install the Wazuh agent and configure Wazuh manager IP variable by running:
   
   ```bash
   WAZUH_MANAGER="{WAZUH_MANAGER_IP}" apt-get install wazuh-agent={WAZUH_AGENT_VERSION} && sed -i 's/MANAGER_IP/{WAZUH_MANAGER_IP}/i' /var/ossec/etc/ossec.conf
   ```
   
   For example:
   
   ```bash
   WAZUH_MANAGER=10.0.0.15 apt-get install wazuh-agent=4.7.5-1 && sed -i 's/MANAGER_IP/10.0.0.15/i' /var/ossec/etc/ossec.conf
   ```

## Verifying Installation

After installation, verify the ***status of the Wazuh agent service*** by running:

```bash
systemctl status wazuh-agent
```

## Troubleshooting

If the Wazuh agent doesn't start, run: 

```bash
systemctl daemon-reload
systemctl enable wazuh-agent
systemctl start wazuh-agent
```

- If the agent fails to connect, verify your ***firewall settings*** to ensure the necessary ports are open. Reference the [Wazuh Ports Documentation](https://documentation.wazuh.com/current/getting-started/architecture.html) for more information.
- Verify that the ***Wazuh manager IP address*** is correct and reachable from the agent. This is the IP address of your LME server running the containers.

By following these steps, you should be able to successfully enroll Wazuh agents into your LME system. Remember to keep your agents updated, but always ensure compatibility with your Wazuh manager version.


# Verifying Wazuh Agent Status

This guide provides the steps to check the status of Wazuh agents in the LME setup. These commands can be run from the host system without needing to execute into the container.

## Listing All Agents and Their Status

To get an overview of all registered agents and their current status, run:

```bash
sudo -i podman exec lme-wazuh-manager /var/ossec/bin/agent_control -l
```

This command will display a list of all agents, including the ID, name, IP address, and current status (e.g., active, disconnected, never connected).

## Checking Status of a Specific Agent

To check the detailed status of a specific agent, run:

```bash
sudo -i podman exec lme-wazuh-manager /var/ossec/bin/agent_control -i [agent_id]
```

Replace `[agent_id]` with the ID of the agent you want to check. This will provide more detailed information about the agent, including its last keep alive time, version, and operating system.


This command gives you a quick overview of how many agents are active, disconnected, or never connected.

Reference [Agent_Control](https://documentation.wazuh.com/current/user-manual/reference/tools/agent-control.html) for more information on the agent_control program.

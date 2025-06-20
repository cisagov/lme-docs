---
title: Example Setup for Wazuh Active Response
---
# Example Setup for Wazuh Active Response

This guide summarizes how to configure Wazuh's active response to defend against Secure Shell (SSH) brute-force attacks.

## Overview

Wazuh can automatically block IP addresses attempting SSH brute-force attacks using its active response module. This feature executes scripts on monitored endpoints when specific triggers occur.

## Configuration Steps

1. **Verify Default Script**
   - Check for `firewall-drop` script in `/var/ossec/active-response/bin/` on Linux/Unix systems.

2. **Configure Command in wazuh_manager.conf**

   Note: This command (firewall-drop) already exists. However, you can create custom scripts located in the active response/bin path and add new command entries in the .conf located at wazuh_manager.conf located at: /opt/lme/config/wazuh_cluster/wazuh_manager.conf



   ```xml
   <command>
     <name>firewall-drop</name>
     <executable>firewall-drop</executable>
     <timeout_allowed>yes</timeout_allowed>
   </command>
   ```

3. **Set Up Active Response**

   - Locate the **active-response options here section** in the .conf file.
   - Copy and paste the full ***configuration block*** below that commented line. You can continue to add more active response configs below this entry.
     
   ```xml
   <active-response>
     <command>firewall-drop</command>
     <location>local</location>
     <rules_id>5763</rules_id>
     <timeout>180</timeout>
   </active-response>
   ```
   - This configures a local response, triggering on rule 5763 (SSH brute-force detection) with a 180-second block.

4. **Restart Wazuh Manager**
   ```bash
   podman restart lme-wazuh-manager
   ```

## How It Works

- When rule 5763 triggers (detecting SSH brute-force attempts), the `firewall-drop` script executes.
- The script uses iptables to block the attacker's IP address for the specified timeout period.
- Wazuh logs this action in `/var/ossec/logs/active-responses.log`.

## Monitoring

- The Wazuh dashboard displays alerts when rule 5763 triggers and when an active response occurs.
- The active response alert is typically associated with rule ID 651. These alerts will be displayed in Kibana in the Wazuh alerts dashboard.

## Testing

- Use a tool (e.g., Hydra) to simulate a brute-force attack, or SSH into the machine repeatedly until it triggers. You will need eight failed SSH attempts to trigger the brute-force rule. (This threshold can be adjusted in the ruleset manually.)
- Verify that the attacker's IP is blocked by attempting to ping the target machine.

## Custom Responses

- You can create custom scripts for different actions.
- For custom scripts, ensure you create corresponding rules to analyze the generated logs.

This setup provides an automated defense against SSH brute-force attacks, enhancing the security of your Linux/Unix systems monitored by Wazuh.

Reference the [Wazuh Ruleset](https://github.com/wazuh/wazuh/tree/master/ruleset/rules) for a list of Wazuh rules that trigger.

Consult Wazuh documentation for more on active response configuration.

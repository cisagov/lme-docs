---
title: Wazuh Configuration Management
---
# Wazuh Configuration Management

## Managing the Wazuh Configuration File

The Wazuh manager configuration file in the LME setup is located at:

```bash
/opt/lme/config/wazuh_cluster/wazuh_manager.conf
```

This file is mounted into the Wazuh Manager container when running in Podman.

### Editing the Configuration File

- Open the ***file*** with your preferred text editor (you may need sudo privileges) by running:
  
   ```bash
   sudo nano /opt/lme/config/wazuh_cluster/wazuh_manager.conf
   ```

- Update the ***relevant sections***. Common configuration areas include:
  
   - **`<global>`**: Set global settings for Wazuh
   - **`<ruleset>`**: Define rules and decoders
   - **`<syscheck>`**: File integrity monitoring settings
   - **`<rootcheck>`**: Rootkit detection settings
   - **`<wodle>`**: Wazuh modules configuration

- Save the ***changes*** and exit the editor.

### Applying Configuration Changes

After editing the configuration file, restart the **Wazuh Manager service** for the changes to take effect.

- Restart the **Wazuh Manager service** container by running:
  
   ```bash
   podman restart lme-wazuh-manager
   ```

   Or with systemctl by running:

   ```bash
   sudo systemctl restart lme-wazuh-manager.service
   ```

- Verify the ***status of the Wazuh Manager service*** to ensure it started successfully by running:
  
   ```bash
   podman logs lme-wazuh-manager
   ```

This command will validate your configuration and report any errors.

### Best Practices

- Always backup the **configuration file** before making changes by running:
  
   ```bash
   sudo cp /opt/lme/config/wazuh_cluster/wazuh_manager.conf /opt/lme/config/wazuh_cluster/wazuh_manager.conf.bak
   ```

- Provide ***comments*** within the configuration file to document your changes and explain customizations.

- Test **configuration changes** in a non-production environment before applying them to your production setup.

- Regularly review and update your Wazuh configuration to ensure it aligns with your current security needs and policies.

**Note: Reference the official [Wazuh documentation](https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/index.html) for detailed information on all available configuration options.**

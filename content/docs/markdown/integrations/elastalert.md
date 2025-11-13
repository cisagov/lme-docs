---
title: Elastalert2 for Kibana Security Notifications
---

# ElastAlert2 Integration to Notify on Kibana Security Alerts Quick Setup Guide

This guide walks you through integrating Logging Made Easy's (LME's) ElastAlert2 with Kibana to send notifications for every alert that occurs. Once set up, you can fine-tune alerts directly within Kibana's built-in alerting system--no need to modify ElastAlert2 further. 

To understand how this works, reference the [ElastAlert Rules document](/docs/markdown/maintenance/elastalert-rules).

## What You'll Get

Your LME deployment comes with built-in monitoring for Kibana detection alerts. This integration continuously watches the `.alerts-security.alerts-*` index pattern to keep you informed of security events.

## Why This Matters

Kibana Security Solution works behind the scenes to detect suspicious or malicious activity in your infrastructure. When it identifies something concerning, it generates detailed alerts that contain:

- Threat detection results
- Rule violations
- Security event details
- Source and target information

With this integration, your team receives immediate notifications about potential threats--eliminating the need to constantly check Kibana manually. This enables faster incident response and reduces overall security risk.

## Why ElastAlert2?

While Elastic requires a paid license to send native security alerts to external services (i.e., Slack, Teams, Email), ElastAlert2 provides this functionality as a free alternative.

## Setting Up Your Notification Channels

All configuration files are located in: ```/opt/lme/config/elastalert2/rules/```

## Prerequisite Steps

Enable some rules in Kibana Security. In this example, we are enabling Windows alerts.

1. In Kibana, navigate to **Menu -> Security -> Rules**.
   
2. Click on **Detection Rules**.
   
3. Click on the **Tags drop-down menu**, and then type **OS:Windows**.

4. Click on **OS:Windows**.
   
5. Click on **all matching rules** (e.g., Select all 495 rules or however many appear).
   
6. Click on **Bulk Actions - Enable**.
    
7. Adjust ***rules*** as necessary. From here you can:

   - Enable rules for other operating systems
     
   - Disable rules based on severity

   - Tune rules based on your environment

   These are the rules ElastAlert2 will monitor for triggering notifications.

## Enable Notifications - 4 Simple Steps

1. Edit the **main configuration file** by running:
     
   ```bash
   nano /opt/lme/config/elastalert2/rules/kibana_alerts.yml
   ```

2. Uncomment ***your preferred notification method*** in the import section by running:
   
   ```yaml
   import:
   # - "slack_alert_config.yaml"
   # - "email_alert_config.yaml"
   # - "teams_alert_config.yaml"
   # - "twilio_alert_config.yaml"
   ```  

3. Edit the ***corresponding configuration file(s)*** for your chosen notification methods (e.g., slack_alert_config as described below).  

4. Restart the ***service*** by running:

   ```bash
   sudo systemctl restart lme-elastalert.service
   ```

Review official ElastAlert2 documentation for other configurations.

### Available Notification Channels

- **Slack**

   - Configuration file: `/opt/lme/config/elastalert2/rules/slack_alert_config`

   - Uncomment the `- slack_alert_config` line in the `import:` section of the kibana_alerts.yml file.

   - Update the `slack_webhook_url` with your Slack webhook URL

- **Email**

   - Configuration file: ```/opt/lme/config/elastalert2/rules/email_alert_config```

   - Uncomment the `- "email_alert_config"` line in the `import:` section of the kibana_alerts.yml file

   - Update your SMTP authentication details in this file and credentials in ```/opt/lme/config/elastalert2/misc/smtp_auth.yml```

- **Microsoft Teams**

   - Configuration file: ```/opt/lme/config/elastalert2/rules/teams_alert_config```

   - Uncomment the `- "teams_alert_config"` line in the `import:` section of the kibana_alerts.yml file

   - Add your MS Teams webhook URL in this file

- **SMS via Twilio**

   - Configuration file: ```/opt/lme/config/elastalert2/rules/twilio_alert_config```

   - Uncomment the `- "twilio_alert_config"` line in the `import:` section of the kibana_alerts.yml file

   - Update your Twilio authentication details

## Managing Alert Noise

While this integration monitors all Kibana security alerts, you can customize the alerts that trigger notifications to reduce noise and focus on what matters most to your organization.

### In ElastAlert2 Rule

- Filter by Critical and High only by running:

  ```yaml
  # Only trigger on critical and high severity alerts
  filter:
  - query:
      query_string:
        query: "kibana.alert.severity: (critical OR high)"
  ```

- You can also adjust the trigger time in the rule in the ElastAlert2/config.yaml (e.g., adjust time from 5 minutes to 30):

  ```yaml
  run_every:
    minutes: 30
  ```

- This will still roll up all events that happened in that 30 minute timeframe, but you will only get one notification every 30 minutes.

- Reference the [ElastAlert Rules documentation](/docs/markdown/maintenance/elastalert-rules) for more query possibilities.

### In Kibana

To reduce noise within Kibana before alerts ever reach ElastAlert2:

  - **Disable Noisy Rules:**
    
    - Navigate to: **Kibana → Security → Rules → Detection Rules**.
   
    - This will disable rules that consistently generate false positives or irrelevant alerts.
  
  - **Create Exceptions:**
  
    - Add rule exceptions for known legitimate activity in your environment (e.g., expected logon behavior, internal scanning).
  
  - **Tune Rule Parameters:**
  
     - Adjust thresholds, field filters, and rule logic in Kibana to better reflect your environment before triggering ElastAlert2.

This approach allows you to fine-tune detection coverage inside Kibana while using ElastAlert2 solely as your alert delivery mechanism.

Reference the [ElastAlert Rules documentation](/docs/markdown/maintenance/elastalert-rules) if you want even more advanced control.

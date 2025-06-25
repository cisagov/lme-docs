---
title: Elasticsearch Index Lifecycle Management
---
# Elasticsearch Index Lifecycle Management

This page explains how Elasticsearch uses Index Lifecycle Management (ILM) to manage data over time. ILM helps control index storage costs and performance by automatically transitioning data through different phases based on age and usage.

## Overview

Elasticsearch organizes index data through the following four lifecycle phases:

- Hot Phase
   - Contains the newest data
   - Most active: frequent updates and searches
   - Requires the fastest access

- Warm Phase
   - Contains older data
   - Less active: fewer updates, still searched
   - Can be moved to slightly slower storage

- Cold Phase
   - Contains the oldest data
   - Rarely accessed and not updated
   - Can be on slowest storage

- Delete Phase
   - Data is no longer needed
   - Removed from the system

Data transitions through these phases based on rules defined in the Index Lifecycle Policy.

## Creating an Index Lifecycle Policy

### Wazuh Indexes Lifecycle Policy in Elasticsearch

You can define a lifecycle policy in Kibana to apply to Wazuh indices.

- Log in to **Kibana**.
  
- Navigate to **Menu -> Dev Tools**.
  
- Copy and run the ***following code*** to create a basic ILM policy:

  ```bash
  PUT _ilm/policy/wazuh_alerts_cleanup_policy
  {
    "policy": {
      "phases": {
        "hot": {
          "min_age": "0ms",
          "actions": {}
        },
        "delete": {
          "min_age": "30d",
          "actions": {
            "delete": {}
          }
        }
      }
    }
  }
  ```

  This creates a simple policy with Hot, Warm, and Delete phases. It will look like this in Kibana:
  
  ![image](https://github.com/user-attachments/assets/962c3f8e-4a7b-4037-beaf-ea2e597fbe2d)

- Apply ***this policy*** to a template: 

  ```bash
  PUT _index_template/wazuh_alerts_template
  {
    "index_patterns": ["wazuh-alerts-4.x-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "wazuh_alerts_cleanup_policy"
      }
    }
  }
  ```

- Apply ***the policy*** to existing indices:
  
  ```bash
  PUT wazuh-alerts-4.x-*/_settings
  {
    "index.lifecycle.name": "wazuh_alerts_cleanup_policy"
  }
  ```

- This will create a policy, create a template that applies this policy to all new indices, and then also apply the policy to existing Wazuh indices.

**Note: This is an example that will delete Wazuh indices after 30 days. Adjust as needed.**

### Elastic Endpoint Lifecyle Policy

Elastic agents manage lifecycle with a default policy, typically named `logs` or `metrics`.

To review or modify it:

- Navigate to **Stack Management -> Index Lifecycle Policies**.
  
- In the upper-right corner, enable **Include managed system policies**.

- Search for **`logs`**.

- Click to open and edit ***the policy***.

**Note: You may see a warning that editing a managed policy can break Kibana. This is normal; as long as your phase definitions are valid, you can proceed.** 

### Policy Behavior and Rollover

- By default, the system rolls over when an index is either:

  - 30 days old
  
  - Exceeds 50 GB
  
- A rollover means a new index is created and the previous one is retained but no longer "active" (e.g., logs-00001 rolls over to logs-00002, 00001 remains).

### Customizing the Lifecycle

You can customize Hot, Warm, Cold, and Delete phases as needed. For example:

- Set your **Hot**, **Warm**, and **Cold phases** to suit your access needs

- Enable **Cold phase** for long-term, rarely acccessed data

- Click on the **trash can** to turn on the Delete phase

- Enable **Delete phase** only after confirming data is no longer needed

- After you apply changes, allow **some time** for them to take effect across your indices

### Final Tips

- You may skip lifecycle automation and delete indices manually via the Kibana UI as you see fit or when needed.

- By default your rollover policy is set for 30 days.

<span style="color:orange">**Warning: Do not set your Delete phase to be shorter than your rollover phase. You need your active indices to rollover into inactive indices before you delete them.**</span>


---
title: Overview
---
#  What is LME? 
Logging Made Easy (LME) is a no cost, open source platform that centralizes log collection, enhances threat detection, and enables real-time alerting, helping small to medium-sized organizations secure their infrastructure. 

For a more detailed understanding of LME's architecture, reference the [LME Architecture Documentation](/docs/markdown/reference/architecture.md).

### Description

LME runs on Ubuntu 22.04 and 24.04, and Debian 12.10 (experimental). It uses Podman containers to provide:

- Log Management
- Endpoint Security
- Monitoring
- Alerting
- Visualization Capabilities
  
LME integrates Wazuh, Elastic, and ElastAlert. This modular, flexible architecture supports scalable log storage, real-time search, and efficient threat detection--all designed to evolve with your organization's logging needs. 

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

Larger environments often benefit from dedicated Elasticsearch resources and additional nodes to handle increased data volume, query load, and retention requirements. If you expect your LME deployment to support hundreds or thousands of endpoints or require longer data retention, you may need to scale beyond LME's default single-node Elasticsearch setup. 

Note: LME does not currently automate multi-node scaling. You must follow Elastic’s self-hosted deployment guidance to plan, add, configure, and manage additional nodes.
For detailed guidance, see Elastic’s official documentation:
•	Scaling considerations
•	Adding nodes to a self-managed deployment


### Customizing LME

LME is actively maintained and regularly updated with new features and community-requested improvements. Below are a few common customization options to help tailor your LME deployment to your organization's specific needs:

- [Alerting](/docs/markdown/maintenance/elastalert-rules.md): Adding custom notifications for triggered alerts using elastalert2.
- [Active Response](/docs/markdown/agents/wazuh-active-response.md): Create custom wazuh active response actions to automatically respond to a malicious event wazuh detects. 
- [Backups](/docs/markdown/maintenance/backups.md): Customize backups of logs for your organizations own compliance needs.
- [Custom log types](/docs/markdown/agents/elastic-agent-management.md#lme-elastic-agent-integration-example): Use elastic agents built in [integrations](https://www.elastic.co/guide/en/integrations/current/index.html) ingest a log type specific to your organization.

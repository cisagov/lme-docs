---
title: Architecture
---
# Architecture

Logging Made Easy (LME) runs on Ubuntu and leverages Podman containers for security, performance, and scalability. We’ve integrated Wazuh,  Elastic, and ElastAlert open-source tools to provide log management, endpoint security monitoring, alerting, and data visualization capabilities. This modular, flexible architecture supports efficient log storage, search, and threat detection--and enables you to scale as your logging needs evolve.

**Note: For more information on supported Linux distributions, reference [Supported Linux Distributions](https://cisagov.github.io/lme-docs/docs/markdown/reference/change-me/).**

![diagram](/docs/imgs/lme-architecture-v2.png) 

## Containers
Containerization allows each component of LME to run independently, increasing system security, improving performance, and simplifying troubleshooting. 

LME uses Podman as its container engine because it is more secure (by default) against container escape attacks than Docker. It is more debug-and-developer-friendly. We’re leveraging Podman’s unique features, such as Quadlets (Podman's systemd integration) and User Namespacing, to increase system security and operational efficiency.

LME uses the following containers:

  - **Setup**: Runs `/config/setup/init-setup.sh` based on the configuration of Domain Name System (DNS) defined in `/config/setup/instances.yml`; script will create a Certificate Authority (CA), underlying certificates for each service, and initialize the admin accounts for Elasticsearch (user:`elastic`) and Kibana (user:`kibana_system`)
    
  - **Elasticsearch**: Runs LME's database and indexes all logs
    
  - **Kibana**: The front end for querying logs, visualizing data, and managing fleet agents
    
  - **Elastic Fleet-Server**: Executes an [elastic agent ](https://github.com/elastic/elastic-agent) in fleet-server mode; coordinates Elastic Agents to gather client logs and status
  
    - Configuration is inspired by the [elastic-container](https://github.com/peasead/elastic-container) project
    
  - **Wazuh-Manager**: Allows LME to deploy and manage Wazuh Agents
    
    -  Wazuh (open source) gives Endpoint Detection Response (EDR) with security dashboards to cover the security of all of the machines
      
  - **LME-Frontend** (*coming in a future release*): Will host an Application Programming Interface (API) and Graphical User Interface (GUI) that unifies the architecture behind one interface
   
## Required Ports

Ports required include:

 - Elasticsearch: ***9200***
   
 - Kibana: ***443, 5601***
   
 - Wazuh: ***1514, 1515, 1516, 55000, 514***
   
 - Agent: ***8220***

**Note: For Kibana, 5601 is the default port. We've also set Kibana to listen on 443 as well.**

## Agents and Agent Management

LME leverages both Wazuh and Elastic Agents providing more comprehensive logging and security monitoring across various log sources. The agents gather critical data from endpoints and send it back to the LME server for analysis, offering organizations deeper visibility into their security posture. We also make use of Wazuh Manager and Elastic Fleet for agent orchestration and management.

- **Wazuh Agents**: Enables EDR on client systems, providing advanced security features like intrusion detection and anomaly detection; for more information, reference [Wazuh's Agent documentation](https://github.com/wazuh/wazuh-agent)
  
- **Wazuh Manager**: Responsible for managing Wazuh Agents across endpoints, and overseeing agent registration, configuration, and data collection, providing centralized control for monitoring security events and analyzing data
  
- **Elastic Agents**: Enhance log collection and management, allowing for greater control and customization in how data is collected and analyzed. Agents also feature a vast collection of integrations for many log types/applications. For more information, see [Elastic's Agent documentation](https://github.com/elastic/elastic-agent)
  
- **Elastic Fleet**: Manages Elastic Agents across your infrastructure, providing centralized control over agent deployment, configuration, and monitoring; simplifies the process of adding and managing agents on various endpoints; supports centralized updates and policy management

## Alerting

LME has setup [ElastAlert](https://elastalert2.readthedocs.io/en/latest/index.html), an open-source alerting framework to automate alerting based on data stored in Elasticsearch. It monitors Elasticsearch for specific patterns, thresholds, or anomalies, and generates alerts when predefined conditions are met. This provides proactive detection of potential security incidents, enabling faster response and investigation. ElastAlert’s flexible rule system allows for custom alerts tailored to your organization’s security monitoring needs, making it a critical component of the LME alerting framework. 

## Log Storage and Search

As the core component for log search and storage, [Elasticsearch](https://www.elastic.co/elasticsearch) indexes and stores logs and detections collected from Elastic and Wazuh Agents, allowing for fast, real-time querying of security events. Elasticsearch enables users to search and filter large datasets efficiently, providing a powerful backend for data analysis and visualization in Kibana. Its scalability and flexibility make it essential for handling the high-volume log data generated across different endpoints within LME's architecture.

## Data Visualization and Querying

[Kibana](https://www.elastic.co/kibana) is the visualization and analytics interface in LME, providing users with tools to visualize and monitor log data stored in Elasticsearch. It enables the creation of custom dashboards and visualizations, allowing users to easily track security events, detect anomalies, and analyze trends. Kibana's intuitive interface supports real-time insights into the security posture of an organization, making it an essential tool for data-driven decision-making in LME’s centralized logging and security monitoring framework.

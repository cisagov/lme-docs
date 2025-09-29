---
title: Prerequisites
---
# Prerequisites

## IT Skills Needed to Install Logging Made Easy (LME)

LME is designed for users with experience in systems or network administration that can download LME. You're likely qualified to install LME if you have ever:

- Installed a Windows server and connected it to an Active Directory domain
  
- Configured firewall rules
  
- Installed a Linux Operating System (OS) and accessed it via Secure Shell (SSH)

We estimate that users with this background will need approximately 30 minutes of focused time to complete the entire installation process.  We have automated steps where possible and made the instructions as detailed as possible. 

### Estimated Installation Times

The following timetable is based on real-world installation sessions. These milestones reflect approximate durations to help you plan accordingly.

| Milestones 				| Time 		| Timeline 	|
| ------------- 			| ------------- | ------------- |
| Download LME 				| 0:31.49 	| 0:31.49 	|
| Set Environment 			| 0:35.94 	| 1:06.61 	|
| Install Ansible 			| 1:31.94 	| 2:38.03 	|
| Installing LME Ansible Playbook 	| 4:03.63 	| 6:41.66 	|
| All Containers Active 		| 6:41.66 	| 13:08.92 	|
| Accessing Elastic 			| 0:38.97 	| 13:47.60 	|
| Post-Install Ansible Playbook 	| 2:04.34 	| 15:51.94 	|
| Deploy Linux Elastic Agent 		| 0:49.95 	| 16:41.45 	|
| Deploy Windows Elastic Agent 		| 1:32.00 	| 18:13.40 	|
| Deploy Linux Wazuh Agent 		| 1:41.99 	| 19:55.34 	|
| Deploy Windows Wazuh Agent 		| 1:55.00 	| 21:51.22 	|
| Download LME Zip on Windows 		| 2:22.43	| 24:13.65 	|
| Install Sysmon 			| 1:04.34 	| 25:17.99 	|
| Windows Integration 		 	| 0:39.93 	| 25:57.27 	|

## High-Level Overview Diagram of the LME System Architecture

![diagram](/docs/imgs/lme-architecture-v2.png) 

Please reference the [ReadMe](/README.md#Diagram) for a detailed description of LME's architecture and its components.

## LME Costs

LME is released under a Creative Commons 0 ("CC0") license. This means the design is open-source and available at no cost to the user.

Cybersecurity and Infrastructure Security Agency (CISA)-funded government contractors provide some components with rights to use, modify, and redistribute under this license and the current license structure. Other components, including new submissions, fall under the Apache License, Version 2.0. This project (e.g., scripts, documentation) is licensed under the [Apache License 2.0 and Creative Commons 0](../../LICENSE).

The design uses open software which comes at no cost to the user. CISA will ensure that no paid software licenses are needed above standard infrastructure costs - except where Windows OS licensing may apply. Users must pay for hosting, bandwidth, and time. For an estimate of server specifications that may be needed, reference this [blog post from Elasticsearch](https://www.elastic.co/blog/benchmarking-and-sizing-your-elasticsearch-cluster-for-logs-and-metrics). You may then use your estimated server specs to determine a price for an on-premise or Cloud deployment.


## Scaling the Solution
This guide is designed for single server setups to keep things simple. However, real-world environments may need multiple servers or nodes to handle larger scale or distributed logging environments.

- We do not currently provide estimates for multi-node setups or ELK scaling
- For sizing estimates and deployment planning, reference the blog post from Elastic.

**Note: Advanced scaling requires deeper technical knowledge and experience with containerized and distributed systems. We plan to add scaling documentation in the future.** 

## Required Infrastructure for LME Installation

To begin installing LME, you will need access to the following servers, or you will need to create them:

- A client machine (or multiple) - these are the systems you'd like to monitor
  
- An Ubuntu Linux 22.04 server - this is where the LME stack (e.g., Elastisearch, Kibana) will be installed via Podman containers

We will install our database (Elasticsearch) and dashboard software on this machine. This is all taken care of through Podman containers.

### Minimum Hardware Requirements

To ensure reliable performance during installation and operation, your system must meet the following minimum hardware requirements for running LME:

   - **CPU**
     
      - Minimum - 2 processor cores
        
      - Recommended - 4+ cores
     
   - **Memory (RAM)**
     
     - Minimum - 16GB
       
     - Recommended - 32GB+  [Elastic](https://www.elastic.co/guide/en/cloud-enterprise/current/ece-hardware-prereq.html)
     
   - **Storage**
     
     - Minimum - dedicated 128GB storage for ELK (not including storage for OS and other files)
       
     - Required for LME data and OS; more is needed if supporting ~17 clients
     
       **Note: If your system has less than 16GB of RAM, reference the [troubleshooting guide](/docs/markdown/reference/troubleshooting.md#memory-in-containers-need-more-ramless-ram-usage) for more information on how to configure Podman memory quotas.**
 
   - **Suggestions**
   
     - Elastisearch at 8GB limit
       
     - Kibana at 4GB limit
		 
#### Confirm Your System Meets the Minimum Hardware Requirements

Before proceeding with the installation, use the commands below to verify that your system meets the minimum hardware requirements:

- To check the number of CPUs, run the following command:
  
  ```bash
  $ lscpu | egrep 'CPU\(s\)'
  ```
- To check your available memory, run the following command and look under the "free" column:
  
  ```bash
  $ free -h 
  total        used        free      shared  buff/cache   available
  Mem:            31Gi       6.4Gi        22Gi       4.0Mi       2.8Gi        24Gi
  Swap:             0B          0B          0B
  ```

- To check available hardware storage, run the following command (typically the /dev/root will be your main filesystem; the number of gigabytes available is in the Avail column):
  
  ```bash
  $ df -h
  Filesystem      Size  Used Avail Use% Mounted on
  /dev/root       124G   13G  112G  11% /
  ```

## Installation of Servers

Once your system meets the minimum hardware requirements, you can choose where to install the servers--whether on-premises, in a public Cloud, or in a private Cloud. It is important to plan how the client machines will connect to the LME server to ensure proper network communication.

## Firewall Rules Needed

Please reference [LME in the Cloud](/docs/markdown/loggging-guidance/cloud.md) for more information on firewalls . 

You must ensure that the client machine(s) you want to monitor can reach the main LME ports as described in the [Required Ports section](/README.md#required-ports) of the ReadMe .

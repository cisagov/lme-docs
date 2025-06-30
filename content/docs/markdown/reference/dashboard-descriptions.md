---
title: Dashboard Descriptions
---
# Dashboard Descriptions

## Prerequisites
In order for the the Logging Made Easy (LME) dashboards to display without errors, they require an Elastic Agent to be logging sysmon events from a Windows machine.

**Note: With this configuration, wait at least 30 minutes for logs to populate within Elasticsearch.**

## Purpose

LME releases new dashboards on GitHub periodically.The dashboard descriptions currently availble can be found in the following subsections. Users may also choose to create custom dashboards.

### User Human Resources  

The User Human Resources Dashboard provides a comprehensive overview of network activity and displays domains, users, workstations, activity times, and days of the week. It includes details on general logon events, logoff events, and distinguishes between in-person and remote logons. Analogous to a security guard monitoring a camera, the dashboard facilitates network monitoring by revealing overall network traffic, user locations, peak hours, and the ratio of remote-to-in-person logons. Users can filter and analyze both individual and group activity logs. 

### Computer Software Overview

The Computer Software Overview Dashboard displays application usage on host computers, logging events for application failures, hangs, and external connection attempts. Monitoring application usage is crucial for assessing network health--frequent crashes may indicate larger issues, while repeated external requests could suggest malicious activity.  

### Security Log

The Security Log Dashboard actively presents forwarded security log events, tallies failed logon attempts, identifies computers with failed logon events, specifies reasons for failed logons, and distinguishes types of logons and reports on credential status (clear text or cached). It also discloses whether the event log or Windows Security audit log is cleared, highlights user account changes, and notes the assignment of special privileges to a logon session. Users can quickly detect unusual events, prompting further investigation and remediation actions. 

### Process Explorer 

The Process Explorer Dashboard monitors network activity related to processes, users, processes user roles, files, and filenames in the download directory. It tracks system processes and registry events, offering user-friendly filtering by process names and Process Identifiers (PIDs). TThe dashboard is designed to detect abnormal activity such as unauthorized privilege elevation or installation of malware. It also highlights spikes in processes tied to specific users, which can indicate malicious behavior. 

### Sysmon Summary

The Sysmon Summary Dashboard highlights Sysmon events and summarizes event count, types, and breakdowns by event code and top hosts. It allows users to identify changes in activity levels or unusual behavior, which can aid in the early detection of security threats. 

### User Security

The User Security Dashboard provides a comprehensive view of user-based network activity. It highlights logon attempts, user logon/logoff events, logged-on computers, and detailed network connections by country and protocol. Additionally, it provides critical information such as PowerShell events, references to temporary files, and Windows Defender alerts for malware detection and actions taken.

Users can filter activity by username, domain, or host machines to narrow down their investigation. This dashboard supports effective monitoring by helping users identify suspicious behavior, assess network health, and take proactive security actions.  

### Alert

The Alert Dashboard allows users to define rules that detect complex conditions within networks or environments. It also supports automated trigger actions when such conditions are met. These alerts rely on pre-built detection rules and can be scheduled to run at specific intervals.  When triggered, the dashboard highlights the suspicious activity and the corresponding response actions that were taken.  

### HealthCheck 

The HealthCheck Dashboard allows users to monitor system health by tracking unexpected shutdowns, events per machine, and the number of logged-in admins. Data is presented based on a selected date range, heling users identify anomalies such as frequent reboots or an unusually high number of admin users.  

### Policy Changes and System Activity

The Policy Changes and System Activity Dashboard enables users to monitor policy changes and important system activity. Users will be able to monitor the status of their firewall, including when it is turned on, off, settings are changed, or exception rules are added or modified. This dashboard will also show when firewall, audit, or Kerberos policies are changed on their domain. Users will also be able to monitor when their PCs are turned on, off, and when Remote Procedure Call (RPC) connections are attempted on their domain. 

### Identity Access Management

The Identity Access Management Dashboard highlights key security events related to identity and access control. This includes changes to registry objects, scheduled tasks, and password hashes. It also tracks when passwords are reset or changed and when users are locked out of their accounts. Additionally, it shows when the default domain policy is modified and whether domain password policies are enforced. 

### Privileged Activity Log

The Privileged Activity Log Dashboard enables auditing of both sensitive and non-sensitive privileged activity. It displays the number of privileged attempts per host and counts of processess created or terminated. Users can also view assigned token creation events, which help assess privilege usage patterns across systems.

### Credential Access Log

The Credential Access Log Dashboard focuses on account logon and account logoff audit events. It includes insights into credential usage by showing explicit credential attempts, account lockouts, and validation failures. Users can view detailed breakdowns by host for login attempts, disconnections, and Kerberos authentication attempts. 




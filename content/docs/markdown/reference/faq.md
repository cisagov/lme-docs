---
title: FAQs
---

# Frequently Asked Questions

## 1. What is the Cybersecurity and Infrastructure Security Agency's (CISA’s) Logging Made Easy (LME)?

LME is a no-cost log management solution for small- to medium-sized organizations with limited resources that would otherwise have little to no functionality to detect attacks. LME offers centralized logging for Linux, macOS, and Windows operating systems, enabling proactive threat detection and enhanced security by allowing organizations to monitor their networks, identify users, and actively analyze Sysmon data to quickly detect potential malicious activity.

## 2. What Makes LME Unique?

LME stands out as an accessible, open-source log management and threat detection solution developed by CISA to support organizations with limited resources. By integrating Elastic and Wazuh in a secure, containerized stack, it provides endpoint security and real-time alerting without the complexity or cost of traditional Security Information and Event Management Systems (SIEMs). Designed with customizable dashboards and Secure by Design (SbD) principles, LME offers a user-friendly and effective solution to enhance visibility and strengthen threat detection.

## 3. What Software Drives LME?

LME is powered by Elastic Stack (for log management, search, and visualization), Wazuh (for endpoint detection and response), and Podman (for containerization). This open-source stack ensures transparency, flexibility, and scalability while providing enhanced threat detection and customizable dashboards.

## 4. Which Operating Systems Can Use LME?

LME 2.0 supports Windows, Linux, and macOS. Elastic and Wazuh agents enable compatibility across these platforms, ensuring broad coverage for monitoring and logging. While Wazuh agents also support Solaris, AIX, and HP-UX , CISA has not tested LME on endpoints running those operating systems.

## 5. Who Can Use LME?

While intended for small- to medium-sized organizations with limited resources, anyone can download and use LME. Reference **[LME 2.0 Prerequisites](/docs/markdown/prerequisites.md)** for more details on required infrastructure and hardware including CPU, memory, and storage requirements.

## 6. Can LME Run in the Cloud?

LME supports both on-premises and cloud deployments, allowing organizations to host LME on local or Cloud Service Provider (CSP) infrastructure.

## 7. Does LME 2.0 Require a New Install or an Update to Existing Installs?

Both new and existing users must complete a full install of LME 2.0. LME has an upgrade process from v1.4 -> 2.0. The upgrade uninstalls 1.4 and installs 2.0, and will reintegrate old dashboards and data into the new 2.0 deployment. Reference **[Upgrading Docs](/scripts/upgrade/README.md)** for more information on upgrading from an older version of LME to LME 2.0.

## 8. How Do I Download LME?

Detailed installation and download steps can be found in the Installation section of **[ReadMe](https://github.com/cisagov/LME/tree/lme-2-docs?tab=readme-ov-file#installing-lme)**.

## 9.   In Light of LME 2.0, Will Older Versions of LME Stop Working? 

While CISA recommends upgrading to LME 2.0, users can continue using older versions of LME; however, CISA will not support older versions. 

## 10. How Do I Transition/Migrate from Older Versions to LME 2.0 While Retaining My Log History?

For existing LME users, **[click here](/scripts/upgrade)** for easy instructions on transferring log history from previous versions. LME will automatically reintegrate your log history and data.

## 11.  Can I Transfer My Customized Dashboards? If so, How?

Yes, you can import your dashboards on Elastic from **Stack Management > Kibana > Saved Objects**, clicking **import**, and then selecting the ***custom dashboard ndjson file*** to import it into your Elastic instance. You'll need to export your old dashboards first. 

## 12. Are There New System Requirements for LME 2.0?

Although system requirements are mostly the same for LME 2.0, reference **[LME 2.0 Prerequisites](/docs/markdown/prerequisites.md)** for hardware and infrastructure recommendations.

## 13. Where Can I Receive Further Support?

For further support with LME 2.0, users can explore the following options:

- Report LME issues via the GitHub **Issues tab** at the top of the page or by clicking **GitHub Issues**.
- Navigate to **[GitHub Discussions](https://github.com/cisagov/lme/discussions)** to check if your issue has been addressed or start a new thread.
- Directly email **CyberSharedServices@cisa.dhs.gov** for other questions or comments.

## 14. Where Can I Find Additional Resources?

Reference **[CISA’s LME](https://www.cisa.gov/resources-tools/services/logging-made-easy)** website for additional resources.

## 15. Is it Possible to Install and Host LME on a Virtual Machine (VM)?

Yes, it is possible to install and host LME on a VM by following the installation steps on an Ubuntu version 22.04 VM. 

## 16. What Options are Available to Install LME on Raspberry Pi?

LME does not recommend installation on a Raspberry Pi as these devices don't typically have enough RAM to host the tool or allow for smooth functioning. 

## 17. Do You Have any Additional Resources on Setting Up Email Alerts with ElastAlert2? We Got the Email Function Working, but Copying Built-In Alerts Has Been Labor-Intensive.

Yes, LME has documentation related to **[ElastAlert Rule Writing](https://cisagov.github.io/lme-docs/docs/markdown/maintenance/elastalert-rules/)**. 

## 18. The LME Installation Guide Only Shows How to Install Agents (Elastic and Wazuh) manually. Can We Push Them Out to Multiple Hosts With Group Policy Object (GPO)? 

Yes, this is possible, but users need to configure the deployment. LME had old GPOs for LME 1.0. Adapting them for the new version would be a great community contribution.

## 19. Is There a Guide for Microsoft Installers? 

For Wazuh, users can reference the Wiki on downloading the MSI.

## 20. How Do I Use the Wazuh Incident Response Dashboard Effectively? I See a List of Rule Matches, but Can't Find a Way to Drill Down Into Them to Understand What Triggered Each Rule. How Can I Turn These Matches Into Actionable Insights? 

LME doesn't have documentation on this yet as it's a new feature. LME plans to add it in the future to provide more transparency on dashboards and guidance on setting up active response. 

## 21. Do You Have Documentation on How to Set Up a Remote Site with LME and Send the Data to the LME Running at the Primary Site for Consolidated Reporting?

No, LME does not have documentation related to consolidated reporting.

## 22. Can LME Agents Forward Logs to Multiple LME Hosts, or Would the Remote LME Host Need to Forward Logs to the Upstream LME Host? I'd Like LME Running at Multiple Offices for Local IT Use While Also Forwarding Data to the Min IT Location Running LME. 

No, LME has not explored this yet. Users can reference Wazuh or Elastic's documentation to see if it's possible. 

## 23. Is There an LME Chat Like Discord or Slack? 

No, this isn't currently supported, but LME is actively exploring it. Users are encouraged to post questions in **[GitHub Discussions](https://github.com/cisagov/lme/discussions)** to connect with the LME community and others with similar experiences. 

## 24. Are There Instructions on Keeping the Containers Up to Date or Are They Locked to a Specific Version?

The containers are currently locked; however, LME is exploring the possibility of updating them for future releases. 

## 25. Can LME Send Text Alerts Along with Email Alerts? 

This could be possible with a Twilio account. Users are encouraged to review the ElastAlert documentation.

## 26. Should I Update Ubuntu if I'm Running LME?

Updating Ubuntu is at the discretion of the user; however, LME 2.0.2 has been successfully tested with Ubuntu 22.04 and 24.04. 

## 27. Does Upgrading Ubuntu Impact LME Stability or Performance?

When Testing Ubuntu Versions 22.04 and 24.04, LME detected no performance impacts.

## 28. Is it Safe to Run apt Update or apt Upgrade While LME is Installed and Running?

LME has not tested apt update and apt upgrade. LME may integrate these commands in the future.

## 29. Do I Need to Upgrade the Server if a New Vesrion of Ubuntu is Released?

Updating Ubuntu is at the discretion of the user; however, we recommend using Ubuntu 22.04 or 24.04 as they have been tested with LME 2.0.2.

## 30. Where Can I Find Configuration or Installation Documentation for LME?

Users can find configuration and installation documentation on LME’s GitHub within the **[ReadMe](https://github.com/cisagov/LME/tree/lme-2-docs?tab=readme-ov-file#installing-lme)** section.

## 31. Are There Beginner-Friendly Resources Available?

Yes, LME has documentation and videos available to support your deployment.

## 32. Does LME Support NIST 800-53 or CMMC Compliance? Is There Any Documentation on How LME Maps to These Standards?

There is no official mapping between LME and these frameworks. Mapping specific controls or the Compliance Team would typically be responsible for this assessment. As a starting point, many Kibana detection rules map to the MITRE Adversarial Tactics, Techniques, and Common Knowledge (ATT&CK) framework, which can help inform control alignment.

## 33. What's the Difference Between Alerts Configured in Kibana and Those Set in the ElasAlert2 Rules Directory?

Kibana alerts are built-in detection rules created and managed through the Kibana interface. While they can detect events based on log data, sending those alerts to external destinations like Slack, email, or Microsoft Teams requires a paid Elastic license. On the other hand, ElastAlert2 is an open-source alerting engine that handles alert notifications. The detection logic still relies on Kibana’s rules, but ElastAlert2 watches for matching events and sends alert messages to your preferred destinations without requiring a paid license.

## 34. Why Use ElastAlert2 Instead of Kibana Alerting? Are There Cost Advantages or Functionality Differences?

LME uses the open-source version of Elastic, which doesn't include Kibana's built-in alert and notification features. Because those features require a paid Elastic license, LME relies on ElastAlert2 as the alerting engine to provide no-cost alerting and notifications to email, Slack, Teams, and more.

## 35. If We Upgrade to a Paid Elastic License, Will LME Still Work?

LME operates effectively with a paid Elastic license, but LME has not tested this nor is it planned.

## 36. Can LME Integrate with Cloud Services Like Okta or Meraki?

Yes, LME can ingest a wide range of log types using Elastic’s official integrations, including cloud services like Okta and Cisco Meraki. These integrations allow the Elastic Agent to collect, parse, and forward log data to LME.

## 37. What's the Best Way to Ingest Logs from Cloud Services Like Okta or Meraki?

The recommended approach is to use Elastic Agent integrations to collect logs from these services. Specifically:

- Okta Integration
- Cisco Meraki Integration
  
While LME is not configured to ingest these logs by default, users can follow Elastic’s documentation to configure integrations. Some integrations may require Application Programming Interface (API) keys or external log forwarding (e.g., via syslog, HTTP), and advanced use cases may involve custom parsing or pipeline adjustments.

## 38. Is LME Federal Information Processing Standards (FIPS)-Validated, or Does it Rely on Ubuntu's FIPS Validation for Compliance?

LME isn’t created from scratch. It’s integrated into industry-standard services from Elastic Stack (i.e., Elasticsearch, Kibana). It boasts added customizations such as dashboards, alerting, and simple installation. LME has not gone through FIPS validation. Whether that can or cannot meet individual organization standards is dependent upon the ability to install Elastic. If available, it should meet your standards. LME’s development of the install process intends to meet CISA’s Secure by Design requirements. As a point of pride, LME is a secure installation of the Elastic Stack. Other requirements that one may desire, such as two-factor authentication, are not yet a feature of LME, so your organization would need to implement independently. That functionality is a paid service from Elastic.

# References
 
## Basic Troubleshooting

You can find basic troubleshooting steps in the **[Troubleshooting Guide](troubleshooting.md)**.

## Finding Your LME Version (and the Components Versions)

When reporting an issue or suggesting improvements, it is important to include the versions of all the components, where possible. This ensures that the issue has not already been fixed!

### Linux Server

- Podman: on the Linux server type ```podman --version```
- Linux: on the Linux server type ```cat /etc/os-release```
- LME: show the contents of ```/opt/lme/config```, please redact private data

## Reporting a Bug

To report an issue with LME, reference the **GitHub Issues tab** at the top of the GitHub page or click **[GitHub Issues](https://github.com/cisagov/lme/issues)**.

## Questions About Individual Installations

Reference **[GitHub Discussions](https://github.com/cisagov/lme/discussions)** to see if your issue has been addressed before.

---
title: "Syslog Forwarding"
description: >-
     Set Up Syslog Fowarding to LME with Elastic Agent TCP Integration
---

# Syslog Forwarding

Logging Made Easy (LME) primarily collects host-based logs through installed agents. However, many devices that are critical to monitoring network and infrastructure activity (e.g., firewalls, routers, switches) do not support agent deployment.

To monitor these devices, LME supports syslog forwarding, allowing you to collect and analyze logs from across your network in a centralized platform. In this setup, the LME server acts as the centralized syslog receiver, accepting logs sent from network devices over Transmission Control Protocol (TCP). A TCP listener is configured through Elastic Agent's Fleet integration to receive the incoming syslog traffic, making it searchable and actionable within Kibana alongside agent-based logs.

This guide provides instructions for setting up syslog forwarding to the LME server using the Elastic Stack's TCP input and rsyslog.

## Configure the TCP Integration in Kibana

1. **Log into Kibana on the LME Server**
   
   - Navigate to **Kibana server**: **`https://{SERVER_IP}`**
     
   - Log in with ***username*** and ***password***.

2. **Access the Fleet Menu**
   
   - Click on the **hamburger menu icon** in the top left corner (three horizontal lines).
     
   - Scroll down and click on **Fleet**.

3. **Access Fleet Server Policy**
   
   - Click on the **Agent policies tab**.
     
   - Click on the **Fleet-Server-Policy link**.

4. **Add Integration**
   - Click on the **Add integration button**.
     
   - Click on the **Custom button** in the left panel.
     
   - Click on the **Custom TCP Logs icon**.

5. **Configure Settings**
   
   - Click on the **Add Custom TCP Logs button**.
     
   - Under the Configure integration section, click on the **Change defaults drop-down menu**.
     
   - Provide the ***following information***:
     
     - Listen Address: **0.0.0.0**
     - Listen port: **5140**
     - Dataset name: **tcp.syslog**
     - Add ***appropriate tags*** (e.g., syslog)
     - Enable **Syslog Parsing**
     - Enable **Preserve Original Event**
       
   - Click on the **Save and continue button**.

## Update the Container Configuration

1. Navigate to the **ubuntu server**.

2. Modify the ***LME Fleet Server quadlet*** to expose the syslog port:
   
   - **sudo nano /etc/containers/systemd/lme-fleet-server.container**

3. Add **port 5140** to PublishPort directive:
   
   - **PublishPort=8220:8220,5140:5140**

4. Reload **systemd** and then restart the ***container***:
   
   - **sudo systemctl daemon-reload**
     
   - **sudo systemctl restart lme-fleet-server.service**

5. Verify that the port is listening:
   
   - **sudo ss -tulpn | grep 5140**

## Configure Rsyslog to Forward Logs

1. Create a ***custom rsyslog configuration***:
   
   - **sudo nano /etc/rsyslog.d/60-forward-tcp.conf**

2. Add ***forwarding directive***:
   
   - ***.* @@lme-server-ip:5140**
   
**Note: This is the IP address of your LME server. Ensure you can reach it from your device.**

3. Restart **rsyslog**:
   
   - **sudo systemctl restart rsyslog**

## Generate Test Events

1. Create ***real system events*** to test the setup:
   
   - **ssh nonexistentuser@localhost**

## Verify in Kibana

1. Generate **fake ssh failures** using ssh nonexistentuser@localhost on the endpoint.

2. Log into **Kibana** on the LME server.
   
   - Navigate to the **Kibana server**: **`https://{SERVER_IP}`**
     
   - Log in with ***username*** and ***password***.

3. **Access the Discover Menu**
   
   - Click on the **hamburger menu icon** in the top left corner (three horizontal lines).
     
   - Click on **Discover**.

4. Click on the **dataview logs drop-down menu** and then select **logs-***.

5. In the Filter your data search bar, search for SSH-related entries by typing **message:("Failed passowrd" OR "invalid user" OR "authentication failure")**.

6. Confirm the failed login attempts were captured.

## Create Visualizations

1. Build a ***metric visualization for failed login attempts***.

2. In the Filter your data search bar, type **message:("Failed passowrd" OR "invalid user" OR "authentication failure")**.

3. Add the ***visualization*** to the dashboard.

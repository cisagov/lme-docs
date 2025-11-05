---
title: Logging Made Easy in the Cloud 
---
# Logging Made Easy in the Cloud 

This page addresses some Frequently Asked Questions (FAQs) about deploying Logging Made Easy (LME) in the Cloud, including setup, firewall rules, and Cloud compatibility. 

## Does LME Run in the Cloud? 

Yes. LME can run in the Cloud or on-premises environments. It's designed to work in personal or Cloud deployments, allowing organizations to host LME in their Cloud tenant (e.g., Azure) or connect on-premises clients to a cloud-hosted instance.

## Deploying LME in the Cloud for On-Premises Systems

You can set up LME in the Cloud and still send data from your on-premises endpoints. Here's how it works:

![cloud firewall](/docs/imgs/lme-cloud.jpg)

- You host the LME backend in the Cloud

- Your Elastic agents (installed on your endpoints) send logs to it over the internet

**Important: Ensure your firewall allows outbound traffic so your agents can connect.**

The easiest way is to make sure you can access these LME server ports from the on-premise client: 

- Wazuh Agent ([Agent Enrollment Requirements documentation](https://documentation.wazuh.com/current/user-manual/agent/agent-enrollment/requirements.html)): 1514,1515
    
- Elastic Agent ([Agent Install documentation](https://www.elastic.co/guide/en/elastic-stack/current/installing-stack-demo-self.html#install-stack-self-elastic-agent)): 8220 (fleet commands); 9200 (input to Elasticsearch)

You'll need to ensure your Cloud firewall is set up to allow the ports above. On Azure, Network Security Groups (NSG) run a firewall on your virtual machine's network interfaces.  You'll need to update your LME virtual machine's rules to allow inbound connections on the agent ports. Azure has a detailed guide for how to add security rules [here](https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group?tabs=network-security-group-portal#create-a-security-rule). 

### ***We highly suggest you do not open any port globally and restrict it based on your client's IP address or your client's subnets.***

On LME, you'll want to ensure that either:

- The firewall is fully disabled (if you're relying on your Cloud provider's firewall as the primary layer of defense)
 
- The necessary firewall rules are enabled to allow traffic through required ports

To check the firewall status, run:

  ```bash
  lme-user@ubuntu:~$ sudo ufw status
  Status: inactive
  ```

If Uncomplicated Firewall (UFW) is active, verify that the following rules are in place:

  ```bash
  lme-user@ubuntu:~$ sudo ufw status
  Status: inactive
  
  To                         Action      From
  --                         ------      ----
  1514                       ALLOW       Anywhere
  1515                       ALLOW       Anywhere
  22                         ALLOW       Anywhere
  8220                       ALLOW       Anywhere
  1514 (v6)                  ALLOW       Anywhere (v6)
  1515 (v6)                  ALLOW       Anywhere (v6)
  22 (v6)                    ALLOW       Anywhere (v6)
  8220 (v6)                  ALLOW       Anywhere (v6)
  ```

You can enable these ports via the following command:

```bash
sudo ufw allow 1514
sudo ufw allow 1515
sudo ufw allow 8220
sudo ufw allow 9200
```

If you plan to use the Wazuh Application Programming Interface (API), you'll also need to allow port 55000:

```bash
sudo ufw allow 55000
```

To forward traffic to the container network and allow services to run properly, run:

```bash
ufw route allow in on eth0 out on podman1 to any port 443,1514,1515,5601,8220,9200 proto tcp
ufw route allow in on podman1
```

There's also a helpful StackOverflow article on [Configuring UFW for Podman on Port 443](https://stackoverflow.com/questions/70870689/configure-ufw-for-podman-on-port-443), if needed. Your `podman1` network interface name may be different. Check the output of your network interfaces by running the following command to check if your interface is also called podman1: 

```bash
sudo -i podman network inspect lme | jq 'map(select(.name == "lme")) | map(.network_interface) | .[]'
```

To view your applied rules:

```bash
root@ubuntu:~# ufw show added
Added user rules (see 'ufw status' for running firewall):
ufw allow 22
ufw allow 1514
ufw allow 1515
ufw allow 8220
ufw route allow in on eth0 out on podman1 to any port 443,1514,1515,5601,8220,9200 proto tcp
ufw allow 443
ufw allow in on podman1
ufw allow 9200
root@ubuntu:~#
```

## Deploying LME for Cloud Infrastructure

Every Cloud setup is different. As long as the LME server is on the same network and able to talk to the machines you want to monitor, your deployment should run smoothly.

## Other Firewall Rules

You may also want to access Kibana from outside the Cloud as well. You'll want to ensure you either allow port `5601` or port `443` inbound from the Cloud firewall and the virtual machine firewall. 

To allow port 443:

```bash
root@ubuntu:/opt/lme# sudo ufw allow 443
Rule added
Rule added (v6)
```

Sample firewall status (active):

```bash
root@ubuntu:/opt/lme# sudo ufw status
Status: active

To                         Action      From
--                         ------      ----
22                         ALLOW       Anywhere
1514                       ALLOW       Anywhere
1515                       ALLOW       Anywhere
8220                       ALLOW       Anywhere
443                        ALLOW       Anywhere
22 (v6)                    ALLOW       Anywhere (v6)
1514 (v6)                  ALLOW       Anywhere (v6)
1515 (v6)                  ALLOW       Anywhere (v6)
8220 (v6)                  ALLOW       Anywhere (v6)
443 (v6)                   ALLOW       Anywhere (v6)
```

### Don't Lock Yourself Out and Enable the Firewall

Before enabling the firewall, ensure you're not blocking your Secure Shell (SSH) access. You must allow port 22 so you can still connect remotely:
 
```bash
sudo ufw allow 22
```

Once all necessary ports are allowed, enable the firewall with:

```bash
sudo ufw enable
```



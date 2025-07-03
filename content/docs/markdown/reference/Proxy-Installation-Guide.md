---
title: Proxy Installation Guide
---

# Proxy Installation Guide

The following steps will guide you through installing Logging Made Easy (LME) in environments where outbound internet access is routed through a proxy server. This guide explains how to configure system-wide proxy settings, ensure package managers and LME components (e.g., Wazuh, Elastic Stack) function correctly behind the proxy, and addresses common proxy-related issues that may arise. 

- **Ensure Proxy Environment Variables Are Set**
  
  Define your ***proxy settings*** in the system environment so all outgoing traffic can route through it.
     
   - Edit the ***environment file*** by running:

     ```bash
     sudo nano /etc/environment
     ```

   - Add the ***following lines***, replacing $proxy with your actual proxy URL:

     ```bash
     ALL_PROXY=$PROXY
     HTTPS_PROXY=$PROXY
     HTTP_PROXY=$PROXY
     http_proxy=$PROXY
     https_proxy=$PROXY
     no_proxy=127.0.0.1,localhost,::1,10.,172.16.,172.17.,192.168.,*.local,.local
     NO_PROXY=127.0.0.1,localhost,::1,10.,172.16.,172.17.,192.168.,*.local,.local
     REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
     NIX_SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
     ```

   - Save and exit the ***file***.
     
   - Reload the ***environment variables*** by running:

     ```bash
     source /etc/environment
     ```

- **Ensure Certificates Are Up to Date**
  
   - To avoid connection issues when accessing secure resources through a proxy, ensure your certificate store is current by running:

     ```bash
     cd /usr/local/share/ca-certificates
     # add corporation root ca pem files now
     sudo update-ca-certificates
     ```

- **Edit the Podman Files to Ignore HTTP Proxy**
  
  Some components in LME (e.g., containers managed by Podman) may not need to use the proxy - especially if they communicate locally. You can bypass the proxy within specific containers by adjusting the runtime flags.
     
   - In LME/quadlets, run the following command:

     ```bash
     for file in *.container; do
      echo "$file"
      sed -i '/^PodmanArgs/ s/$/ --http-proxy=false/' "$file"
      done
      ```

  This command clears the proxy settings within the container, avoiding potential network issues with internal-only communications.


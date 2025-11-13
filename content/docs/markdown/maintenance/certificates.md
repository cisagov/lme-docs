---
title: Certificates
---
# Certificates
 
The Logging Made Easy (LME) installation uses multiple Transport Layer Security (TLS) certificates to protect communications between its services and components. These certificates also secure the connection between Elasticsearch and Kibana. 

By default, the installation uses self-signed certificates. This guide explains how to generate or replace them as needed.

## Regenerating Self-Signed Certificates

While not recommended, you can generate the self-signed certificates by deleting the existing volume and restarting the service.

**Note: This method is destructive and should only be used when necessary.**

Run the following commands:

```bash
sudo -i podman volume rm lme_certs
sudo systemctl restart lme.service
```

## Using Your Own Certificates

You can use certificates signed by your own root Certificate Authority (CA) if needed. This involves generating your own certificates manually, using the correct settings, and placing them in the appropriate location inside the `lme/` directory.

**NOTE: The default supported method of installing LME is using automatically generated self-signed certificates. LME does not support troubleshooting issues caused by incorrectly configured custom certificates.**

### Certificate Creation Guidelines

If you choose to use your own certificates, ensure all Subject Alternative Names (SANs) match the IP addresses and Domain Name System (DNS) names used by your LME services. 

```bash
root@ubuntu:~# cat /opt/lme/config/setup/instances.yml  | head -n 30
# Add host IP address / domain names as needed.

instances:
  - name: "elasticsearch"
    dns:
      - "lme-elasticsearch"
      - "localhost"
    ip:
      - "127.0.0.1"

  - name: "kibana"
    dns:
      - "lme-kibana"
      - "localhost"
    ip:
      - "127.0.0.1"

  - name: "fleet-server"
    dns:
      - "lme-fleet-server"
      - "localhost"
    ip:
      - "127.0.0.1"

  - name: "wazuh-manager"
    dns:
      - "lme-wazuh-manager"
      - "localhost"
    ip:
      - "127.0.0.1"
```

For example, the new Kibana certificate would need to support the above alternative names. You can also ensure its set up properly by viewing the current certificate (assuming you've already mounted the `lme_certs` podman volume).

```bash
root@ubuntu:~$ cat /var/lib/containers/storage/volumes/lme_certs/_data/kibana/kibana.crt  | openssl x509 -text | grep -i Alternative -A 1
```

The expected output:

```bash
X509v3 Subject Alternative Name:
DNS:lme-kibana, IP Address:127.0.0.1, DNS:localhost
```

### Certificate Locations

All certificates are stored in the `lme_certs volume`. Here is how to list, change, or modify the contents:

```bash
root@ubuntu:$ podman volume mount lme_certs
/var/lib/containers/storage/volumes/lme_certs/_data
root@ubuntu:$ cd /var/lib/containers/storage/volumes/lme_certs/_data/
root@ubuntu:/var/lib/containers/storage/volumes/lme_certs/_data$ tree
.
├── ACCOUNTS_CREATED
├── ca
│   ├── ca.crt
│   └── ca.key
├── ca.zip
├── caddy
│   ├── caddy.crt
│   └── caddy.key
├── certs.zip
├── curator
│   ├── curator.crt
│   └── curator.key
├── elasticsearch
│   ├── elasticsearch.chain.pem
│   ├── elasticsearch.crt
│   └── elasticsearch.key
├── fleet-server
│   ├── fleet-server.crt
│   └── fleet-server.key
├── kibana
│   ├── kibana.crt
│   └── kibana.key
├── logstash
│   ├── logstash.crt
│   └── logstash.key
└── wazuh-manager
    ├── wazuh-manager.crt
        └── wazuh-manager.key
```

To edit or replace the certifications, copy the new desired certificate and key files into the corresponding subdirectory and restart the LME service to apply changes:

```bash
cp ~/new_kibana_cert.crt /var/lib/containers/storage/volumes/lme_certs/_data/kibana.crt
cp ~/new_kibana_key.key /var/lib/containers/storage/volumes/lme_certs/_data/kibana.key
```

## Migrating from Self-Signed Certificates

You can migrate from the default self-signed certificates to manually generated certificates at any time. For example, when switching to certificates issued by an internal enterprise CA. 

**Important Notes**

- The default supported method for LME is to use the automatically generated self-signed certificates.

- LME does not support troubleshooting issues caused by manually created or incorrectly configured certificates.

## Steps to Replace Self-Signed Certificates

- Generate your own ***valid certificate*** and ***key*** using the correct SANs that match your services' DNS/IP addresses.

- Copy your ***custom certificate*** and ***key*** into the appropriate subdirectory within the `lme_certs` volume.

- If using a signed certificate, ensure the root CA is also available in the correct location if required by your certificate chain.

- Restart the **LME service** to apply the new certificates:

  ```bash
  sudo systemctl restart lme.service
  ```

**Reminder: Ensure the SANs in your new certificate match the names and IPs found in your `instances.yml` file (used during setup).**

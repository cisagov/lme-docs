---
title: Configuring LME
---

# Configuring Logging Made Easy (LME)

The configuration files are located in `/config/`. These steps will guide you through setting up LME.

## Certificates and User Passwords

  - `instances.yml` defines the certificates to be created
    
  - Shell scripts will initialize accounts and generate certificates; they run from the quadlet definitions `lme-setup-accts` and `lme-setup-certs`
   
## Podman Quadlet Configuration

- Quadlet configuration for containers is located in `/quadlet/`; these map to the root `systemd` unit files but execute as non-privileged users

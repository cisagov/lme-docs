---
title: Logging Made Easy Security Model
---

# Logging Made Easy (LME) Security Model

This document outlines the LME security model from the user's perspective. It is intended to help users understand the security structure and make informed decisions about how to deploy and manage LME, considering the constraints and assumptions built into its design. 

## Operating System

LME has been tested most extensively on Ubuntu 24.04 but should, in theory, support any Unix Operating System (OS) that can install the required dependencies. It is assumed that your OS and Linux kernel are up to date and properly patched. Failing to patch your OS could leave your security infrastructure vulnerable.

**Note: For more information on supported Linux distributions, reference [Supported Linux Distributions](https://cisagov.github.io/lme-docs/docs/markdown/reference/change-me/).**

If a side-channel attack or Denial-of-Service (DoS) exploit is ever discovered at the OS level, LME considers this out of scope for what it can reasonably defend against. 

## Users

The LME security model defines four distinct user roles, each with specific permissions and responsibilities to maintain a secure and isolated environment. By clearly separating access between root, administrators, container users, and service users, LME minimizes security risks and enforces the principle of least privilege. Understanding these user types is critical to securely operating and managing the LME environment.

  1. **Root**: Every Unix-based OS has a root user. To maintain security, follow best practices by restricting access and applying hardening methods (e.g., disabling remote root login, securing administrator access, disabling root over Secure Shell [SSH], or removing `sudo` access where possible. For more information, reference [Restricting Root documentation](https://wiki.archlinux.org/title/Security#Restricting_root).
     
  2. **Administrators (i.e., those with `sudo` access)**: LME operates through administrator services. Any user with `sudo` access can administrator LME components. Admin users are given access to the `sudo` group and can manage services and system settings. Administrators are responsible for managing the master password used by LME service users.
     
  3. **Container User**: These users run processes inside the LME service containers. They are isolated within Podman and should not be granted access to host-level resources. Thie permissions are minimal, and they execute tasks under their own user namespace. This approach is designed to reduce risk by abstracting container-level processes from host-level administrator privileges. For more information, reference [User Namespaces](https://www.man7.org/conf/meetup/understanding-user-namespaces--Google-Munich-Kerrisk-2019-10-25.pdf) and [Podman User Namespaces](https://www.redhat.com/sysadmin/rootless-podman-user-namespace-modes).
     
  4. **Service User**: These users are tied to specific LME components and interact via Application Programming Interfaces (APIs). Their credentials are encrypted using the master password and stored securely in an isolated Podman environment. These users (e.g., `elastic`, `kibana-system`, `wazuh-wui`) are created with the principle of least privilege in mind.

## Services Containerized

All services that make up LME (as documented in our [diagram](https://github.com/cisagov/LME/blob/release-2.0.0/docs/imgs/lme-architecture-v2.jpg)) are deployed as Podman containers, orchestrated internally using Podman's `quadlet_system`.

- Quadlets are installed into the system administrator's directory (`/etc/containers/systemd/`) and launched with root privileges, similar to other root-level services

- The master password used to encrypt service passwords is owned and protected by the root user

- Each service's password is encrypted with the master password and only decrypted within its respective container

- Even if a container is compromised, its isolated nature ensures that adversaries cannot access files or credentials from the host or other containers

This approach ensures tight privilege boundaries and secure management across the LME architecture.




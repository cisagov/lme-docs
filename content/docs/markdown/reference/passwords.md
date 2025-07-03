---
title: Password Encryption
---

# Password Encryption

LME uses Ansible Vault to securely encrypt all user and service passwords at rest, ensuring that credentials are protected even if the system is compromised. Each password is randomly generated and stored in a secure location. This page outlines where passwords are stored, how to retrieve them, and the process for managing passwords manually if needed. 
We do submit a hashed version of the password to [Have I Been Pwned](https://haveibeenpwned.com/FAQs) to check for potential compromise; however, since the passwords are all randomly generated, such occurrences are expected to be rare.

### Where Are Passwords Stored?

Password files are stored at the following paths:

```bash
# Define user-specific paths
USER_VAULT_DIR="/etc/lme/vault"
PASSWORD_FILE="/etc/lme/pass.sh"
```

### Grabbing Passwords

To view and set the appropriate service user password in your environment, run the following commands:

```bash
#script:
$CLONE_DIRECTORY/scripts/extract_secrets.sh -p #to print

#add them as variables to your current shell
source $CLONE_DIRECTORY/scripts/extract_secrets.sh #without printing values
source $CLONE_DIRECTORY/scripts/extract_secrets.sh -q #with no output
```

This will load the service user passwords into your current shell.

### Manually Setting Up Passwords and Accessing Passwords (Unsupported)

**Note: These steps are not officially supported by the Cybersecurity and Infrastructure Security Agency (CISA), but may be helpful if your environment requires manual setup.**

Generally, you will want to run `./scripts/password_management.sh -s` if you want to change a user's password. You can see which users are available by running `./scripts/password_management.sh -l`. 

Run the password_management.sh script:

```bash
lme-user@ubuntu:~/LME-TEST$ sudo -i ${PWD}/scripts/password_management.sh -h
-i: Initialize all password environment variables and settings
-s: set_user: Set user password
-p secret_name: Manage Podman secret
-l: List Podman secrets
-h: print this list
```

A Command Line Interface (CLI) one liner to grab passwords also demonstrates how we're using Ansible Vault in `extract_secrets.sh`:

```bash
#where wazuh_api is the service user whose password you want:
USER_NAME=wazuh_api
sudo -i ansible-vault view /etc/lme/vault/$(sudo -i podman secret ls | grep $USER_NAME | awk '{print $1}')
```

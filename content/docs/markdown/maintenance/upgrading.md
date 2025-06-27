---
title: Upgrading
---
# Upgrading

## Download Latest Logging Made Easy (LME) Version

- If you already have a current version of LME in your home directory, rename it before upgrading by running:

  ```bash
  mv ~/LME ~/LME.old
  ```

- Before upgrading, download the latest version of LME to your home directory:

  **Note: Ensure `jq` and `curl` packages are installed on your system.**

  ```bash
  curl -s https://api.github.com/repos/cisagov/LME/releases/latest | jq -r '.assets[0].browser_download_url' | xargs -I {} sh -c 'curl -L -O {} && unzip -d ~/LME $(basename {})'
  ```

This command will download and extract the latest LME release to your `~/LME` directory.

## Upgrade for Existing LME 2.0.x Users

**Note: For detailed guidance on upgrades, rollbacks, or backups of an install, reference the [Extended Documentation](https://github.com/cisagov/LME/tree/main/ansible) and review the following files in your LME directory: `UPGRADE_README.md`, `ROLLBACK_README.md`, and `BACKUP_README.md` files.**

Once you've downloaded the latest source, you can switch to the new directory and begin the upgrade process. 

- Before starting, confirm the storage path used for your containers:

  ```bash
  cat /etc/containers/storage.conf
  ```

- A section like this may appear:

  ```bash
  #[storage]
  #driver = "overlay"
  #runroot = "/run/containers/storage"
  #graphroot = "/var/lib/containers/storage"
  ```

- Take note of the `graphroot`. This is where your container data is stored.

  **Note: Ensure the drive where your containers are stored has at least twice the available space before proceeding.**

- If enough space is available, answer `yes` when prompted by the upgrade script to back up your containers.

- To perform the upgrade, run:

  ```bash
  cd ~/LME
  ansible-playbook ansible/upgrade_lme.yml
  ```

## Upgrading for Existing LME 1.4 Users

Upgrading from LME 1.x is no longer supported. You will need to perform a clean install of a 2.x version.

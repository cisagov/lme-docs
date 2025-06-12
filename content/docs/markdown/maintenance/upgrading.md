---
title: Upgrading
---
# Upgrading

## Download Latest LME Version
If you have a current version of LME in your home directory, please rename it.
```bash
mv ~/LME ~/LME.old
```
Before upgrading, download the latest version of LME to your home directory:

```bash
# Make sure the package jq and curl are installed on your system
curl -s https://api.github.com/repos/cisagov/LME/releases/latest | jq -r '.assets[0].browser_download_url' | xargs -I {} sh -c 'curl -L -O {} && unzip -d ~/LME $(basename {})'
```

This will download and extract the latest LME release to `~/LME` in your home directory.

## Upgrading for Existing LME 2.0.x Users:
> **Note**: If you would like to read more in-depth directions about an upgrade, rollback, or backup of an install, you can go to: [Extended Documentation](https://github.com/cisagov/LME/tree/main/ansible) and read the in-depth UPGRADE_README.md, ROLLBACK_README.md and BACKUP_README.md files.


Once you have the source downloaded you can change directory to the downloaded directory and run an upgrade. 
It is recommended that you have double the space on the drive you are using to store your containers. 
If you have enough space, you can answer `yes` to the backup prompt in the upgrade script. To find the storage
location for your containers, you can look in the storage.conf file and look for the graphroot. 
```bash
cat /etc/containers/storage.conf 
#[storage]
#driver = "overlay"
#runroot = "/run/containers/storage"
#graphroot = "/var/lib/containers/storage"
```

To update the version of LME:
```bash
cd ~/LME
ansible-playbook ansible/upgrade_lme.yml
```

## Upgrading for Existing LME 1.4 Users:
Upgrading from 1x is no longer supported. You will need to do a fresh install of a 2x version.
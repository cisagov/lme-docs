---
title: Podman Volume Management
---
# Podman Volume Management

## Overview

A Podman volume is a mechanism for storing container data directly on the host machine. When a volume is created and mounted to a container, Podman sets up a dedicated directory on your host system. Any data written by the container in this volume is actually stored in that host directory.

This setup ensures that data is retained on the host, even if the container is stopped, removed, or replaced. You can then mount this same volume to a new container, allowing it to access all the previously stored data. This also allows you to have one volume on a host machine that you can mount to multiple containers (e.g., our certs volume can be used across all containers).

You will see volume paths in our quadlets written in this format:

```bash
/path/on/host/:/path/in/container/
```

The path on the left side of the colon refers to a file or directory on the host machine, while the path on the right is where it will be mounted inside the running container.

**NOTE: If you do not have a volume assigned to a certain path or file, it will not be persisted. Restarting a container without a properly defined volume will discard any changes made inside that container. Ensure all required files are defined as volumes (we've ensure all required files by default are already volumes).**

## Podman Volume Management for LME

Proper volume configuration is critical for maintaining the health and performance of your Logging Made Easy (LME) installation. Columes help manage disk usage and prevent data loss during container restarts. The following sections outline how you can monitor and manage the disk space used by Podman volumes.

### Check Volume Location on Host Machine

- To identify where your Podman volumes are stored on the host machine, run:

  ```bash
  podman volume inspect <volume_name>
  ```

- To list all available volumes, run:

  ```bash
  podman volume ls
  ```

### Checking Overall Disk Usage

- To view overall disk usage on your system, run:

  ```bash
  df -h
  ```

  This will display the disk usage for all mounted filesystems. Look for the filesystem that contains your home directory (commonly `/`).

### Checking Podman Volume Usage

By default, Podman volumes are stored in your home directory under `~/.local/share/containers/storage/volumes/`.

- To check the disk usage of this specific directory, run:

  ```bash
  sudo du -sh ~/.local/share/containers/storage/volumes/
  ```

    This command will show you the total size of all Podman volumes.

- To see a breakdown of individual volume sizes, run:

  ```bash
  sudo du -sh ~/.local/share/containers/storage/volumes/*
  ```

### Using Podman's Built-In Tools

Podman provides a built-in command to check disk usage across containers, images, and volumes:

```bash
podman system df -v
```

This command provides:

- A summary of disk usage by images, containers, and volumes
- A detailed breakdown of each volume's size

### Managing Volume Space

If volumes are consuming too much space, consider the following actions:

- Review the data in large volumes to determine if any can be cleaned up or archived
- For log volumes (e.g., `lme_wazuh_logs`), consider implementing log rotation if not already in place
- For database volumes (e.g., `lme_esdata01`), check whether data can be optimized or old indices deleted; Elastisearch can quickly fill up storage, so regular index management is key
- Use Podman's prune commands to remove unused volumes:
  
   ```bash
   podman volume prune
   ```
<span style="color:orange">**Warning: This will remove all unused volumes. Always back up important data before performing any cleanup.** </span>

### Viewing Elasticsearch Index Sizes

As mentioned earlier, `lme_esdata01` will store all your logs in indices. 

To view all your Elasticsearch indices and their sizes in Kibana:

- Log in to **Kibana**.
  
- Click the **hamburger menu icon** (three horizontal lines) in the top left corner.
  
- Scroll down to **Stack Management**.
  
- Click on **Index Management**.
  
- Enable **Include Hidden Indices**.

All your indices and their sizes will appear:

![image](https://github.com/user-attachments/assets/f32741af-e77c-4bec-9e3d-268c25d65323)

### Editing Files in Podman Volumes and Bind Mounts

When editing files that are exposed to containers via Podman volumes or bind mounts, changes made on the host machine are instantly reflected inside the container. This creates a direct link between the host filesystem and the container's filesystem.

In the LME setup, many configuration files follow this model. For example, the Wazuh Manager configuration file (ossec.conf) is actually located at `/opt/lme/config/wazuh_cluster/wazuh_manager.conf` on the host and is bind-mounted into the container. 

Once edits are made on the host, changes are instantly visible to the Wazuh Manager process inside the container. To apply them, simply restart the containing by running:

```bash
sudo systemctl restart lme-wazuh-manager.service
```

Your updates will now take effect within the running Wazuh Manager container.

## Backup Volumes

Since Podman volumes contain all persisted data for LME, it's important to regularly back them up. You can back up to an external hard drive or a network storage location.

**Note: Be sure to stop all containers before performing a backup.**

To backup an external hard drive:

- Connect the external hard drive to your system.
  
- Mount the hard drive.
  
- Copy volume data from your Podman volume directory to the mounted drive.
  
- Safely unmount the drive once the copy is complete, if desired.

To backup to the network storage:

- Mount/connect to your network storage.
  
- Copy volume data from your Podman volume directory to the network storage.
  
- Disconnect/unmount from the network storage once the copy is complete, if desired.

As an example, to copy all volumes to a mounted drive, run the following command:

```bash
rsync -av ~/.local/share/containers/storage/volumes/ /mnt/nas/podman_volume_backup/
```

**Note: Always refer to your external drive or network storage documentation for proper mounting instructions on Ubuntu or your specific operating system.**

---
title: Storage Options
---

# Storage Options

By default LME stores logs on the local drive.
This document provides guidance for changing where the elastic data is stored.

Maybe your computer drive isn't large enough and would like to store it on network storage, or an external SSD.
This guide is for you.

Our recomendation is the following: 

**If possible, keep data as close to the computer as possible.**
We prefer local storage, then NAS or external drive, then cloud. The performance of your
LME server will depend heavily on the speed at it can read / write data. Local storage
will generally be faster than external, as external is limited by the speed of the drive,
speed of the connection (USB / network), etc. The speed of cloud is dependent on your
ineternet connection (far far slower than any local read / writes).

If you would like to store your data on cloud, we recommend you move your entire elastic instance
to the cloud. We have guidance for that in our [article on cloud](./cloud.md).

## Changing Storage Location
Broadly, all options follow these two steps:
1. Mount the storage medium to your server that will host LME
2. Configure LME to point to that location

### Setting Storage Location

Ideally, set the storage location on a fresh install. If you are already running
LME, you may need to change where the existing storage is.

#### Fresh Install
If you have not installed LME yet, proceed with the [install guide](../install/_index.md),
but when running `./install.sh` use the `-g` flag to specify where you would like to
store the data volumes. For example:
```bash
cd ~/lme
./install.sh -g /mnt/lme-drive
```

The podman volumes will be hosted under the directory provided. 

Note: this will affect **all** future containers. If you are planning on using
podman for any other reasons please be aware of this.

#### Changing Storage Location

**Note: make a backup before you do this. There is a high risk of losing data.**

**Note: this has not been tested and is not guaranteed to keep data. Test before pushing**

For this example, assume LME installation happened as normal and we have a new
drive mounted to `/mnt/lme`, which is where we want to store all the data.

We recommend making a backup of data before doing this.

1. Get the current storage directory
```bash
sudo -i podman info --format '{{.Store.GraphRoot}}'

# example output
/var/lib/containers/storage
```

2. Stop all LME services
```bash
sudo systemctl stop lme*
sudo -i podman stop --all
```

3. Move existing volumes to new directory

**Note: If you are storing on an external drive, NAS, etc. make
sure this directory is on the new drive!**

```bash
sudo mv /var/lib/containers/storage/* /mnt/lme/
```

4. Create a symbolic link from old directory to new directory

We need to make a link because the podman database stores these paths as
hardcoded. We can alternatively make new volumes and copy information over,
but

```bash
sudo rm -rf /var/lib/containers/storage

#make a link pointing from the old directory to the new one
#NOTE: make sure you use absolute paths here!
sudo ln -s /mnt/lme/ /var/lib/containers/storage
```

This will keep the podman store graph root to `/var/lib/containers/storage`
while keeping the actual data in `/mnt/lme`. This way we don't have to change
any podman configuration.

5. Restart LME
```bash
sudo systemctl restart lme*
```

Make sure that the path of the new location will not change at all. Have a consistent
mount point. If you do need to change it, follow these steps again.

## Guides on Specific Storage Types

### Local Drive

By default, the LME data is stored in a podman volume located in `/var/lib/containers/storage/volumes`. This is usually on the main partition of a linux drive.

This section will help with the following:
1. You want to change the directory the data is saved
2. You have installed a new drive to your computer and would like to store it there.

Follow the guide for [Setting Storage Location](#setting-storage-location).

If you are installing a new drive and would like to make that the partition, please
look up guidance on your operating system. A full explainer is beyond the scope
of this article, but a quick example is provided.

#### New Drive Set Up Example

Find the disk installed on the computer.
The drive either starts with
  - `sd` (if connected through SATA)
  - `nvme` (if connected through NVME)
the last letter will be the number of drive.
e.g. two drives: `/dev/sda` and `/dev/sdb`. 
```bash
sudo fdisk -l 
# or
sudo lsblk
```

Let's say the new drive is `/dev/sdb`. We need to make a new partition.
We will use `fdisk`, but `parted` is an option.
```bash
# Create a new partition
sudo fdisk /dev/sdb

## The following is inside of fdisk
g # make a new GPT table (type of partitions)
n # make a new partition

# hit enter 3 times for the defaults. This will create a partition that takes
# up the entire drive

p #check partition looks good
w #save and quit

## The following commands are back in the command line
sudo lsblk #now you should see 'sdb1', the first partition of /dev/sdb
```

Format the partition with a filesystem.
This is dependent on what filesystem you are using. We'll use `ext4` here.
Remember to specify the partition of `/dev/sdb`, in this case we only have
one partition, so we're installing the filesystem to `/dev/sdb1`.
```bash
mkfs.ext4 /dev/sdb1
```

Mount the drive. Feel free to change the paths as you want.
```bash
sudo mkdir /mnt/new-drive
sudo mount /dev/sdb1 /mnt/new-drive
```

Now we can access the new drive on `/mnt/new-drive`. On a computer reset this
drive will be unmounted and we'll have to mount again. To make the mount
persistant:
```bash
sudo vim /etc/fstab

## Add this line at the bottom
/dev/sdb1 /mnt/new-drive ext4 defaults 0 0
```

Now you can use the drive as normal. Any files in `/mnt/new-drive` will be saved
to the new drive. You can check available space by running:
```bash
df -h
```

### External Drive

If you cannot install a new internal drive you can use an external SSD connected
through USB.

**Note: USB speeds will generally be much slower than internal drives.**

Follow the same steps as using a [Local Drive](#local-drive). Find the name of the
drive using `lsblk` or `fdisk -l`. The external drive may already be partitioned with
a filesystem. If so, feel free to skip the partitioning and filesystem install steps
and go straight to mounting the drive.

This solution may be less reliable than an internal drive. We recommend using an
internal drive over an external drive.

### Storing on Network Attached Storage (NAS)
Broadly, the steps are:

1. Create a mount for NAS (NFS, SMB, iSCSI)
2. Point lme to mount directory

#### Using NFS with NAS

Generally, the steps to mount a NAS drive using NFS follows:

1. Enable NFS server on NAS
2. Mount NAS using NFS client on LME server
3. Enable mounting on system reset

##### Enable NFS server on NAS
This is very platorm dependent -- check the documentation for which NAS system you are using.
Some common ones:
- [TrueNAS NFS Documentation](https://www.truenas.com/docs/core/13.0/coretutorials/sharing/nfsshare/)
- [Synology NFS Documentation](https://kb.synology.com/en-global/DSM/tutorial/How_to_access_files_on_Synology_NAS_within_the_local_network_NFS)

Make sure you have enabled both reading and writing data. It may be helpful to 
add the LME server IP to a whitelist on the NAS so you can connect without authentication.

##### Connect to NAS on LME server

The following code mounts a NAS.
- **Note: replace [NAS_IP] with the IP address of your NAS**
- **Note: replace [NAS_FOLDER] with the NAS directory you want to mount (e.g. /volume1/lme)**
```bash
## Install the package
#ubuntu / debian
sudo apt install nfs-common #install nfs tools 
# redhat/fedora
sudo yum install nfs-utils #install nfs tools

## mount the nas folder to /mnt/lme-mount

# replace [NAS_IP] with the ip address of your NAS server
# replace [NAS_FOLDER] with the mounted folder on your nas
sudo mkidr /mnt/lme-mount
sudo mount [NAS_IP]:[NAS_FOLDER] /mnt/lme-mount

```
For persistent mounts (on a reboot, power off):
```bash
sudo vim /etc/fstab

## the following is inside the fstab file
[NAS_IP]:[NAS_FOLDER] /mnt/lme-mount nfs defaults  0 0
```

#### Using SMB/CIFS with NAS
As the LME server is installed on a Linux machine, we recommend using NFS to mount the drives.
If you would like to use SMB the steps are largely the same:
- Enable SMB on your NAS system
- Mount the drive on LME using SMB
- Point LME to mounted directory

Consult SMB/CIFS documentation for your NAS for steps on how to mount. Once mounted,
follow the same steps to save LME logs to that drive.

### Storing on Cloud
We make a strong recomenndation against running LME locally while storing data in the cloud.

If you would like to use cloud systems for LME, please see [Logging Made Easy in the Cloud](./cloud.md).
If you would like to back up to the cloud, 

If you do think the right solution for you is to run the LME server locally
(including elastic, kibana, etc) but storing all the data on the cloud you can use
a system like 
- [AWS Mountpoint](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mountpoint.html)
- [Azure Blobfuse](https://learn.microsoft.com/en-us/azure/storage/blobs/blobfuse2-what-is)

These systems have not been tested and are not recommended for LME. Use at your own risk.

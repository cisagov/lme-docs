---
title: Elasticsearch Cluster Install

sidebar_position: 3
---
# Elasticsearch Cluster Install

**Important:** If you already have a Logging Made Easy (LME) installation, upgrade it to **2.3.0** before converting that environment to a cluster. Reference the [Upgrading LME](/docs/maintenance/upgrading) guide for more information.

This document is the single canonical guide for standing up a multi-node LME
Elasticsearch cluster from a fresh source checkout. It covers what is
required up front, the commands operators reach for most often, the
fresh-clone install walkthrough, and the supporting workflows around Secure Shell (SSH)
bootstrapping, optional shared snapshot storage, and advanced operations.

It assumes you have just downloaded the LME source onto the host that will
become the cluster master and that you intend to install on your Linux
machines.

## 1. Requirements

### Infrastructure

- Three or more Linux servers (Ubuntu 24.04+ or Red Hat Enterprise Linux [RHEL]/Rocky 8+ are the supported
  baselines)
- One server is designated the **master**; it runs the full LME stack
  (Elasticsearch, Kibana, Fleet, Wazuh)
- The remaining servers are **child (data) nodes**; they run Elasticsearch
  only
- Minimum recommended per node:
  - Four Central Processing Unit (CPU) cores
  - 8 GB RAM
  - 100 GB free disk

### Networking

- All nodes must be able to reach each other on:
  - `9200/tcp` (Elasticsearch HyperText Transfer Protocol [HTTP])
  - `9300/tcp` (Elasticsearch transport)
  - `22/tcp` (SSH)
- The master must additionally accept inbound traffic on:
  - `5601/tcp` (Kibana User Interface [UI])
  - `8220/tcp` (Fleet enrollment)
  - `55000/tcp` (Wazuh Application Programming Interface [API], where used)
- All nodes must be reachable by the IP or hostname you place in the cluster
  inventory; use either all IPs or all consistent hostnames (do not mix)

### Software on the Master

The master needs a small set of base tools installed before the LME installer
runs:

- `git`
- `ansible` (2.9 or newer)
- `jq`

Examples:

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y ansible jq git
```

```bash
# RHEL 9 / Rocky / Alma (jq via EPEL)
sudo dnf install -y epel-release
sudo dnf install -y ansible-core jq git
```

LME's `./install.sh --cluster` will also install the required Ansible Galaxy
collections (`community.general`, `ansible.posix`) on the master.

### Access Between Master and Child Nodes

The master must be able to:

- SSH to every child node as a chosen user (referred to here as the cluster
  user) without an interactive password prompt
- Run `sudo` on every child node as that same user without a password prompt
  (so Ansible's `become` can complete).

An overview of the set up procedures are (reference Section 4 for the complete step-by-step guide):

- Generate or identify an SSH key on the master
- Authorize that key on every child node for the cluster user
- Grant the cluster user `NOPASSWD` sudo on every child node

### Storage

There are two distinct storage requirement tiers. Most installs only need the
first.

- **Required for Cluster Install (Always):**

  - Node-local storage on every node, sized for the data you intend to keep on
  that node (reference the 100 GB minimum above)
  - No shared filesystem is needed
  to form the cluster or to run normal operations

- **Only Needed for Filesystem Snapshot Backups (Optional):**

  - A directory that is **the same path on every node and shares the same
  contents** (typically a Network File System [NFS] or another shared filesystem)
  - The Elasticsearch filesystem (`fs`) snapshot repository requires this kind
  of shared directory, because the snapshot files must be visible from every
  data node
  - LME does not require this for installation; it is only needed if you plan
  to use the `fs` snapshot workflow

**NFS is not required to form the cluster.** It is a snapshot feature, not an
install prerequisite.

## 2. Cluster Command Cheat Sheet

Run these from the LME repo root on the master node unless otherwise noted:

```bash
cd ~/LME
```


### Install

```bash
# Full cluster install (master + all child nodes)
./install.sh --cluster
```

Additional variants (generally not required):

```bash
# Verbose Ansible output
./install.sh --cluster --debug

# Only install the master (cluster mode), skip child node deployment
./install.sh --cluster --cluster-master-only

# Only deploy Elasticsearch to child nodes (master already installed)
./install.sh --cluster --cluster-nodes-only

# Use a custom inventory path
./install.sh --cluster --cluster-inventory ansible/inventory/cluster.yml
```

### Cluster Health and Status

Load Elasticsearch credentials into the current shell before any `curl`
commands below:

```bash
# use the -p flag to see the secrets and the -q flag to hide them
source /opt/lme/scripts/extract_secrets.sh -p
```
```bash
curl -sk -u "elastic:$elastic" https://localhost:9200/_cluster/health?pretty
curl -sk -u "elastic:$elastic" https://localhost:9200/_cat/nodes?v
curl -sk -u "elastic:$elastic" https://localhost:9200/_cat/shards?v
curl -sk -u "elastic:$elastic" https://localhost:9200/_cat/indices?v
sudo systemctl status lme
sudo podman ps --format '{{.Names}}\t{{.Status}}'
```

Check for unassigned shards:

```bash
curl -sk -u "elastic:$elastic" "https://localhost:9200/_cat/shards?v&s=state" | grep UNASSIGNED
```

### Password Rotation

```bash
# Elastic superuser
ansible-playbook -i ansible/inventory/cluster.yml ansible/change_passwords.yml \
  -e lme_user=elastic -e lme_password='YourNewSecurePassword123-'

# Kibana service account
ansible-playbook -i ansible/inventory/cluster.yml ansible/change_passwords.yml \
  -e lme_user=kibana_system -e lme_password='YourNewSecurePassword123-'

# Wazuh dashboard / API users (run for each)
ansible-playbook -i ansible/inventory/cluster.yml ansible/change_passwords.yml \
  -e lme_user=wazuh -e lme_password='YourNewSecurePassword123-'
ansible-playbook -i ansible/inventory/cluster.yml ansible/change_passwords.yml \
  -e lme_user=wazuh_api -e lme_password='YourNewSecurePassword123-'

# Offline mode (skip the Have I Been Pwned check)
ansible-playbook -i ansible/inventory/cluster.yml ansible/change_passwords.yml \
  -e lme_user=elastic -e lme_password='YourNewSecurePassword123-' \
  -e offline_mode=true
```

### Snapshots

```bash
# Default cluster snapshot (register repo, verify, create snapshot)
ansible-playbook -i ansible/inventory/cluster.yml ansible/snapshot_elasticsearch.yml

# Register and verify the repo only, no snapshot
ansible-playbook -i ansible/inventory/cluster.yml ansible/snapshot_elasticsearch.yml \
  -e create_snapshot=false

# Custom snapshot name
ansible-playbook -i ansible/inventory/cluster.yml ansible/snapshot_elasticsearch.yml \
  -e snapshot_name=before-maintenance

# Shared filesystem snapshot path (see Section 5 for the storage setup)
ansible-playbook -i ansible/inventory/cluster.yml ansible/snapshot_elasticsearch.yml \
  -e es_snapshot_fs_location=/usr/share/elasticsearch/snapshots \
  -e es_snapshot_repo=lme_nfs_backups

# S3 snapshot repository
ansible-playbook -i ansible/inventory/cluster.yml ansible/snapshot_elasticsearch.yml \
  -e es_snapshot_repo_type=s3 \
  -e es_s3_bucket=my-lme-snapshots \
  -e es_s3_region=us-west-2

# List snapshots in the default repo
curl -sk -u "elastic:$elastic" https://localhost:9200/_snapshot/lme_backups/_all?pretty
```

### Backups

```bash
# Cluster-safe backup bundle (snapshot + master backup + recovery manifest)
ansible-playbook -i ansible/inventory/cluster.yml ansible/cluster_backup_lme.yml

# Cluster backup using shared snapshot storage
ansible-playbook -i ansible/inventory/cluster.yml ansible/cluster_backup_lme.yml \
  -e es_snapshot_fs_location=/usr/share/elasticsearch/snapshots \
  -e es_snapshot_repo=lme_nfs_backups

# Cluster backup with a specific snapshot name
ansible-playbook -i ansible/inventory/cluster.yml ansible/cluster_backup_lme.yml \
  -e snapshot_name=before-maintenance
```

Inspect the most recent local backup bundle on the master:

```bash
LATEST_BACKUP=$(ls -1dt /var/lib/containers/storage/backups/* | head -n1)
ls -la "$LATEST_BACKUP"
```

If shared storage is mounted, exported master recovery bundles live at:

```bash
ls -la /mnt/es-snapshots/lme-master-backups/
```

### Restore

```bash
# Restore Elasticsearch data from a snapshot (full cluster restore)
ansible-playbook -i ansible/inventory/cluster.yml ansible/restore_elasticsearch_snapshot.yml \
  -e snapshot_name=before-maintenance \
  -e confirm_full_cluster_restore=true

# Restore a single index into the running cluster
ansible-playbook -i ansible/inventory/cluster.yml ansible/restore_elasticsearch_snapshot.yml \
  -e snapshot_name=before-maintenance \
  -e restore_mode=live_cluster \
  -e restore_indices=lme-recovery-test \
  -e include_global_state=false

# Restore master/control-plane state
ansible-playbook ansible/restore_lme_master.yml

# Restore master state from a specific backup
ansible-playbook ansible/restore_lme_master.yml \
  -e restore_backup_dir=/mnt/es-snapshots/lme-master-backups/<timestamp>.tar.gz
```

### Upgrade and maintenance

```bash
# Regenerate and redistribute cluster certificates
ansible-playbook -i ansible/inventory/cluster.yml ansible/elasticsearch.yml --tags certificates

# Rebuild or re-add a single node
ansible-playbook -i ansible/inventory/cluster.yml ansible/elasticsearch.yml --limit <node_name>
```

### Single-node to cluster conversion

```bash
# Recommended wrapper, generates ansible/inventory/cluster.yml for you
bash scripts/convert_to_cluster.sh
```


Additional variants:
```bash
# Use an existing ansible/inventory/cluster.yml
bash scripts/convert_to_cluster.sh --skip-inventory

# Non-interactive wrapper
bash scripts/convert_to_cluster.sh --skip-prompts

# Fallback, direct playbook after creating ansible/inventory/cluster.yml
ansible-playbook -i ansible/inventory/cluster.yml ansible/convert_to_cluster.yml

# Fallback, non-interactive direct playbook
ansible-playbook -i ansible/inventory/cluster.yml ansible/convert_to_cluster.yml \
  -e skip_prompts=true
```

## 3. Fresh Install Walkthrough

Perform these steps to go from a fresh source download on the master to a
healthy cluster.

### Step 1. Clone the source on the master.

```bash
git clone https://github.com/cisagov/LME.git ~/LME
cd ~/LME
```

### Step 2. Prepare SSH and sudo on every child node.

The master must be able to SSH to each child node as the cluster user, and
that user must have `NOPASSWD` sudo on the child node. Perform the steps in Section 4 to
set this up before continuing.

When you are done, this should succeed from the master for every child node:

```bash
ssh <cluster_user>@<child_node> "sudo -n true && hostname"
```

### Step 3. Create the environment file.

```bash
cp config/example.env config/lme-environment.env

# Replace with the master's actual IP (the one child nodes will use to reach it)
sed -i 's/IPVAR=.*/IPVAR=<MASTER_PRIVATE_IP>/' config/lme-environment.env
```

### Step 4. Install Ansible collections.

```bash
cd ~/LME/ansible
ansible-galaxy collection install -r requirements.yml
cd ~/LME
```

This installs `community.general` and `ansible.posix`. `./install.sh --cluster`
runs this for you, but installing manually first gives you faster feedback if
Galaxy is unreachable.

### Step 5. Create the cluster inventory.

Create `ansible/inventory/cluster.yml`. A working three-node example:

```yaml
all:
  vars:
    es_master_host: 10.0.0.4
    es_cluster_seed_hosts:
      - 10.0.0.4
      - 10.0.0.5
      - 10.0.0.6

  children:
    elasticsearch:
      hosts:
        # Master node, MUST be first (handles cert generation)
        es1:
          ansible_host: 10.0.0.4
          ansible_connection: local
          es_node_name: lme-elasticsearch
          es_is_initial_master: true
          es_publish_host: 10.0.0.4

        es2:
          ansible_host: 10.0.0.5
          ansible_user: ubuntu
          es_node_name: es2
          es_publish_host: 10.0.0.5

        es3:
          ansible_host: 10.0.0.6
          ansible_user: ubuntu
          es_node_name: es3
          es_publish_host: 10.0.0.6
```

Important rules:

- The master (`es1`) must be listed **first** and must use
  `ansible_connection: local`
- Set `ansible_user` on each child node to the cluster user from Section 4
- Every `es_publish_host` value must appear in `es_cluster_seed_hosts`
- Use either IPs everywhere or hostnames everywhere; do not mix
- In most setups, `ansible_host` and `es_publish_host` are the same IP; however, they
  can differ if you have a separate management network

A helper script, `scripts/create_cluster_inventory.sh`, can generate this
file interactively.

### Step 6. Run the cluster install.

```bash
cd ~/LME
./install.sh --cluster
```

This single command will:

- Validate that the cluster inventory file exists and is well-formed
- SSH-ping every child node via Ansible
- Install Ansible Galaxy collections
- Run `site.yml` on the master in cluster mode
- Run `elasticsearch.yml` on every cluster node

Useful flags:

- `--debug` - verbose Ansible output
- `--cluster-master-only` - install only the master in cluster mode
- `--cluster-nodes-only` - deploy only Elasticsearch to child nodes
- `--cluster-inventory PATH` - use a non-default inventory file

`--cluster` and `--offline` cannot be combined. Offline cluster installation
is not supported at this time.

### Step 7. Verify the cluster.

```bash
# use the -p flag to see secrets and -q to hide them
source /opt/lme/scripts/extract_secrets.sh -p
curl -sk -u "elastic:$elastic" https://localhost:9200/_cluster/health?pretty
curl -sk -u "elastic:$elastic" https://localhost:9200/_cat/nodes?v
```

A healthy cluster reports `"status": "green"`, the expected
`"number_of_nodes"`, and `"unassigned_shards": 0`.

Access Kibana at `https://<MASTER_IP>:5601` and log in as `elastic`. Retrieve
the password with:

```bash
# use the -p flag to see the secrets and the -q flag to hide them
source /opt/lme/scripts/extract_secrets.sh -p && echo "$elastic"
```

## 4. SSH Bootstrap for Cluster Nodes

This section walks through the SSH and sudo setup that Section 3 depends on.
Repeat for every child node before running `./install.sh --cluster`.

### What "Reachable and Loginable from the Master" Means

For each child node, the master must be able to:

- Open an SSH session to the node as the chosen cluster user
- Authenticate with an SSH key (no interactive password prompt)
- Run `sudo` on the child node as that same user with no password prompt
- Reach the node at the exact IP or hostname listed in
   `ansible/inventory/cluster.yml`

If any of these are not true, `./install.sh --cluster` will either prompt
interactively or fail.

### Step 4.1. Create or Identify the SSH Key on the Master

If the master already has an SSH key you want to reuse, skip this step. To
create a new one, run the following:

```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -q
# Or, for older toolchains:
ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa -q
```

Choose one key and use it consistently for all child nodes.

### Step 4.2. Authorize the Master's Key on Each Child Node

Pick one of the two paths below. Run the chosen path once per child node from
the master.

#### Path A: `ssh-copy-id` (recommended)

This is the simplest method when password SSH is temporarily available on the
child node, or when you have another way to provide the password:

```bash
# Will prompt for the cluster user's password on the child node
ssh-copy-id <cluster_user>@<child_node>
```

If you have many nodes and want to script this, `sshpass` can supply the
password (Ubuntu: `sudo apt-get install -y sshpass`. RHEL via EPEL:
`sudo dnf install -y epel-release && sudo dnf install -y sshpass`):

```bash
sshpass -p '<password>' ssh-copy-id -o StrictHostKeyChecking=no \
  <cluster_user>@<child_node>
```

#### Path B: Manual `authorized_keys` Setup (fallback)

Use this when `ssh-copy-id` is unavailable, when password SSH is disabled, or
when you provision child nodes through cloud-init, a config management tool,
or a Kickstart image.

1. On the master, print the public key you want to authorize:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   # or ~/.ssh/id_rsa.pub
   ```

2. On the child node, append that exact line to the cluster user's
   `authorized_keys`:

   ```bash
   sudo mkdir -p /home/<cluster_user>/.ssh
   sudo chmod 700 /home/<cluster_user>/.ssh

   # Append the public key (paste between the quotes)
   echo 'ssh-ed25519 AAAA... user@master' | \
     sudo tee -a /home/<cluster_user>/.ssh/authorized_keys

   sudo chmod 600 /home/<cluster_user>/.ssh/authorized_keys
   sudo chown -R <cluster_user>:<cluster_user> /home/<cluster_user>/.ssh
   ```

3. Confirm that `sshd` allows key authentication. On most modern distros, this is
   the default. If you have hardened the host, ensure
   `/etc/ssh/sshd_config` (and any drop-ins) includes:

   ```
   PubkeyAuthentication yes
   ```

   Reload SSH after edits: `sudo systemctl reload sshd`.

### Step 4.3. Grant Passwordless `sudo` on Each Child Node

Ansible runs as the cluster user and elevates with `become`. That requires
`sudo` without a password prompt on every child node.

On the child node, create a sudoers drop-in:

```bash
echo '<cluster_user> ALL=(ALL) NOPASSWD: ALL' | \
  sudo tee /etc/sudoers.d/<cluster_user>-nopasswd
sudo chmod 440 /etc/sudoers.d/<cluster_user>-nopasswd
sudo visudo -cf /etc/sudoers.d/<cluster_user>-nopasswd
```

The final `visudo -c` check should print `parsed OK`. If it does not, fix
the file before disconnecting your current sudo session or you risk locking
yourself out.

### Step 4.4. Verify Connectivity from the Master

For every child node, run these from the master:

```bash
ssh <cluster_user>@<child_node> "hostname"
ssh <cluster_user>@<child_node> "sudo -n true && echo SUDO_OK"
```

Both commands must succeed without any prompt. `SUDO_OK` must print for the
sudo check.

### Step 4.5. Verify Your Inventory Matches Reality

Whatever IP, hostname, and user you used above must also appear in
`ansible/inventory/cluster.yml`:

- `ansible_host` must match the value you SSH'd to.
- `ansible_user` must match the cluster user you SSH'd as.
- `es_publish_host` must match an entry in `es_cluster_seed_hosts`.

If the install fails at Gathering facts or ping for a node, the
mismatch is almost always in this section or in Step 4.4.

## 5. Optional: Shared Snapshot Storage (NFS)

You only need this section if you intend to use the Elasticsearch
**filesystem** snapshot repository on a multi-node cluster. 

The Elasticsearch `fs` repository requires that **the same directory** is
visible at **the same path** on **every** data node. NFS is the most common
way to provide that.

### 5.1. Configure NFS on the Master (server)

**Ubuntu / Debian:**

```bash
sudo apt-get install -y nfs-kernel-server
sudo mkdir -p /srv/es-snapshots
sudo chmod 777 /srv/es-snapshots
```

**RHEL 9 / Rocky / Alma (back the export from `/var` so it is not on the small
root LV):**

```bash
sudo dnf install -y nfs-utils
sudo mkdir -p /var/lib/lme/es-snapshots /srv/es-snapshots
sudo chmod 777 /var/lib/lme/es-snapshots /srv/es-snapshots
sudo mount --bind /var/lib/lme/es-snapshots /srv/es-snapshots
echo '/var/lib/lme/es-snapshots /srv/es-snapshots none bind 0 0' | \
  sudo tee -a /etc/fstab
sudo chcon -Rt container_file_t /var/lib/lme/es-snapshots /srv/es-snapshots
```

**Export to each node's private IP. For a three-node cluster with IPs
`10.0.0.4`, `10.0.0.5`, `10.0.0.6`:**

```bash
echo '/srv/es-snapshots 10.0.0.4(rw,sync,no_subtree_check,no_root_squash) 10.0.0.5(rw,sync,no_subtree_check,no_root_squash) 10.0.0.6(rw,sync,no_subtree_check,no_root_squash)' \
  | sudo tee /etc/exports
sudo exportfs -ra
```

**Start and enable the NFS server:**

```bash
# Ubuntu / Debian
sudo systemctl enable --now nfs-kernel-server

# RHEL / Rocky / Alma (also open firewalld if active)
sudo systemctl enable --now nfs-server
if systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --permanent --add-service=nfs
    sudo firewall-cmd --permanent --add-service=mountd
    sudo firewall-cmd --permanent --add-service=rpc-bind
    sudo firewall-cmd --reload
fi
```

### 5.2. Mount the Share on Every Node

On the **master**, use a bind mount if you don't have a separate NFS server (avoids NFS self-mount hangs):

```bash
sudo mkdir -p /mnt/es-snapshots
sudo mount --bind /srv/es-snapshots /mnt/es-snapshots
echo '/srv/es-snapshots /mnt/es-snapshots none bind 0 0' | \
  sudo tee -a /etc/fstab
```

On each **child node**, install the NFS client and mount the master's export
(replace `10.0.0.4` with your master's private IP):

```bash
# Ubuntu / Debian
sudo apt-get install -y nfs-common
# RHEL / Rocky / Alma
sudo dnf install -y nfs-utils

sudo mkdir -p /mnt/es-snapshots
sudo mount -t nfs -o vers=4.1,proto=tcp,hard,timeo=600,retrans=2 \
  10.0.0.4:/srv/es-snapshots /mnt/es-snapshots
echo '10.0.0.4:/srv/es-snapshots /mnt/es-snapshots nfs vers=4.1,proto=tcp,hard,timeo=600,retrans=2,_netdev,nofail 0 0' \
  | sudo tee -a /etc/fstab
```

On RHEL-family hosts with SELinux enforcing, also label the client mount so
the Elasticsearch container can read and write it:

```bash
sudo chmod 777 /mnt/es-snapshots
sudo chcon -Rt container_file_t /mnt/es-snapshots
```

### 5.3. Wire Elasticsearch to the Snapshot Path

On **every node**, add the snapshot path to `path.repo` in
`/opt/lme/config/elasticsearch.yml`:

```yaml
path.repo:
    - /usr/share/elasticsearch/backups
    - /usr/share/elasticsearch/snapshots
```

On **every node**, create a Quadlet drop-in so the Elasticsearch container
mounts the shared directory, and then reload and restart Elasticsearch:

```bash
sudo mkdir -p /etc/containers/systemd/lme-elasticsearch.container.d/
cat <<'EOF' | sudo tee /etc/containers/systemd/lme-elasticsearch.container.d/nfs-mount.conf
[Container]
Volume=/mnt/es-snapshots:/usr/share/elasticsearch/snapshots
EOF
sudo systemctl daemon-reload
sudo systemctl restart lme-elasticsearch
```

Once every node has restarted, the shared `/mnt/es-snapshots` directory is
available inside each Elasticsearch container at
`/usr/share/elasticsearch/snapshots`.

### 5.4. Use the Shared Path in Snapshot Playbooks

```bash
ansible-playbook -i ansible/inventory/cluster.yml ansible/snapshot_elasticsearch.yml \
  -e es_snapshot_fs_location=/usr/share/elasticsearch/snapshots \
  -e es_snapshot_repo=lme_nfs_backups
```

## 6. Advanced and Specialized Workflows

These workflows are covered in dedicated docs in the repository. They are
not required for a first install.

- **Cluster child node recovery** - `testing/v2/development/CLUSTER_NODE_RECOVERY.md`
- **Cluster backup and recovery model** - `ansible/CLUSTER_RECOVERY_README.md`
- **Snapshot reference (single-node and cluster)** - `ansible/SNAPSHOT_README.md`
- **Password and secret rotation reference** - `ansible/PASSWORD_README.md`
- **Backup operations** - `ansible/BACKUP_README.md`
- **Rollback (single-node)** - `ansible/ROLLBACK_README.md`
- **Single-node to cluster conversion** - `testing/v2/development/converting_to_cluster.md`
- **Azure test cluster automation** - `testing/v2/installers/cluster_installer/README.md`
- **Cluster admin command reference** - `testing/v2/development/CLUSTER_COMMANDS.md`
- **Original cluster install reference** - `testing/v2/development/CLUSTER_INSTALL.md`

## 7. Troubleshooting

### Child Node Will Not Join the Cluster

Check Elasticsearch logs on the affected node:

```bash
sudo podman logs lme-elasticsearch
```

Common causes:

- Firewall blocking `9200/tcp` or `9300/tcp`.
- `es_publish_host` not reachable from other nodes.
- `es_publish_host` not listed in `es_cluster_seed_hosts`.
- Certificate not yet distributed to that node.

### Ansible Cannot Reach a Node

```bash
ssh <cluster_user>@<child_node> "hostname"
ssh <cluster_user>@<child_node> "sudo -n true && echo SUDO_OK"
```

Both must succeed without prompting. If they do not, redo Section 4 for that
node, and then re-run with `./install.sh --cluster --cluster-nodes-only`.

### Certificate Regeneration

Certificates are generated on the master and distributed to cluster nodes.
To regenerate, run:

```bash
cd ~/LME
ansible-playbook -i ansible/inventory/cluster.yml ansible/elasticsearch.yml --tags certificates
```

### Unassigned Shards After Install

```bash
# use the -p flag to see the secrets and the -q flag to hide them
source /opt/lme/scripts/extract_secrets.sh -p
curl -sk -u "elastic:$elastic" "https://localhost:9200/_cat/shards?v&s=state" | grep UNASSIGNED
```

This is normal briefly during cluster formation. If shards stay unassigned,
inspect cluster allocation:

```bash
curl -sk -u "elastic:$elastic" \
  https://localhost:9200/_cluster/allocation/explain?pretty
```

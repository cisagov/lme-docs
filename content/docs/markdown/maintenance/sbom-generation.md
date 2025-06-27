---
title: Software Bill of Materials (SBOM) Generation
---
# Software Bill of Materials (SBOM) Generation

## Introduction

The `LME/scripts/sbom` directory is for advanced users that want to generate a Software Bill of Materials (SBOM) for Logging Made Easy (LME). It includes two scripts: 

- A shell script for generating SBOM files from the installed containers and the LME repository
  
- A Python script for grabbing installed apt and nix packages from the installation playbooks

The shell script uses the tool [syft](https://github.com/anchore/syft) to generate
SBOM files for each container and the LME directory.

**Note: Syft does not scan Ansible yaml files -- the Python script handles that.**

## Generating SBOM Files

### LME Containers

To generate an SBOM for the Podman containers and LME directory (excluding the install script), run the following shell script:

```bash
LME/scripts/sbom/generate-container-sbom.sh
```

The script will take approximately 15-20 minutes to complete.

<span style="color:orange">**Warning: This script installs the 'syft' tool on the host machine and creates a Podman socket. Do not proceed unless you have reviewed and understand the script's behavior.** </span>

Because the script accesses Podman environment variables, you must run it using `sudo -i` and provide the full path to the script.

For example:

```bash
sudo -i /absolute/path/to/LME/scripts/sbom/generate-container-sbom.sh
```

This will:

- Install the `syft` tool onto the comptuer (if not already installed)
  
- Start a Podman socket
  
- Use `syft` to analyze each container and save the Software Package Data Exchange (SPDX) file
  
- Stop the Podman socket
  
- Use `syft` to scan the LME directory

All SBOM files will be saved to `LME/scripts/sbom/output/`. Each container will generate two files:

- A SPDX JSON file
  
- A syft table file

**Note: The total size of all SBOM files is approximately 40MB.**

### Ansible Playbook SBOM

The script `LME/scripts/sbom/generate-ansible-sbom.py` creates an SBOM for the Ansible install playbook. It scans install apt and nix packages and outputs an SPDX JSON SBOM file. This script requires the pyyaml Python package.

To install the `pyyaml` Python package, run:

```bash
python3 -m venv venv
source venv/bin/activate
pip install pyyaml

python3 ./generate-ansible-sbom.py
```

The resulting SBOM will be saved to `LME/scripts/sbom/output/ansible-spdx.json` in the SPDX JSON format.

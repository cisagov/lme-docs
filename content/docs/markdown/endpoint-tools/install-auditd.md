---
title: Installing and Configuring Auditd on Linux Systems
---
# Installing and Configuring Auditd on Linux Systems

This guide will walk you through the process of installing auditd on Linux systems and configuring it with the rules provided by Neo23x0.

## Prerequisites

- Root or sudo access to the Linux system
- Internet connection to download necessary files

## Steps to Install and Configure Auditd

1. **Install Auditd**

   The installation process may vary depending on your Linux distribution. 

   - For Ubuntu/Debian, run:

     ```bash
     sudo apt update
     sudo apt install auditd audispd-plugins
     ```

   - For CentOS/RHEL, run:

     ```bash
     sudo yum install audit audit-libs
     ```

   - For Fedora, run:

     ```bash
     sudo dnf install audit
     ```

2. **Download Sample Audit Rules**
  
   You can use Neo23x0's audit rules as a base or create your own. 

   - Open a **terminal window**.
   
   - Download the **audit rules file** by running:

     ```bash
     sudo curl -o /etc/audit/rules.d/audit.rules https://raw.githubusercontent.com/Neo23x0/auditd/master/audit.rules
     ```  

3. **Configure Auditd**

   - Open the **main auditd configuration file** by running:

     ```bash
     sudo nano /etc/audit/auditd.conf
     ```

   - Review and adjust the ***settings*** as needed.

   - Save and close the ***file***
     
     - In nano, press **Ctrl+X**, press **Y**, and then press **Enter**.

4. **Load the New Rules**

   - Load the ***new audit rules*** by running:
   
     ```bash
     sudo auditctl -R /etc/audit/rules.d/audit.rules
     ```

   - Restart the **auditd service** by running:
    
     ```bash
     sudo service auditd restart
     ```

5. **Verify Installation and Rules**

   - Check if **auditd is running** by running:
   
     ```bash
     sudo systemctl status auditd
     ```

   - Verify that the ***rules*** have been loaded by running:
   
     ```bash
     sudo auditctl -l
     ```

6. **Test Audit Logging**

   - Trigger a ***log*** by running a monitored command (e.g., accessing sensitive files, running specific commands).

   - Check the **audit log** for new entries by running:
   
     ```bash
     sudo ausearch -ts recent
     ```

## Updating Audit Rules

- To update the audit rules in the future:

1. Download the latest `audit.rules` file from the Neo23x0 GitHub repository or another trusted source.
   
2. Replace the ***existing file*** by running:
   
   ```bash
   sudo curl -o /etc/audit/rules.d/audit.rules https://raw.githubusercontent.com/Neo23x0/auditd/master/audit.rules
   ```
3. Reload the ***rules*** and restart **auditd** by running:
   
   ```bash
   sudo auditctl -R /etc/audit/rules.d/audit.rules
   sudo service auditd restart
   ```

   - Adjust rules as needed to meet compliance requirements.

   - You can now install the auditd elastic integration to collect auditd logs.

## Automated Installation Script (Optional)

For faster or repeatable Auditd installation, run the following shell script:

  ```bash
  #!/bin/bash

  set -e

  # Ensure the script is run as root
  if [ "$EUID" -ne 0 ]; then
      echo "Please run as root."
      exit 1
  fi

  # Inform the user that auditd is being installed
  echo "Installing and configuring auditd, please wait..."

  # Determine the OS ID
  if [ -f /etc/os-release ]; then
      . /etc/os-release
      OS_ID="$ID"
  else
      echo "Cannot determine the operating system."
      exit 1
  fi

  # Install auditd based on the OS
  case "$OS_ID" in
      ubuntu|debian)
          apt update > /dev/null 2>&1
          apt install -y auditd audispd-plugins > /dev/null 2>&1
          ;;
      centos|rhel)
          yum install -y audit > /dev/null 2>&1
          ;;
      fedora)
          dnf install -y audit > /dev/null 2>&1
          ;;
      *)
          echo "Unsupported OS: $OS_ID"
          exit 1
          ;;
  esac

  # Create the rules directory if it doesn't exist
  mkdir -p /etc/audit/rules.d > /dev/null 2>&1

  # Download the audit rules
  curl -o /etc/audit/rules.d/audit.rules https://raw.githubusercontent.com/Neo23x0/auditd/master/audit.rules > /dev/null 2>&1

  # Load the audit rules, suppressing output and errors
  augenrules --load > /dev/null 2>&1

  # Restart the auditd service, suppressing output
  systemctl restart auditd > /dev/null 2>&1

  # Notify the user of successful completion
  echo "auditd installed and rules applied successfully."
  ```

To use this script:

 1. Save it to a ***file*** (e.g., `install_auditd.sh`).
     
 2. Make it executable by running:

    `chmod +x install_auditd.sh`
     
 3. Run it with sudo:

    `sudo ./install_auditd.sh`

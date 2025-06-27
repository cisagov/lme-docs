---
title: Installing Sysmon on Windows Machines
---
# Installing Sysmon on Windows Machines

This guide will walk you through the process of installing Sysmon (System Monitor) on Windows machine(s) using the SwiftOnSecurity configuration for enhanced logging.

## Prerequisites

- Administrative access to the Windows machine
  
- Internet connection to download necessary files

## Steps to Install Sysmon

- **Download Sysmon**
   
   - Reference the official [Microsoft Sysinternals Sysmon page](https://docs.microsoft.com/en-us/sysinternals/downloads/sysmon).
     
   - Click on the **Download Sysmon link** to download the ZIP file.
     
   - Extract the ***contents of the ZIP file*** to a folder on your computer (e.g., `C:\Sysmon`)

- **Download SwiftOnSecurity Configuration**
   
   - Navigate to [sysmom-config](https://github.com/SwiftOnSecurity/sysmon-config/blob/master/sysmonconfig-export.xml).

   - Click the **Copy raw file button** to download the raw content.

   - Save the ***file*** into the Sysmon directory.

- **Install Sysmon**
   
   - Open an **elevated command prompt** with administrator privileges.
   
   - Navigate to the ***folder where you extracted Sysmon*** by running:
   
     ```bash
     cd C:\Sysmon
     ```
   - Run the following command to install Sysmon with the SwiftOnSecurity configuration:
     
     ```bash
     sysmon.exe -accepteula -i sysmonconfig-export.xml
     ```

- **Verify Installation**
   
   - Open **Event Viewer** (you can search for it in the Start menu).
   
   - Navigate to **Applications and Services Logs > Microsoft > Windows > Sysmon > Operational**.
   
   - Events being logged by Sysmon will be listed.

## Steps to Update Sysmon Configuration

- Download the latest **`sysmonconfig-export.xml`** from the SwiftOnSecurity GitHub repository.
   
- Open an **elevated command prompt** with administrator privileges.
   
- Navigate to the **Sysmon folder**.
   
- Run the **following command**:
   
  ```bash
  sysmon.exe -c sysmonconfig-export.xml
  ```

## Steps to Uninstall Sysmon

- Open an **elevated command prompt** with administrator privileges.
   
- Navigate to the ***Sysmon folder**.
   
- Run the **following command**:
   
  ```bash
  sysmon.exe -u
  ```

## Additional Notes

- You can now enable Sysmon log collection using the Windows Elastic agent integration.
  
- To install Sysmon on large quantities of machines, use a shared folder, or deployment tools such as System Center Configuration Manager (SCCM), Group Policy Objects (GPOs), or scripts.

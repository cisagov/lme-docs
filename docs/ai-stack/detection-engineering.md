---
title: "Detection Engineering"
sidebar_position: 8
description: "Step-by-step guide to managing detection rules in LME: import Kibana prebuilt rules, convert Sigma rules, create ElastAlert2 rules, and bulk-manage rules."
---

# Detection Engineering

The Detection Engineering view in the LME Dashboard is where you manage all your detection rules. LME supports three detection systems: **Elastic/Kibana prebuilt rules**, **Sigma rules** (converted and imported into Kibana), and **ElastAlert2 custom rules**. This page walks through exactly how to use each one.

## Accessing Detection Engineering

1. Open the dashboard at `https://<your-lme-server-ip>:8502`
2. Click the **Detection Engineering** tab in the navigation bar

The page has several sections stacked vertically, plus an AI assistant sidebar on the right.

---

## Importing Elastic Prebuilt Detection Rules

Elastic provides hundreds of prebuilt detection rules that cover common attack techniques (MITRE ATT&CK mapped). These rules are built into Kibana and just need to be activated.

### How to Import Prebuilt Rules

1. In the Detection Engineering view, find the **"Import Elastic Prebuilt Rules"** section
2. You will see a status line showing: `N installed — X available — Y updates`
3. Click the **"Import Elastic Prebuilt Rules"** button (yellow)
4. The button changes to **"Importing... this may take a minute"** with a spinner
5. Wait for the import to complete (this can take 1-2 minutes on first import as hundreds of rules are installed)
6. A result message appears: **"N rules installed, N skipped, N failed"**
7. The status line updates to show the new counts

:::info
Prebuilt rules are installed **disabled by default**. After importing, you need to enable the rules you want active. See [Enabling and Disabling Rules](#enabling-and-disabling-kibana-rules) below.
:::

### Upgrading Prebuilt Rules

Elastic periodically updates their prebuilt rules. When updates are available:

1. The status line will show a non-zero update count (e.g., "30 updates")
2. Click the **"Import"** button again — it handles both fresh installs and upgrades
3. Updated rules replace the old versions

### When to Use Prebuilt Rules

- **Best for:** Getting detection coverage quickly with minimal effort
- **Coverage:** Covers Windows, Linux, and macOS attack techniques
- **Examples:** Suspicious PowerShell, credential dumping, lateral movement, persistence mechanisms

---

## Managing Kibana Detection Rules

After importing rules (prebuilt or Sigma), they appear in the **Kibana Detection Rules** table.

### Finding Rules

The table has several filters:

1. **Search box** — type a rule name or keyword to filter (e.g., "powershell", "brute force")
2. **Enabled filter** dropdown — show All, Enabled only, or Disabled only
3. **OS/Tag filter** dropdown — filter by:
   - `OS: Windows`, `OS: Linux`, `OS: macOS` (Elastic prebuilt rules)
   - `Sigma Windows`, `Sigma Linux`, `Sigma macOS` (imported Sigma rules)

The table shows columns: **On/Off toggle**, **Rule Name** (with description), **Severity**, **Risk Score**, and **Status**.

Click any column header to sort by that column.

### Enabling and Disabling Kibana Rules

#### Enable/Disable a Single Rule

1. Find the rule in the table
2. Click the **toggle switch** next to the rule name
3. The rule is instantly enabled or disabled — no page reload needed

#### Enable/Disable Rules in Bulk by Checkbox

1. Check the **checkbox** next to each rule you want to change
2. A toolbar appears showing **"N selected"**
3. Click **"Enable Selected"** or **"Disable Selected"**
4. All checked rules are updated at once

#### Enable/Disable All Rules for an OS

Above the table, you will see **Bulk by OS** buttons for each platform:

- **OS: Windows** — [Enable All] [Disable All]
- **OS: Linux** — [Enable All] [Disable All]
- **OS: macOS** — [Enable All] [Disable All]
- **Sigma Windows** — [Enable All] [Disable All]
- **Sigma Linux** — [Enable All] [Disable All]
- **Sigma macOS** — [Enable All] [Disable All]

1. Click **"Enable All"** or **"Disable All"** next to the desired platform
2. A confirmation dialog appears: **"Enable ALL Windows rules?"**
3. Click **OK** to proceed
4. All matching rules are updated (this may take a moment for large rule sets)

:::tip
A good starting strategy: import all prebuilt rules, then enable only the platforms relevant to your environment (e.g., enable all Windows rules if you only monitor Windows endpoints).
:::

### Rule Pagination

The table shows 50 rules per page. Use the **Prev** and **Next** buttons at the bottom to navigate. A counter shows "Showing X-Y of Z".

---

## Sigma Rules

[Sigma](https://sigmahq.io/) is a generic, open-source signature format for SIEM systems. LME can download the entire SigmaHQ rule collection, convert the rules to Kibana-compatible format, and import them.

### Download and Convert the Full SigmaHQ Collection

This downloads all Sigma rules from the [SigmaHQ repository](https://github.com/SigmaHQ/sigma) and converts them to Kibana NDJSON format.

1. In the Detection Engineering view, find the **"Sigma Rules"** section
2. Click the **"Download & Convert Latest"** button (purple)
3. The button shows **"Downloading & converting..."** with a spinner
4. Wait for the conversion to complete (this can take several minutes — it downloads all SigmaHQ rules, installs the sigma CLI tool, and converts thousands of rules)
5. When complete, **platform cards** appear showing:
   - **Windows** — number of converted rules, last conversion timestamp
   - **Linux** — number of converted rules, last conversion timestamp
   - **macOS** — number of converted rules, last conversion timestamp

### Upload Converted Rules to Kibana

After conversion, each platform card has an **"Upload to Kibana"** button:

1. Click **"Upload to Kibana"** on the platform you want (e.g., Windows)
2. The button shows **"Uploading..."** with a spinner
3. A result message appears: **"windows: N rules imported (all disabled by default)"**
4. The imported rules now appear in the Kibana Detection Rules table with a "Sigma Windows" (or "Sigma Linux", "Sigma macOS") tag

:::warning
All Sigma rules are imported **disabled by default** for safety. You must explicitly enable the rules you want. See [Enabling and Disabling Rules](#enabling-and-disabling-kibana-rules).
:::

:::info
Duplicate rules are not overwritten. If you re-import rules that already exist in Kibana, the duplicates will be skipped and reported as errors in the result.
:::

### Upload Individual Sigma YAML Files

If you have your own Sigma rules (or downloaded individual rules from SigmaHQ), you can convert and import them directly:

1. Click the **"Upload YAML"** button (gray) in the Sigma section
2. A file picker opens — select one or more `.yml` or `.yaml` Sigma rule files
3. The button shows **"Converting..."**
4. The dashboard:
   - Detects the platform for each rule (from the `logsource.product` field)
   - Applies the correct conversion pipeline (`ecs_windows` for Windows, generic for others)
   - Converts to NDJSON format and uploads to Kibana
5. A result message appears: **"N rules imported from M YAML files (all disabled by default)"**

**Example Sigma YAML file:**

```yaml
title: Suspicious PowerShell Download
status: test
logsource:
    product: windows
    category: process_creation
detection:
    selection:
        CommandLine|contains:
            - 'Invoke-WebRequest'
            - 'wget'
            - 'curl'
    condition: selection
level: medium
```

### Upload Pre-Converted NDJSON Files

If you already have Sigma rules in Kibana NDJSON format (e.g., from a previous conversion or a colleague):

1. Click the **"Upload NDJSON"** button (gray)
2. A file picker opens — select a `.ndjson` file
3. The button shows **"Uploading..."**
4. The rules are imported directly into Kibana
5. A result message appears: **"N rules imported from filename.ndjson (all disabled by default)"**

### How Sigma Conversion Works (Behind the Scenes)

The conversion pipeline:

1. Downloads the latest `sigma_all_rules.zip` from the SigmaHQ GitHub release
2. Extracts rules into `windows/`, `linux/`, `macos/` directories
3. Installs `sigma-cli` and the `elasticsearch` backend plugin
4. Runs `sigma convert` for each platform:
   - **Windows:** target=lucene, pipeline=ecs_windows, format=siem_rule_ndjson
   - **Linux/macOS:** target=lucene, no pipeline, format=siem_rule_ndjson
5. Post-processes the output:
   - Tags each rule with its platform (e.g., "Sigma Windows")
   - Downgrades "informational" severity to "low" (Kibana does not support "informational")
   - Sets all rules to `enabled: false`
6. Produces NDJSON files ready for Kibana import

---

## ElastAlert2 Rules

[ElastAlert2](https://elastalert2.readthedocs.io/) is a separate alerting framework that runs custom detection rules against Elasticsearch data. Unlike Kibana rules, ElastAlert2 rules are YAML files stored on disk.

ElastAlert2 automatically picks up new or changed rules within 5 minutes.

### Viewing Existing Rules

In the Detection Engineering view, the **"ElastAlert2 Rules"** section shows all current rules with:
- Rule name
- Filename (monospace)
- Rule type badge (frequency, any, flatline, etc.)
- Index pattern the rule queries

Click any rule row to **expand** it and see the full YAML content.

### Creating a Rule by Pasting YAML

1. Click the **"Paste YAML"** button in the ElastAlert2 section
2. A dialog opens with a text area
3. Paste your ElastAlert2 rule YAML into the text area. Example:

   ```yaml
   name: Multiple Failed SSH Logins
   type: frequency
   index: logs-*
   num_events: 10
   timeframe:
     minutes: 5
   filter:
     - query:
         query_string:
           query: "event.action:ssh_login AND event.outcome:failure"
   alert:
     - debug
   ```

4. Optionally enter a **filename** in the text field below (e.g., `ssh_brute_force.yml`). If you leave this blank, the filename is auto-generated from the rule's `name` field.
5. Click **"Save Rule"**
6. The dialog shows **"Saved as ssh_brute_force.yml"** in green, then closes automatically
7. The rule appears in the list

**Validation:** The YAML must:
- Be valid YAML syntax
- Parse as a mapping (key-value pairs, not a list or scalar)
- Have a `name` field if you do not provide a filename

### Creating a Rule by Uploading a File

1. Click the **"Upload File"** button (green) in the ElastAlert2 section
2. A file picker opens — select one or more `.yml` or `.yaml` files
3. The button shows **"Uploading..."**
4. Each file is validated and saved to `/opt/lme/config/elastalert2/rules/`
5. A result message shows: **"Uploaded N rules"** (with errors listed if any files were invalid)
6. The rule list updates automatically

### Deleting a Rule

1. Find the rule in the list
2. Click the **trash icon** on the right side of the rule row
3. A confirmation dialog appears: **"Delete rule 'filename'?"**
4. Click **OK** to confirm
5. The rule is removed from disk and disappears from the list

### ElastAlert2 Rule Examples

**Frequency rule** — alert when an event happens too many times:

```yaml
name: Brute Force Login Attempts
type: frequency
index: logs-*
num_events: 20
timeframe:
  minutes: 10
filter:
  - query:
      query_string:
        query: "event.action:logon-failed"
alert:
  - debug
```

**Any rule** — alert on every matching event:

```yaml
name: New Service Installed
type: any
index: logs-*
filter:
  - query:
      query_string:
        query: "event.code:7045"
alert:
  - debug
```

**Flatline rule** — alert when events stop arriving (dead host detection):

```yaml
name: No Logs from Critical Server
type: flatline
index: logs-*
threshold: 1
timeframe:
  minutes: 30
filter:
  - term:
      host.name: "critical-server-01"
alert:
  - debug
```

:::tip
Using `alert: [debug]` writes alerts to the ElastAlert2 log. For production, configure email, Slack, or other alert destinations per the [ElastAlert2 documentation](https://elastalert2.readthedocs.io/en/latest/ruletypes.html#alerts).
:::

---

## KEV Overview (on Detection Engineering Page)

At the bottom of the Detection Engineering view, three stat cards show:

- **Total KEVs** — how many vulnerabilities are in the local CISA catalog copy
- **CVEs Matched** — how many KEV vulnerabilities were found on your hosts (highlighted orange if > 0)
- **Overdue** — how many matched KEVs are past the CISA remediation due date (highlighted red if > 0)

A link to the full CISA KEV catalog opens in a new tab.

For full KEV management, see [KEV Integration](./kev-integration.md).

---

## Detection Assistant (AI Sidebar)

The right side of the Detection Engineering view has a dedicated **Detection Assistant** AI chat panel. It works identically to the Alerts AI chat (see [Using the AI Chat](./ai-chat.md)) but has its own independent conversation history.

The Detection Assistant is pre-configured with context about detection engineering topics. Good questions to ask:

- "How do I write an ElastAlert2 rule that detects lateral movement?"
- "What Sigma rules cover ransomware behavior?"
- "How do I tune a noisy Kibana detection rule?"
- "What does Sysmon Event ID 10 detect?"
- "Write a Sigma rule for detecting PowerShell encoded commands"

---

## Vulnerability Report Submission

At the bottom of the Detection Engineering page:

1. Paste a vulnerability report into the text area
2. Click **"Submit Report"**
3. The report is submitted to the backend

:::info
This feature is currently a stub — reports are received but not processed further. It will be expanded in a future release.
:::

---

## Recommended Workflow for New LME Deployments

If you just installed LME and want to get detection rules running, follow these steps in order:

### Step 1: Import Prebuilt Elastic Rules

1. Go to **Detection Engineering**
2. Click **"Import Elastic Prebuilt Rules"**
3. Wait for the import to complete

### Step 2: Enable Rules for Your Platforms

1. In the Kibana Detection Rules table, use the **Bulk by OS** buttons
2. Click **"Enable All"** next to the platforms in your environment:
   - Have Windows endpoints? Enable **OS: Windows**
   - Have Linux servers? Enable **OS: Linux**

### Step 3: Add Sigma Rules for Broader Coverage

1. Click **"Download & Convert Latest"** in the Sigma section
2. After conversion, click **"Upload to Kibana"** for each platform
3. Use the **Bulk by OS** buttons to enable Sigma rules selectively:
   - Enable **Sigma Windows** for Windows coverage
   - Enable **Sigma Linux** for Linux coverage

### Step 4: Create Custom Rules for Your Environment

1. Write ElastAlert2 rules for organization-specific detections (VPN anomalies, specific application alerts, etc.)
2. Upload or paste them in the ElastAlert2 section

### Step 5: Review Alerts

1. Switch to the **Alerts** tab
2. Monitor the Kibana Alerts and Wazuh Alerts tabs for matches
3. Use the **Analyze** button to get AI explanations of any alert you do not understand

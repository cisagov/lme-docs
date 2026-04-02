---
title: "Detection Engineering Overview"
sidebar_position: 1
description: "Technical specification for LME detection engineering: goals, design philosophy, implementation stages, and how detection engineering supports LME users."
---

# Detection Engineering Overview

This document describes the detection engineering program for LME — the goals, design, and implementation stages.

## Goals

1. Implement a Detection Engineering Environment for repeatable experiments
2. Build a map of threats for LME users based on the MITRE ATT&CK framework
3. Integrate threats into MITRE Caldera replayable scripts
4. Ensure overlapping detections and applicable mitigations for threat attack scripts
5. Integrate attack and detection into regression tests for the CI/CD pipeline

### Stretch Goals

6. Increase complexity of attacks to Stage 2 and support Active Directory / router virtual machine templates
7. Increase attack complexity to Stage 3 and support internet-style attack simulations

---

## What is Detection Engineering?

Detection engineering is about creating a culture, as well as a process, for developing, evolving, and tuning detections to defend against current threats.

It involves the following steps:

1. Identify threats
2. Collect logs / visibility
3. Build mitigations
4. Validate they work
5. Repeat as needed

## How Detection Engineering Supports LME Users

### Active Defense

- Create documentation to answer "what do I do with LME for X defense need?"
- Develop detections **and** response capabilities for applicable threats
- Define the threats that users need mitigations for today

### Actionable Visibility

- Expand documentation for logging types
- Expand coverage for types of ingestion to PCAPs, syslog, cloud, etc.
- Confirm that users can see activity

---

## Components

![Detection Engineering Flow](/img/detection-engineering/DetEngFlow.drawio.png)

1. We begin with a **simulation** that emulates an actor and its behavior in a virtual network environment.
2. This produces:
   - Repeatable cyber range configuration
   - Logs of activity
   - Detections to notify on attack activity
   - Attacker profile to understand what the attack emulates
   - Attack script to re-run the attack
3. Those pieces feed into GitHub CI/CD for validation
4. The detections and actor profile feed into data LME users can use for:
   - Dashboard understanding
   - Forensic reports to understand how to use LME
   - Alerts to notify on similar malicious activity
   - Wazuh mitigations to stop attacks

---

## Implementation Stages

### Stage 0 — Foundations

Lay the infrastructure foundations described above.

### Stage 1 — Simple Range

Single VLAN, basic endpoint telemetry, Caldera agent enrollment.

![Stage 1 Diagram](/img/detection-engineering/DetEng-Simple.drawio.png)

### Stage 2 — Active Directory

Add domain controllers and router VMs for more realistic network topology.

![Stage 2 Diagram](/img/detection-engineering/stage-2-diagram.drawio.png)

### Stage 3 — Volt Typhoon Simulation

Internet-style attack simulation with advanced threat emulation.

![Stage 3 Diagram](/img/detection-engineering/stage3-volt-typhoon.drawio.png)

---

## Further Reading

- [Ludus Range Experiment](./ludus-experiment) — deploying the Stage 1 validation range
- [Range Configuration Reference](./range-config) — VM inventory and Ludus config details
- [MITRE Caldera](https://caldera.mitre.org/)
- [LME on GitHub](https://github.com/cisagov/LME)
- [Ludus Documentation](https://docs.ludus.cloud)

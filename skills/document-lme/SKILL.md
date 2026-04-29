---
description: Generate or update LME documentation based on code changes. Analyzes git diffs, maps changes to affected docs, walks you through creating/editing markdown, previews locally, and opens a PR. Works from any repository.
disable-model-invocation: true
---

# /document-lme

Update CISA LME documentation based on code changes in the current repository.

## Overview

This skill works from **any repository** — it inspects your current git state, identifies what LME features changed, clones lme-docs, guides you through doc updates, and opens a PR. Pass an optional scope argument to narrow the focus: `/document-lme install` or `/document-lme wazuh`.

**Scope argument:** `$ARGUMENTS` (optional — feature area to focus on, e.g. "install", "wazuh", "alerting")

## Step 0: Gather Context from Current Repo

You are likely NOT in the lme-docs repo. Analyze the current working directory to understand what changed:

```bash
# What repo are we in?
git remote get-url origin

# What branch and recent commits?
git log --oneline -20

# What files changed (staged + unstaged)?
git diff --stat HEAD~5

# Full diff of recent changes
git diff HEAD~5
```

If `$ARGUMENTS` is provided, focus the diff analysis on files related to that scope.

Read the diffs carefully. Identify:
- New features added
- Existing features modified
- Configuration changes
- API/CLI changes
- Bug fixes that affect user-facing behavior

Present a summary to the user:
```
I've analyzed your recent changes. Here's what I found:

**Changes detected:**
- [describe each significant change]

**Documentation impact:**
- [which docs need updating/creating]

Shall I proceed with updating the LME docs?
```

## Step 1: Clone or Locate lme-docs

```bash
# Check if lme-docs is already cloned nearby
if [ -d "../lme-docs" ]; then
  echo "Found lme-docs at ../lme-docs"
elif [ -d "../../lme-docs" ]; then
  echo "Found lme-docs at ../../lme-docs"
else
  # Clone it
  gh repo clone cisagov/lme-docs ../lme-docs
fi
```

Once located, make sure we're on the `develop` branch:
```bash
cd <lme-docs-path>
git checkout develop
git pull origin develop
```

## Step 2: Map Changes to Docs

Use this mapping to determine which doc files are affected:

| LME Feature Area | Affected Docs |
|---|---|
| Installation scripts, deploy process | `docs/install/normal-install.md`, `docs/install/air-gapped.md` |
| Prerequisites, system requirements | `docs/prerequisites.md` |
| Wazuh agent, enrollment, config | `docs/agents/wazuh-agent-management.md`, `docs/agents/wazuh-active-response.md`, `docs/maintenance/wazuh-configuration.md` |
| Elastic agent, Fleet | `docs/agents/elastic-agent-management.md` |
| Sysmon rules, config | `docs/endpoint-tools/install-sysmon.md` |
| Auditd rules, config | `docs/endpoint-tools/install-auditd.md` |
| ElastAlert rules, alerting | `docs/integrations/elastalert.md`, `docs/maintenance/elastalert-rules.md` |
| Sigma rules, detection | `docs/integrations/sigma-rules.md` |
| Dashboard changes | `docs/reference/dashboard-descriptions.md` |
| Architecture, components | `docs/reference/architecture.md`, `docs/reference/security-model.md` |
| Configuration, env vars | `docs/reference/configuration.md` |
| Passwords, secrets | `docs/reference/passwords.md` |
| TLS, certificates | `docs/maintenance/certificates.md`, `docs/maintenance/encryption-at-rest.md` |
| Backups, snapshots | `docs/maintenance/backups.md` |
| Storage, volumes | `docs/maintenance/volume-management.md`, `docs/maintenance/estimating-data-storage-requirements.md` |
| Index lifecycle, retention | `docs/maintenance/index-management.md`, `docs/logging-guidance/retention.md` |
| Upgrade process | `docs/maintenance/upgrading.md`, `docs/upgrade-guide/` |
| Cloud deployment | `docs/logging-guidance/cloud.md` |
| Syslog forwarding | `docs/logging-guidance/syslog-forwarding.md` |
| Log filtering | `docs/logging-guidance/filtering.md` |
| Proxy configuration | `docs/reference/proxy-installation-guide.md` |
| FAQ, common issues | `docs/reference/faq.md`, `docs/reference/troubleshooting.md` |
| Vulnerability scanning, SBOM | `docs/maintenance/vulnerability-scan-setup.md`, `docs/maintenance/sbom-generation.md` |
| New feature (no existing doc) | Create new file in the appropriate section |

Read each affected doc file in lme-docs to understand current content before proposing changes.

## Step 3: Walk User Through Content Changes

For each affected doc, present what needs changing and ask for approval.

### Docusaurus Conventions

**Frontmatter** (required on every .md file):
```yaml
---
title: "Page Title"
sidebar_position: 3
description: "Brief description for search"
---
```

**Category directories** need `_category_.json`:
```json
{
  "label": "Section Name",
  "position": 5,
  "link": {
    "type": "generated-index",
    "description": "Section description"
  }
}
```

**Content rules:**
- `#` for page title, `##` for sections, `###` for subsections
- Admonitions: `:::warning`, `:::tip`, `:::info`
- Cross-references: `[Link Text](/docs/section/page)`
- Images: `![Alt](/img/filename.png)` (add files to `static/img/`)
- Code blocks with language: ` ```bash`, ` ```yaml`, etc.
- File names: lowercase kebab-case (`my-feature.md`)

### For new docs:
1. Pick the right section directory from the mapping
2. Create the file with proper frontmatter
3. Check sibling files for `sidebar_position` numbering
4. Add cross-references to related docs

### For existing docs:
1. Read current content first
2. Show a diff of proposed changes
3. Preserve existing style and structure
4. Update cross-references if needed

## Step 4: Local Preview

After making changes in lme-docs, spin up a local preview:

```bash
podman run -d --name lme-docs-preview -p 3000:80 ghcr.io/cisagov/lme-docs:develop
```

Use Playwright MCP to verify each affected page:

1. Navigate: `mcp__playwright__browser_navigate({ url: "http://localhost:3000/docs/section/page" })`
2. Snapshot: `mcp__playwright__browser_snapshot()`
3. Screenshot: `mcp__playwright__browser_screenshot()`

Verify:
- Page renders without errors
- Images load
- Sidebar position is correct
- Links resolve
- Code blocks have syntax highlighting

Show screenshots to user for approval.

Clean up when done:
```bash
podman stop lme-docs-preview && podman rm lme-docs-preview
```

## Step 5: Submit PR

```bash
# Get username
USERNAME=$(gh api user -q .login)

# Create branch in lme-docs
FEATURE=$(echo "$ARGUMENTS" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
BRANCH="${USERNAME}-${FEATURE:-docs-update}"

cd <lme-docs-path>
git checkout -b "$BRANCH" develop

# Stage and commit
git add docs/ blog/ static/img/
git commit -m "docs: <description of changes>"

# Push and open PR
git push -u origin "$BRANCH"
gh pr create --repo cisagov/lme-docs --base develop \
  --title "docs: <short description>" \
  --body "$(cat <<'EOF'
## Documentation Update

### Changes
- <list changes>

### Source
Changes based on work in <source-repo>#<pr-or-commit>

### Verification
- [x] Local preview verified
- [x] All links resolve
- [x] Images render correctly
EOF
)"
```

Return the PR URL to the user.

## lme-docs Repository Structure

```
docs/                          # All documentation content
  index.md                     # Docs landing page
  prerequisites.md             # Prerequisites
  cisa-resources.md            # CISA resources
  install/                     # Installation guides
    normal-install.md
    air-gapped.md
  agents/                      # Agent management
    elastic-agent-management.md
    wazuh-agent-management.md
    wazuh-active-response.md
  endpoint-tools/              # Endpoint log collection
    install-sysmon.md
    install-auditd.md
  integrations/                # Third-party integrations
    elastalert.md
    sigma-rules.md
  logging-guidance/            # Logging best practices
    cloud.md
    filtering.md
    retention.md
    syslog-forwarding.md
  maintenance/                 # Operations & maintenance
    backups.md
    certificates.md
    elastalert-rules.md
    encryption-at-rest.md
    estimating-data-storage-requirements.md
    index-management.md
    sbom-generation.md
    upgrading.md
    volume-management.md
    vulnerability-scan-setup.md
    wazuh-configuration.md
  reference/                   # Architecture & troubleshooting
    architecture.md
    configuration.md
    dashboard-descriptions.md
    faq.md
    passwords.md
    proxy-installation-guide.md
    security-model.md
    troubleshooting.md
  learning/                    # Training modules
  upgrade-guide/               # Version upgrade guides
blog/                          # LME News / blog posts
static/img/                    # Images
docusaurus.config.js           # Site configuration
sidebars.js                    # Auto-generated from filesystem
Containerfile                  # Container build
```

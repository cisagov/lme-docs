# LME Docs Contributor Skill

Help contributors update documentation for CISA's Logging Made Easy (LME) project. Given a description of LME code changes, analyze which docs need updating, guide content creation, verify rendering locally, and submit a PR.

## Repository Structure

This is a Docusaurus 3.x site. Key paths:

```
docs/                          # All documentation content
  index.md                     # Landing page (slug: /)
  prerequisites.md             # Prerequisites
  cisa-resources.md            # CISA resources
  install/                     # Installation guides
    normal-install.md          #   Standard installation
    air-gapped.md              #   Air-gapped installation
  agents/                      # Agent deployment & management
    elastic-agent-management.md
    wazuh-agent-management.md
    wazuh-active-response.md
  endpoint-tools/              # Endpoint log collection
    install-sysmon.md          #   Windows Sysmon
    install-auditd.md          #   Linux Auditd
  integrations/                # Third-party integrations
    elastalert.md              #   ElastAlert2 rules
    sigma-rules.md             #   Sigma rule conversion
  logging-guidance/            # Logging best practices
    cloud.md                   #   Cloud deployment
    filtering.md               #   Log filtering
    retention.md               #   Retention policies
    syslog-forwarding.md       #   Syslog forwarding
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
    change-me.md
  learning/                    # Training modules
    module1.md
    module2.md
    module3.md
  upgrade-guide/               # Version upgrade guides
    README.md
blog/                          # LME News / blog posts
static/img/                    # Images referenced by docs
src/                           # React components, custom CSS
  components/
  css/
  pages/
docusaurus.config.js           # Site configuration
sidebars.js                    # Auto-generated from filesystem
Containerfile                  # Container build (nginx serving static)
```

## LME Feature-to-Docs Mapping

When a user describes code changes, map them to affected documentation:

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

## Workflow

### Step 1: Analyze Context

When the user describes LME code changes:

1. Identify every affected feature area from the mapping table above
2. Read each affected doc file to understand current content
3. Determine whether existing docs need updating or new docs need creating
4. Present a summary to the user:

```
Based on your changes, here's what needs documentation work:

**Docs to update:**
- `docs/agents/wazuh-agent-management.md` — Update enrollment steps for new flag
- `docs/reference/configuration.md` — Add new env var WAZUH_TIMEOUT

**New docs to create:**
- `docs/agents/wazuh-cluster-mode.md` — New guide for cluster deployment

Shall I proceed with these changes?
```

### Step 2: Create or Update Content

#### Docusaurus Frontmatter Format

Every markdown file must start with YAML frontmatter:

```yaml
---
title: "Human-Readable Page Title"
sidebar_position: 3
description: "Brief description for SEO and search"
---
```

- `title` — Required. Appears in sidebar and page header.
- `sidebar_position` — Required. Controls ordering within the section. Check sibling files for current positions and pick an appropriate slot.
- `description` — Optional but recommended. Used by search indexing.

#### Category Configuration

Each directory under `docs/` has a `_category_.json` file that controls sidebar grouping:

```json
{
  "label": "Section Name",
  "position": 3,
  "link": {
    "type": "generated-index",
    "description": "Brief description of this section"
  }
}
```

When creating a new section directory, always create a `_category_.json` alongside the docs.

#### Content Conventions

- Use `#` for the page title (should match frontmatter `title`)
- Use `##` for major sections, `###` for subsections
- Use Docusaurus admonitions for callouts:
  ```markdown
  :::warning
  Important warning text here.
  :::

  :::tip
  Helpful tip text here.
  :::

  :::info
  Informational note.
  :::
  ```
- Cross-reference other docs with relative paths: `[Install Guide](/docs/install/normal-install)`
- Images go in `static/img/` and are referenced as `![Alt text](/img/filename.png)`
- Code blocks should specify the language: ` ```bash`, ` ```yaml`, ` ```json`, etc.

#### Creating New Docs

When creating a new doc file:

1. Choose the correct section directory based on the feature mapping
2. Name the file with lowercase kebab-case: `feature-name.md`
3. Add frontmatter with `title`, `sidebar_position`, and optionally `description`
4. Follow the heading structure: `#` title, `##` sections, `###` subsections
5. Include cross-references to related docs where relevant
6. Add any images to `static/img/`

#### Updating Existing Docs

When updating an existing doc:

1. Read the current content first
2. Show the user a diff of proposed changes
3. Preserve the existing writing style and heading structure
4. Update any cross-references if section names change
5. Update the frontmatter `description` if the page scope changed

### Step 3: Build and Run Local Preview

**This step is mandatory before any PR is created.** The user must see and approve the rendered docs.

1. **Clean up any previous preview container:**
   ```bash
   podman stop lme-docs-preview 2>/dev/null; podman rm lme-docs-preview 2>/dev/null
   ```

2. **Build the docs container from the working copy:**
   ```bash
   podman build -t lme-docs-preview -f Containerfile .
   ```

3. **Run the preview container:**
   ```bash
   podman run -d --name lme-docs-preview -p 3000:80 lme-docs-preview
   ```

4. **Verify each affected page** using Playwright MCP tools:
   ```
   mcp__playwright__browser_navigate({ url: "http://localhost:3000/docs/PATH_TO_PAGE" })
   mcp__playwright__browser_screenshot()
   ```

   For each page, check:
   - Page renders without errors
   - Images load correctly
   - Sidebar shows the page in the correct position
   - Cross-reference links resolve
   - Code blocks have syntax highlighting
   - Admonitions (warnings, tips, info) render correctly

5. **Present screenshots to the user and ask for approval:**
   ```
   Here are the rendered pages with your changes:
   [show screenshots]

   Does everything look correct? Say "approved" to proceed with the PR, or tell me what to fix.
   ```

**STOP HERE.** Do NOT proceed to Step 4 until the user explicitly approves the preview.
If the user requests changes, edit the files, rebuild the container (repeat from step 1), and show new screenshots.

6. **Clean up** after approval (before PR step):
   ```bash
   podman stop lme-docs-preview && podman rm lme-docs-preview
   ```

### Step 4: Submit PR (only after user approves preview)

1. **Get GitHub username:**
   ```bash
   gh api user -q .login
   ```

2. **Create a branch** named `USERNAME-FEATURE_STRING` (e.g., `mreeve-snl-add-cloud-logging-docs`):
   ```bash
   git checkout -b USERNAME-FEATURE_STRING
   ```

3. **Stage and commit** changes:
   ```bash
   git add docs/ static/img/
   git commit -m "docs: description of documentation changes"
   ```

4. **Push and create PR** targeting the `develop` branch:
   ```bash
   git push -u origin USERNAME-FEATURE_STRING
   gh pr create --base develop --title "docs: short description" --body "$(cat <<'EOF'
   ## Documentation Update

   ### Changes
   - Updated X to reflect new Y behavior
   - Added new guide for Z

   ### Related LME Issue/PR
   Closes #ISSUE_NUMBER

   ### Verification
   - [x] Local preview verified
   - [x] All links resolve
   - [x] Images render correctly
   EOF
   )"
   ```

5. Return the PR URL to the user.

## Quick Reference

| Task | Command / Location |
|---|---|
| Build docs locally | `npm run build` (from repo root) |
| Dev server | `npm run start` (from repo root) |
| Container preview (local edits) | `podman build -t lme-docs-preview . && podman run -d -p 3000:80 --name lme-docs-preview lme-docs-preview` |
| Container preview (published) | `podman run -d -p 3000:80 ghcr.io/cisagov/lme-docs:develop` |
| Site base URL | `/lme-docs/` |
| Sidebar config | Auto-generated from `_category_.json` files |
| Search | `@easyops-cn/docusaurus-search-local` (offline, no Algolia) |
| PR target branch | `develop` |

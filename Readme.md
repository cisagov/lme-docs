# LME Documentation

CISA's [Logging Made Easy](https://github.com/cisagov/LME) documentation site, built with [Docusaurus 3.x](https://docusaurus.io/).

Live site: [cisagov.github.io/lme-docs](https://cisagov.github.io/lme-docs/)

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Contributing Documentation](#contributing-documentation)
- [CI/CD](#cicd)
- [Branching](#branching)

## Quick Start

### Run the published container (easiest)

```bash
podman run -d -p 3000:80 ghcr.io/cisagov/lme-docs:develop
# Open http://localhost:3000/
```

### Preview local edits with a container

Build and run a container from your working copy so you can see your changes before pushing:

```bash
# Build the image from your local source
podman build -t lme-docs-preview .

# Run it
podman run -d -p 3000:80 --name lme-docs-preview lme-docs-preview

# Open http://localhost:3000/
```

After making more edits, rebuild and restart:

```bash
podman stop lme-docs-preview && podman rm lme-docs-preview
podman build -t lme-docs-preview .
podman run -d -p 3000:80 --name lme-docs-preview lme-docs-preview
```

> **Tip:** The `/document-lme` AI agent skill uses this workflow automatically — it builds a local preview container, opens it for visual verification, then creates a PR when you're satisfied.

### Run locally with Node

```bash
npm ci
npm start
# Open http://localhost:3000/lme-docs/
```

> **Note:** `npm start` gives hot-reload (changes appear instantly), but serves at `/lme-docs/` instead of `/`. The container serves at `/` matching production behavior.

### Build for production

```bash
npm run build
npm run serve
```

## Project Structure

```
docs/                  # Documentation content (markdown)
  install/             # Installation guides
  agents/              # Agent management (Elastic, Wazuh)
  endpoint-tools/      # Sysmon, Auditd
  integrations/        # ElastAlert, Sigma rules
  logging-guidance/    # Cloud, filtering, retention, syslog
  maintenance/         # Backups, certs, upgrading, etc.
  reference/           # Architecture, FAQ, troubleshooting
  learning/            # Training modules
  upgrade-guide/       # Version upgrade guides
blog/                  # LME News / blog posts
static/img/            # Images
src/                   # React components, custom CSS
  components/          # CsvTable, HomepageFeatures
  css/                 # Theme overrides
  pages/               # Landing page
docusaurus.config.js   # Site configuration
sidebars.js            # Auto-generated from filesystem
Containerfile          # Container build (nginx serving static)
```

## Contributing Documentation

### Using the AI agent skill (recommended)

This repo includes a `/document-lme` agent skill at `.agent/skills/document-lme.md` that automates the documentation workflow:

1. Describe what LME feature changed
2. The skill maps changes to affected docs
3. It walks you through creating/editing markdown files
4. Builds a local preview container and shows you the rendered pages for approval
5. Only after you approve the preview, opens a PR to `develop` via `gh` CLI

#### Installing the skill

Copy the skill into your AI coding agent's skill/rules directory:

```bash
# Example: copy into your agent's config
cp .agent/skills/document-lme.md <YOUR_AGENT_SKILLS_DIR>/
```

Your agent may require additional frontmatter or wrapper format — consult your agent's documentation for how to register a skill or slash command.

**Prerequisites:** The skill expects `podman` (or `docker`) and `gh` CLI to be available.

### Manual workflow

1. **Branch from `develop`:**
   ```bash
   git checkout develop
   git checkout -b your-username-feature-name
   ```

2. **Add or edit docs** in `docs/`. Each markdown file needs frontmatter:
   ```yaml
   ---
   title: "Page Title"
   sidebar_position: 3
   description: "Brief description for search"
   ---
   ```

3. **Add new sections** by creating a directory with a `_category_.json`:
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

4. **Preview locally** (build from your working copy):
   ```bash
   podman build -t lme-docs-preview .
   podman run -d -p 3000:80 --name lme-docs-preview lme-docs-preview
   # Open http://localhost:3000/
   # Or for hot-reload: npm start → http://localhost:3000/lme-docs/
   ```

5. **Open a PR** targeting the `develop` branch:
   ```bash
   git push -u origin your-username-feature-name
   gh pr create --base develop
   ```

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `deploy.yml` | Push to `main` | Builds and deploys to GitHub Pages |
| `container.yml` | Push to `develop`/`main` | Builds container, scans with OSV-Scanner, pushes to GHCR |

### Security scanning

The container workflow runs:
- **`npm audit`** — checks npm dependencies for known CVEs
- **OSV-Scanner** (source) — recursively scans all lockfiles for vulnerable/malicious packages
- **OSV-Scanner** (container) — scans the built container image for OS and app-level vulnerabilities

All results appear in the GitHub Security tab.

All GitHub Actions are pinned to full commit SHAs to prevent supply chain attacks.

## Branching

- **`main`** — production; deploys to GitHub Pages
- **`develop`** — active development; all PRs target here

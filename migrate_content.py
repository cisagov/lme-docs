#!/usr/bin/env python3
"""
Content migration script: Hugo → Docusaurus
Handles frontmatter conversion and link rewriting for all docs.

@decision DEC-003 Remove intermediate markdown/ directory from URL structure
@decision DEC-004 Link rewriting: strip .md, remove /markdown/, fix absolute URLs
"""

import os
import re
import shutil
from pathlib import Path

WORKTREE = Path("/root/lme-docs/.worktrees/phase-1-migration")
CONTENT = WORKTREE / "content"
DOCS_OUT = WORKTREE / "docs"
BLOG_OUT = WORKTREE / "blog"

# ---------------------------------------------------------------------------
# Link rewriting helpers
# ---------------------------------------------------------------------------

def rewrite_links(text: str) -> str:
    """
    Rewrite all Hugo-style internal links to Docusaurus format:
    1. /docs/markdown/foo/bar.md  ->  /docs/foo/bar
    2. absolute https://cisagov.github.io/lme-docs/...  ->  relative /...
    3. Fix image paths: /docs/imgs/ -> /img/
    4. Fix CISA Resources -> cisa-resources
    """
    # Absolute URLs -> relative
    text = re.sub(
        r'https://cisagov\.github\.io/lme-docs(/[^\s\)\"\'\#]*)',
        lambda m: m.group(1),
        text
    )

    # /docs/markdown/... paths - strip .md and remove /markdown/
    # Handle with .md extension
    text = re.sub(
        r'\(/docs/markdown(/[^\s\)\"\'\#]*?)\.md(\#[^\s\)\"\']*)?\)',
        lambda m: '(' + '/docs' + m.group(1) + (m.group(2) or '') + ')',
        text
    )
    # Handle without .md extension
    text = re.sub(
        r'\(/docs/markdown(/[^\s\)\"\'\#]*?)(\#[^\s\)\"\']*)?\)',
        lambda m: '(' + '/docs' + m.group(1) + (m.group(2) or '') + ')',
        text
    )

    # Remaining /docs/... .md links (without /markdown/ already stripped above)
    text = re.sub(
        r'\(/docs(/[^\s\)\"\'\#]*?)\.md(\#[^\s\)\"\']*)?\)',
        lambda m: '(' + '/docs' + m.group(1) + (m.group(2) or '') + ')',
        text
    )

    # Fix CISA Resources references
    text = re.sub(r'CISA Resources\.md', 'cisa-resources', text)
    text = re.sub(r'/docs/markdown/CISA Resources\b', '/docs/cisa-resources', text)

    # Fix image paths: /docs/imgs/ -> /img/
    text = text.replace('/docs/imgs/', '/img/')

    # Fix Encryption_at_rest references
    text = re.sub(
        r'/docs/maintenance/Encryption_at_rest_option_for_users\b',
        '/docs/maintenance/encryption-at-rest',
        text
    )
    # Fix Proxy-Installation-Guide references
    text = re.sub(
        r'/docs/reference/Proxy-Installation-Guide\b',
        '/docs/reference/proxy-installation-guide',
        text
    )

    return text


def convert_frontmatter(content: str, sidebar_position: int = 1,
                         slug: str = None, title_override: str = None) -> str:
    """
    Convert Hugo frontmatter to Docusaurus format.
    - Add sidebar_position
    - Map linkTitle -> sidebar_label
    - Remove Hugo-specific fields: cascade, _build, type, menu
    """
    # Extract existing frontmatter
    fm_match = re.match(r'^---\s*\n(.*?\n)---\s*\n', content, re.DOTALL)
    if not fm_match:
        # No frontmatter - add minimal one
        title = title_override or "Documentation"
        new_fm = f'---\ntitle: {title}\nsidebar_position: {sidebar_position}\n---\n\n'
        return new_fm + content

    fm_block = fm_match.group(1)
    rest = content[fm_match.end():]

    lines = fm_block.split('\n')
    new_lines = []
    has_sidebar_position = False
    has_sidebar_label = False
    has_slug = False
    skip_indented = False  # skip indented lines after a removed key

    for line in lines:
        # Detect Hugo-specific top-level keys to remove
        if re.match(r'^(cascade|_build|type|menu|weight|geekdocNav|geekdocAnchor)\s*:', line):
            skip_indented = True
            continue
        # Skip indented continuation lines of removed keys
        if skip_indented and line and line[0] in (' ', '\t'):
            continue
        else:
            skip_indented = False

        # Convert linkTitle -> sidebar_label
        if re.match(r'^linkTitle\s*:', line):
            val = re.sub(r'^linkTitle\s*:\s*', '', line)
            new_lines.append(f'sidebar_label: {val}')
            has_sidebar_label = True
            continue
        if re.match(r'^sidebar_position\s*:', line):
            new_lines.append(f'sidebar_position: {sidebar_position}')
            has_sidebar_position = True
            continue
        if re.match(r'^slug\s*:', line):
            has_slug = True
            new_lines.append(line)
            continue
        new_lines.append(line)

    if not has_sidebar_position:
        new_lines.append(f'sidebar_position: {sidebar_position}')
    if slug and not has_slug:
        new_lines.append(f'slug: {slug}')

    # Clean up trailing blank lines inside frontmatter
    while new_lines and new_lines[-1].strip() == '':
        new_lines.pop()

    new_fm = '---\n' + '\n'.join(new_lines) + '\n---\n'
    return new_fm + rest


# ---------------------------------------------------------------------------
# Per-file migration
# ---------------------------------------------------------------------------

def migrate_file(src: Path, dst: Path, sidebar_position: int = 1,
                 slug: str = None, title_override: str = None):
    dst.parent.mkdir(parents=True, exist_ok=True)
    text = src.read_text(encoding='utf-8')
    text = convert_frontmatter(text, sidebar_position=sidebar_position,
                                slug=slug, title_override=title_override)
    text = rewrite_links(text)
    dst.write_text(text, encoding='utf-8')
    print(f"  migrated: {src.relative_to(WORKTREE)} -> {dst.relative_to(WORKTREE)}")


# ---------------------------------------------------------------------------
# Main migration map
# ---------------------------------------------------------------------------

def run():
    src_md = CONTENT / "docs" / "markdown"

    # docs/index.md already written manually - rewrite links only
    idx = DOCS_OUT / "index.md"
    if idx.exists():
        t = idx.read_text(encoding='utf-8')
        t = rewrite_links(t)
        idx.write_text(t, encoding='utf-8')
        print(f"  links rewritten: docs/index.md")

    # --- Prerequisites ---
    migrate_file(src_md / "prerequisites.md",
                 DOCS_OUT / "prerequisites.md", sidebar_position=2)

    # --- CISA Resources ---
    migrate_file(src_md / "CISA Resources.md",
                 DOCS_OUT / "cisa-resources.md", sidebar_position=11)

    # --- install/ ---
    migrate_file(src_md / "install" / "install.md",
                 DOCS_OUT / "install" / "install.md", sidebar_position=1)
    migrate_file(src_md / "install" / "air-gapped.md",
                 DOCS_OUT / "install" / "air-gapped.md", sidebar_position=2)

    # --- agents/ ---
    agents_src = src_md / "agents"
    migrate_file(agents_src / "elastic-agent-management.md",
                 DOCS_OUT / "agents" / "elastic-agent-management.md", sidebar_position=1)
    migrate_file(agents_src / "wazuh-agent-management.md",
                 DOCS_OUT / "agents" / "wazuh-agent-management.md", sidebar_position=2)
    migrate_file(agents_src / "wazuh-active-response.md",
                 DOCS_OUT / "agents" / "wazuh-active-response.md", sidebar_position=3)

    # --- endpoint-tools/ ---
    ep_src = src_md / "endpoint-tools"
    migrate_file(ep_src / "install-sysmon.md",
                 DOCS_OUT / "endpoint-tools" / "install-sysmon.md", sidebar_position=1)
    migrate_file(ep_src / "install-auditd.md",
                 DOCS_OUT / "endpoint-tools" / "install-auditd.md", sidebar_position=2)

    # --- integrations/ ---
    int_src = src_md / "integrations"
    migrate_file(int_src / "elastalert.md",
                 DOCS_OUT / "integrations" / "elastalert.md", sidebar_position=1)
    migrate_file(int_src / "sigma-rules.md",
                 DOCS_OUT / "integrations" / "sigma-rules.md", sidebar_position=2)

    # --- logging-guidance/ ---
    lg_src = src_md / "logging-guidance"
    migrate_file(lg_src / "cloud.md",
                 DOCS_OUT / "logging-guidance" / "cloud.md", sidebar_position=1)
    migrate_file(lg_src / "retention.md",
                 DOCS_OUT / "logging-guidance" / "retention.md", sidebar_position=2)
    migrate_file(lg_src / "filtering.md",
                 DOCS_OUT / "logging-guidance" / "filtering.md", sidebar_position=3)
    migrate_file(lg_src / "syslog-forwarding.md",
                 DOCS_OUT / "logging-guidance" / "syslog-forwarding.md", sidebar_position=4)

    # --- maintenance/ ---
    maint_src = src_md / "maintenance"
    migrate_file(maint_src / "backups.md",
                 DOCS_OUT / "maintenance" / "backups.md", sidebar_position=1)
    migrate_file(maint_src / "certificates.md",
                 DOCS_OUT / "maintenance" / "certificates.md", sidebar_position=2)
    migrate_file(maint_src / "elastalert-rules.md",
                 DOCS_OUT / "maintenance" / "elastalert-rules.md", sidebar_position=3)
    migrate_file(maint_src / "estimating-data-storage-requirements.md",
                 DOCS_OUT / "maintenance" / "estimating-data-storage-requirements.md", sidebar_position=4)
    migrate_file(maint_src / "index-management.md",
                 DOCS_OUT / "maintenance" / "index-management.md", sidebar_position=5)
    migrate_file(maint_src / "volume-management.md",
                 DOCS_OUT / "maintenance" / "volume-management.md", sidebar_position=6)
    migrate_file(maint_src / "upgrading.md",
                 DOCS_OUT / "maintenance" / "upgrading.md", sidebar_position=7)
    migrate_file(maint_src / "wazuh-configuration.md",
                 DOCS_OUT / "maintenance" / "wazuh-configuration.md", sidebar_position=8)
    migrate_file(maint_src / "sbom-generation.md",
                 DOCS_OUT / "maintenance" / "sbom-generation.md", sidebar_position=9)
    migrate_file(maint_src / "vulnerability-scan-setup.md",
                 DOCS_OUT / "maintenance" / "vulnerability-scan-setup.md", sidebar_position=10)
    migrate_file(maint_src / "Encryption_at_rest_option_for_users.md",
                 DOCS_OUT / "maintenance" / "encryption-at-rest.md", sidebar_position=11)

    # --- reference/ ---
    ref_src = src_md / "reference"
    migrate_file(ref_src / "architecture.md",
                 DOCS_OUT / "reference" / "architecture.md", sidebar_position=1)
    migrate_file(ref_src / "configuration.md",
                 DOCS_OUT / "reference" / "configuration.md", sidebar_position=2)
    migrate_file(ref_src / "security-model.md",
                 DOCS_OUT / "reference" / "security-model.md", sidebar_position=3)
    migrate_file(ref_src / "passwords.md",
                 DOCS_OUT / "reference" / "passwords.md", sidebar_position=4)
    migrate_file(ref_src / "faq.md",
                 DOCS_OUT / "reference" / "faq.md", sidebar_position=5)
    migrate_file(ref_src / "troubleshooting.md",
                 DOCS_OUT / "reference" / "troubleshooting.md", sidebar_position=6)
    migrate_file(ref_src / "dashboard-descriptions.md",
                 DOCS_OUT / "reference" / "dashboard-descriptions.md", sidebar_position=7)
    migrate_file(ref_src / "Proxy-Installation-Guide.md",
                 DOCS_OUT / "reference" / "proxy-installation-guide.md", sidebar_position=8)
    migrate_file(ref_src / "change-me.md",
                 DOCS_OUT / "reference" / "change-me.md", sidebar_position=9)

    # --- upgrade-guide/ ---
    migrate_file(src_md / "scripts" / "upgrade" / "README.md",
                 DOCS_OUT / "upgrade-guide" / "README.md", sidebar_position=1)

    # --- learning/ ---
    learn_src = CONTENT / "learning"
    for pos, name in enumerate(["module1.md", "module2.md", "module3.md"], 1):
        if (learn_src / name).exists():
            migrate_file(learn_src / name,
                         DOCS_OUT / "learning" / name, sidebar_position=pos)

    # --- blog/ (lme-news) ---
    q4_src = CONTENT / "docs" / "lme-news" / "q4-2025.md"
    q4_text = q4_src.read_text(encoding='utf-8')
    # Replace frontmatter to add date for blog ordering
    q4_text = re.sub(
        r'^---\n(.*?\n)---\n',
        '---\ntitle: "Logging Made Easy Insider Newsletter - Q4 2025"\nslug: "q4-2025"\ndate: "2025-12-01"\ntags: [newsletter, release]\n---\n',
        q4_text,
        flags=re.DOTALL
    )
    q4_text = rewrite_links(q4_text)
    blog_q4 = BLOG_OUT / "2025-12-01-q4-2025.md"
    blog_q4.write_text(q4_text, encoding='utf-8')
    print(f"  migrated: lme-news/q4-2025 -> {blog_q4.relative_to(WORKTREE)}")

    # content/blog/post1, post2
    for post_file in sorted((CONTENT / "blog").glob("post*.md")):
        # Add date frontmatter if missing
        post_text = post_file.read_text(encoding='utf-8')
        post_text = rewrite_links(post_text)
        dst_post = BLOG_OUT / post_file.name
        dst_post.write_text(post_text, encoding='utf-8')
        print(f"  migrated: blog/{post_file.name} -> {dst_post.relative_to(WORKTREE)}")

    print("\nContent migration complete.")


if __name__ == "__main__":
    run()

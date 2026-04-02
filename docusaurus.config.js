// @ts-check
/**
 * @decision DEC-001
 * @title All work on develop branch
 * @status accepted
 * @rationale User requirement - develop branch is the integration target
 *
 * @decision DEC-002
 * @title Use docusaurus-search-local for offline search
 * @status accepted
 * @rationale Government constraint — no external services (Algolia). Local search
 *            builds an index at build time and ships it with the static site.
 *
 * @decision DEC-003
 * @title Remove intermediate markdown/ directory from URL structure
 * @status accepted
 * @rationale Cleaner URLs: /docs/install/ not /docs/markdown/install/
 *
 * @decision DEC-004
 * @title Use @docusaurus/plugin-client-redirects for old Hugo URLs
 * @status accepted
 * @rationale Maintains backward compatibility for existing links and bookmarks
 */

const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Logging Made Easy',
  tagline: 'Free, open-source log management and threat detection for small and medium organizations',
  favicon: 'img/cisa.png',

  // GitHub Pages deployment config (DEC-001)
  url: 'https://cisagov.github.io',
  baseUrl: process.env.BASE_URL || '/lme-docs/',
  organizationName: 'cisagov',
  projectName: 'lme-docs',
  trailingSlash: false,

  // Warn during migration, change to 'throw' after link verification (Phase 1.9)
  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Enable Mermaid diagram rendering natively
  // onBrokenMarkdownLinks moved here per Docusaurus v3.8 deprecation notice
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      // DEC-002: offline search for government context
      '@easyops-cn/docusaurus-search-local',
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
        indexBlog: true,
        indexDocs: true,
        indexPages: false,
      },
    ],
  ],

  plugins: [
    // DEC-004: client-side redirects from old Hugo URL structure
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Redirect targets MUST match paths that Docusaurus actually builds.
        // Category index pages generated from _category_.json land at
        //   /docs/category/<slug>  NOT  /docs/<section>/
        // Leaf pages land at /docs/<section>/<filename-without-ext>
        redirects: [
          // install section
          { from: '/docs/markdown/install/', to: '/docs/category/install' },
          { from: '/docs/markdown/install/install', to: '/docs/install/normal-install' },
          { from: '/docs/markdown/install/air-gapped', to: '/docs/install/air-gapped' },
          // agents section
          { from: '/docs/markdown/agents/', to: '/docs/category/agents' },
          { from: '/docs/markdown/agents/elastic-agent-management', to: '/docs/agents/elastic-agent-management' },
          { from: '/docs/markdown/agents/wazuh-active-response', to: '/docs/agents/wazuh-active-response' },
          { from: '/docs/markdown/agents/wazuh-agent-management', to: '/docs/agents/wazuh-agent-management' },
          // endpoint-tools section
          { from: '/docs/markdown/endpoint-tools/', to: '/docs/category/endpoint-tools' },
          { from: '/docs/markdown/endpoint-tools/install-auditd', to: '/docs/endpoint-tools/install-auditd' },
          { from: '/docs/markdown/endpoint-tools/install-sysmon', to: '/docs/endpoint-tools/install-sysmon' },
          // integrations section
          { from: '/docs/markdown/integrations/', to: '/docs/category/integrations' },
          { from: '/docs/markdown/integrations/elastalert', to: '/docs/integrations/elastalert' },
          { from: '/docs/markdown/integrations/sigma-rules', to: '/docs/integrations/sigma-rules' },
          // logging-guidance section
          { from: '/docs/markdown/logging-guidance/', to: '/docs/category/logging-guidance' },
          { from: '/docs/markdown/logging-guidance/cloud', to: '/docs/logging-guidance/cloud' },
          { from: '/docs/markdown/logging-guidance/filtering', to: '/docs/logging-guidance/filtering' },
          { from: '/docs/markdown/logging-guidance/retention', to: '/docs/logging-guidance/retention' },
          { from: '/docs/markdown/logging-guidance/syslog-forwarding', to: '/docs/logging-guidance/syslog-forwarding' },
          // maintenance section
          { from: '/docs/markdown/maintenance/', to: '/docs/category/maintenance' },
          { from: '/docs/markdown/maintenance/backups', to: '/docs/maintenance/backups' },
          { from: '/docs/markdown/maintenance/certificates', to: '/docs/maintenance/certificates' },
          { from: '/docs/markdown/maintenance/elastalert-rules', to: '/docs/maintenance/elastalert-rules' },
          { from: '/docs/markdown/maintenance/estimating-data-storage-requirements', to: '/docs/maintenance/estimating-data-storage-requirements' },
          { from: '/docs/markdown/maintenance/index-management', to: '/docs/maintenance/index-management' },
          { from: '/docs/markdown/maintenance/sbom-generation', to: '/docs/maintenance/sbom-generation' },
          { from: '/docs/markdown/maintenance/upgrading', to: '/docs/maintenance/upgrading' },
          { from: '/docs/markdown/maintenance/volume-management', to: '/docs/maintenance/volume-management' },
          { from: '/docs/markdown/maintenance/vulnerability-scan-setup', to: '/docs/maintenance/vulnerability-scan-setup' },
          { from: '/docs/markdown/maintenance/wazuh-configuration', to: '/docs/maintenance/wazuh-configuration' },
          { from: '/docs/markdown/maintenance/Encryption_at_rest_option_for_users', to: '/docs/maintenance/encryption-at-rest' },
          // reference section
          { from: '/docs/markdown/reference/', to: '/docs/category/reference' },
          { from: '/docs/markdown/reference/Proxy-Installation-Guide', to: '/docs/reference/proxy-installation-guide' },
          { from: '/docs/markdown/reference/architecture', to: '/docs/reference/architecture' },
          { from: '/docs/markdown/reference/change-me', to: '/docs/reference/change-me' },
          { from: '/docs/markdown/reference/configuration', to: '/docs/reference/configuration' },
          { from: '/docs/markdown/reference/dashboard-descriptions', to: '/docs/reference/dashboard-descriptions' },
          { from: '/docs/markdown/reference/faq', to: '/docs/reference/faq' },
          { from: '/docs/markdown/reference/passwords', to: '/docs/reference/passwords' },
          { from: '/docs/markdown/reference/security-model', to: '/docs/reference/security-model' },
          { from: '/docs/markdown/reference/troubleshooting', to: '/docs/reference/troubleshooting' },
          // top-level docs
          { from: '/docs/markdown/prerequisites', to: '/docs/prerequisites' },
          { from: '/docs/markdown/CISA Resources', to: '/docs/cisa-resources' },
          // upgrade guide
          { from: '/docs/markdown/scripts/upgrade/', to: '/docs/upgrade-guide' },
          { from: '/docs/markdown/scripts/upgrade/README', to: '/docs/upgrade-guide' },
          // lme-news -> blog
          { from: '/docs/lme-news/', to: '/blog' },
          { from: '/docs/lme-news/q4-2025', to: '/blog/q4-2025' },
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/cisagov/lme-docs/edit/develop/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
        },
        blog: {
          showReadingTime: false,
          editUrl: 'https://github.com/cisagov/lme-docs/edit/develop/',
          blogTitle: 'LME News',
          blogDescription: 'Updates, releases, and community news for Logging Made Easy',
          postsPerPage: 10,
          blogSidebarTitle: 'Recent Posts',
          blogSidebarCount: 'ALL',
          routeBasePath: 'blog',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/lme-image.png',
      navbar: {
        title: 'Logging Made Easy',
        logo: {
          alt: 'CISA Logo',
          src: 'img/cisa.png',
        },
        items: [
          {
            to: '/docs/install/normal-install',
            label: 'Install',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/blog',
            label: 'LME News',
            position: 'left',
          },
          {
            href: 'https://github.com/cisagov/LME',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Install Guide', to: '/docs/install/normal-install' },
              { label: 'Prerequisites', to: '/docs/prerequisites' },
              { label: 'FAQ', to: '/docs/reference/faq' },
              { label: 'Troubleshooting', to: '/docs/reference/troubleshooting' },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/cisagov/LME/discussions',
              },
              {
                label: 'GitHub Issues',
                href: 'https://github.com/cisagov/LME/issues',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@CISAgov',
              },
            ],
          },
          {
            title: 'CISA',
            items: [
              {
                label: 'CISA.gov',
                href: 'https://www.cisa.gov',
              },
              {
                label: 'LME on GitHub',
                href: 'https://github.com/cisagov/lme-docs',
              },
              {
                label: 'X / Twitter',
                href: 'https://x.com/CISAgov',
              },
            ],
          },
        ],
        copyright: `Built with Docusaurus. Content by CISA.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'powershell', 'yaml', 'toml'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'forest' },
      },
    }),
};

module.exports = config;

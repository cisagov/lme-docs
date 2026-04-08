/**
 * Landing page for LME Docs.
 *
 * @decision DEC-007
 * @title Landing page rebuilt as React component
 * @status accepted
 * @rationale Hugo Docsy shortcodes (blocks/cover, blocks/feature, etc.) have no
 *            MDX equivalent. This React page provides the same structure:
 *            hero section + feature cards + call-to-action buttons.
 *
 * Content sourced from content/_index.md and content/docs/_index.md.
 */

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
        <p className={styles.heroSubtitle}>
          CISA&apos;s free, open-source platform that centralizes log collection,
          enhances threat detection, and enables real-time alerting — helping
          small to medium-sized organizations secure their infrastructure.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/install/normal-install">
            Install LME
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Explore Docs
          </Link>
        </div>
        <div className={styles.badges}>
          <img
            alt="GitHub downloads"
            src="https://img.shields.io/github/downloads/cisagov/lme/total.svg"
          />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="CISA Logging Made Easy — free, open-source log management and threat detection for small and medium organizations">
      <HomepageHero />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

/**
 * HomepageFeatures — feature card grid for the LME landing page.
 *
 * @decision DEC-007
 * @title Landing page rebuilt as React component
 * @status accepted
 * @rationale Replaces Hugo blocks/feature shortcodes with React components.
 *            Three pillars of LME: Collect, View, Alert — sourced from the
 *            original docs/_index.md description.
 */

import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    icon: '📥',
    title: 'Collect',
    description: (
      <>
        Deploy <strong>Wazuh</strong> and <strong>Elastic Agents</strong> to
        collect logs from Windows and Linux endpoints, providing EDR capabilities
        and flexible integrations for diverse log types.
      </>
    ),
  },
  {
    icon: '📊',
    title: 'Visualize',
    description: (
      <>
        Explore and monitor your data with <strong>Kibana</strong> dashboards.
        Customize visualizations, track security events, detect anomalies, and
        analyze trends in real time.
      </>
    ),
  },
  {
    icon: '🔔',
    title: 'Alert',
    description: (
      <>
        Configure <strong>ElastAlert2</strong> rules to automatically notify your
        team when predefined patterns, thresholds, or anomalies are detected in
        your log data.
      </>
    ),
  },
  {
    icon: '🔒',
    title: 'Secure by Design',
    description: (
      <>
        Podman containerization, encrypted secrets, and Ansible-automated
        deployment ensure a security-first architecture that meets the highest
        organizational standards.
      </>
    ),
  },
  {
    icon: '💰',
    title: 'No Cost',
    description: (
      <>
        LME is 100% free and open-source, purpose-built for organizations that
        need enterprise-grade log management without an enterprise budget.
      </>
    ),
  },
  {
    icon: '🚀',
    title: 'Quick Start',
    description: (
      <>
        From download to running containers in under 30 minutes. Automated Ansible
        playbooks handle installation on Ubuntu, Debian, and Red Hat Enterprise
        Linux.
      </>
    ),
  },
];

function Feature({ icon, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

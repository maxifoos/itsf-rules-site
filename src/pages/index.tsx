import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction">
            Read the Rules
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="ITSF Standard Matchplay Rules 2024, presented as browsable documentation">
      <HomepageHeader />
      <main>
        <div className="container margin-vert--lg">
          <p>
            This site presents the official <strong>ITSF Standard Matchplay Rules</strong> (Version 2.0,
            December 2023) for table soccer / foosball, reorganised as browsable documentation.
            Use the sidebar or the link below to jump straight into the rules.
          </p>
          <ul>
            <li><Link to="/docs/introduction">1. Introduction</Link></li>
            <li><Link to="/docs/definitions">2. Definitions</Link></li>
            <li><Link to="/docs/penalties">18. Penalties</Link></li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}

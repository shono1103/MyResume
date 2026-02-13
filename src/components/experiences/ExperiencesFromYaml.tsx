import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {load as parseYaml} from 'js-yaml';
import styles from './experiences.module.css';
import type {ExperiencesYamlConfig} from './experienceTypes';

type Props = {
  configPath: string;
};

export default function ExperiencesFromYaml({configPath}: Props) {
  const resolvedConfigPath = useBaseUrl(configPath);
  const [config, setConfig] = useState<ExperiencesYamlConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const response = await fetch(resolvedConfigPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const raw = await response.text();
        const parsed = parseYaml(raw) as ExperiencesYamlConfig;

        if (!parsed || !Array.isArray(parsed.companies)) {
          throw new Error('Invalid config format: companies is required');
        }

        if (isMounted) {
          setConfig(parsed);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Unknown error');
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [resolvedConfigPath]);

  const companies = useMemo(() => config?.companies ?? [], [config]);

  if (error) {
    return <p>Experiences data could not be loaded: {error}</p>;
  }

  if (!config) {
    return <p>Loading experiences...</p>;
  }

  return (
    <div className={styles.grid}>
      {companies.map((company) => (
        <article className={styles.companyCard} key={company.id}>
          <h3 className={styles.companyName}>
            <Link to={`/experiences/${company.slug}`}>{company.name}</Link>
          </h3>
          {company.period ? <p className={styles.companyMeta}>在籍期間: {company.period}</p> : null}
          <p className={styles.projectCount}>プロジェクト数: {company.projects.length}</p>
        </article>
      ))}
    </div>
  );
}

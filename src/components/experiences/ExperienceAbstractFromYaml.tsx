import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {micromark} from 'micromark';
import styles from './experiences.module.css';
import {loadExperiencesConfig} from './loadExperiencesConfig';

type Props = {
  configPath: string;
};

export default function ExperienceAbstractFromYaml({configPath}: Props) {
  const baseUrl = useBaseUrl('/');
  const [markdownPath, setMarkdownPath] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const parsed = await loadExperiencesConfig(configPath, baseUrl);

        const pathFromYaml = parsed.companies.find((company) => company.abstract_mdFilePath)?.abstract_mdFilePath;
        if (!pathFromYaml?.trim()) {
          throw new Error('abstract_mdFilePath is not set');
        }

        if (isMounted) {
          setMarkdownPath(pathFromYaml.trim());
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
  }, [baseUrl, configPath]);

  useEffect(() => {
    let isMounted = true;

    async function loadMarkdown() {
      if (!markdownPath) {
        return;
      }

      try {
        const resolvedMarkdownPath = `${baseUrl.replace(/\/$/, '')}${markdownPath.startsWith('/') ? markdownPath : `/${markdownPath}`}`;
        const response = await fetch(resolvedMarkdownPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch abstract markdown: ${response.status}`);
        }

        const raw = await response.text();
        if (isMounted) {
          setMarkdown(raw);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Unknown error');
        }
      }
    }

    loadMarkdown();

    return () => {
      isMounted = false;
    };
  }, [baseUrl, markdownPath]);

  const html = useMemo(() => (markdown ? micromark(markdown) : ''), [markdown]);

  if (error) {
    return <p>Experience abstract could not be loaded: {error}</p>;
  }

  if (!markdownPath || !markdown) {
    return <p>Loading experience abstract...</p>;
  }

  return (
    <section className={styles.abstractCard}>
      <h2 className={styles.abstractTitle}>職務経歴概要</h2>
      <div className={styles.abstractBody} dangerouslySetInnerHTML={{__html: html}} />
    </section>
  );
}

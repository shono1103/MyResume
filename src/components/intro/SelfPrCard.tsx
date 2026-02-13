import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {micromark} from 'micromark';
import {Card} from './IntroCards';
import styles from './intro.module.css';

type Props = {
  markdownPath?: string;
};

export default function SelfPrCard({markdownPath}: Props) {
  const resolvedPath = useBaseUrl(markdownPath ?? '');
  const [markdown, setMarkdown] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!markdownPath) {
        return;
      }

      try {
        const response = await fetch(resolvedPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch self PR: ${response.status}`);
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

    load();

    return () => {
      isMounted = false;
    };
  }, [markdownPath, resolvedPath]);

  const html = useMemo(() => (markdown ? micromark(markdown) : ''), [markdown]);

  return (
    <Card title="Self PR">
      {error ? <p>Self PR could not be loaded: {error}</p> : null}
      {!error && !markdownPath ? <p>Self PR path is not set.</p> : null}
      {!error && markdownPath && !markdown ? <p>Loading self PR...</p> : null}
      {!error && html ? <div className={styles.selfPrMarkdown} dangerouslySetInnerHTML={{__html: html}} /> : null}
    </Card>
  );
}

import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {load as parseYaml} from 'js-yaml';
import {Timeline, type TimelineItem} from './Timeline';
import type {HistoryYaml, TimelineItem as TimelineYamlEntry} from '@site/src/util/historyTypes';
import {parseHistoryYaml} from '@site/src/util/historySchema';

type Props = {
  configPath: string;
};

export default function TimelineFromYaml({configPath}: Props) {
  const resolvedConfigPath = useBaseUrl(configPath);
  const [config, setConfig] = useState<HistoryYaml | null>(null);
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
        const parsed = parseHistoryYaml(parseYaml(raw), {source: resolvedConfigPath}) as HistoryYaml;

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

  const items = useMemo<TimelineItem[]>(() => {
    if (!config) return [];

    return (config.timeline ?? []).map((entry, index) => ({
      id: entry.id ?? `${entry.title ?? 'timeline'}-${index}`,
      time: entry.time,
      title: entry.organizationUrl ? (
        <a
          href={entry.organizationUrl}
          target="_blank"
          rel="noreferrer noopener"
          style={{color: 'inherit', textDecoration: 'underline'}}
        >
          {entry.title}
        </a>
      ) : (
        entry.title
      ),
      body:
        entry.details && entry.details.length > 0 ? (
          <ul style={{margin: 0, paddingLeft: 18}}>
            {entry.details.map((line, index) => (
              <li key={`${entry.id}-${index}`}>{line}</li>
            ))}
          </ul>
      ) : undefined,
      tags: entry.tags,
      dotColor: entry.dotColor,
      dotVariant: entry.dotVariant,
    }));
  }, [config]);

  if (error) {
    return <p>Timeline data could not be loaded: {error}</p>;
  }

  if (!config) {
    return <p>Loading timeline...</p>;
  }

  return <Timeline items={items} />;
}

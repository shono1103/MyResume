import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {load as parseYaml} from 'js-yaml';
import styles from './certifications.module.css';
import CertificationTagCloud from './CertificationTagCloud';
import type {CertificationEntry, CertificationsYamlConfig} from './certificationTypes';
import {parseCertificationsYaml} from '@site/src/util/certificationSchema';

type Props = {
  configPath: string;
};

function formatDate(value: string): string {
  const [year, month] = value.split('-');
  if (!year || !month) {
    return value;
  }

  return `${year}年${month}月`;
}

export default function TagCloudFromYaml({configPath}: Props) {
  const resolvedConfigPath = useBaseUrl(configPath);

  const [items, setItems] = useState<CertificationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const response = await fetch(resolvedConfigPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }

        const raw = await response.text();
        const parsed = parseCertificationsYaml(parseYaml(raw), {source: resolvedConfigPath}) as CertificationsYamlConfig;
        const normalized = parsed.certifications.map((item, index) => {
          if (!item.id || !item.name || !item.svg_path || !item.DateOfQualification) {
            throw new Error(
              `[${resolvedConfigPath}] certifications[${index}] requires id/name/svg_path/DateOfQualification`,
            );
          }
          return {
            id: item.id,
            name: item.name,
            svg_path: item.svg_path,
            DateOfQualification: item.DateOfQualification,
          };
        });

        if (isMounted) {
          setItems(normalized);
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

  const handleActiveIdChange = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items],
  );

  if (error) {
    return <p>Certifications data could not be loaded: {error}</p>;
  }

  if (items.length === 0) {
    return <p>Loading certifications...</p>;
  }

  return (
    <section className={styles.cloudWrap}>
      <CertificationTagCloud items={items} onActiveIdChange={handleActiveIdChange} />

      {activeItem ? (
        <div className={styles.info}>
          <p className={styles.infoTitle}>{activeItem.name}</p>
          <p className={styles.infoDate}>取得日: {formatDate(activeItem.DateOfQualification)}</p>
        </div>
      ) : (
        <p className={styles.helper}>アイコンにマウスオーバーすると詳細を表示します。</p>
      )}
    </section>
  );
}

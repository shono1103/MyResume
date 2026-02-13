import React, {useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {micromark} from 'micromark';
import styles from './experiences.module.css';
import type {ExperienceProject} from './experienceTypes';

type Props = {
  project: ExperienceProject;
  expanded: boolean;
  onToggle: () => void;
};

function TagList({items}: {items: string[]}) {
  if (items.length === 0) {
    return <span className={styles.tag}>N/A</span>;
  }

  return (
    <div className={styles.tags}>
      {items.map((item) => (
        <span className={styles.tag} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ExperienceProjectCard({project, expanded, onToggle}: Props) {
  const baseUrl = useBaseUrl('/');
  const markdownPath = project.detail_markdown_path?.trim();
  const markdownUrl = markdownPath ? `${baseUrl.replace(/\/$/, '')}${markdownPath}` : '';

  const [detailMarkdown, setDetailMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const summary = project.summary?.trim() ?? 'No summary available.';
  const roles = project.role ?? [];
  const os = project.tech?.os ?? [];
  const languages = project.tech?.lang ?? [];
  const infra = project.tech?.infra ?? [];
  const detailsHtml = useMemo(() => {
    if (!detailMarkdown) {
      return '';
    }

    return micromark(detailMarkdown);
  }, [detailMarkdown]);

  async function handleToggle() {
    onToggle();

    if (expanded || detailMarkdown || !markdownUrl || isLoading) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch detail: ${response.status}`);
      }

      const raw = await response.text();
      setDetailMarkdown(raw);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <article className={`${styles.projectCard} ${expanded ? styles.projectCardExpanded : ''}`}>
      <button type="button" className={styles.projectToggle} onClick={handleToggle} aria-expanded={expanded}>
        <div className={styles.projectToggleHead}>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <span className={styles.toggleText}>{expanded ? '閉じる' : '詳細を表示'}</span>
        </div>

        <p className={styles.summary}>{summary}</p>

        <section className={styles.section}>
          <span className={styles.sectionLabel}>Role</span>
          <TagList items={roles} />
        </section>

        <section className={styles.section}>
          <span className={styles.sectionLabel}>Tech</span>

          <div className={styles.techBlock}>
            <div className={styles.techRow}>
              <span className={styles.techLabel}>OS</span>
              <TagList items={os} />
            </div>

            <div className={styles.techRow}>
              <span className={styles.techLabel}>Language</span>
              <TagList items={languages} />
            </div>

            <div className={styles.techRow}>
              <span className={styles.techLabel}>Infrastructure</span>
              <TagList items={infra} />
            </div>
          </div>
        </section>
      </button>

      {expanded ? (
        <section className={styles.detailsPanel}>
          {isLoading ? <p>Loading detail...</p> : null}
          {loadError ? <p>Detail could not be loaded: {loadError}</p> : null}
          {!isLoading && !loadError && detailsHtml ? (
            <div className={styles.markdownBody} dangerouslySetInnerHTML={{__html: detailsHtml}} />
          ) : null}
          {!isLoading && !loadError && !markdownUrl ? <p>詳細Markdownが未設定です。</p> : null}
        </section>
      ) : null}
    </article>
  );
}

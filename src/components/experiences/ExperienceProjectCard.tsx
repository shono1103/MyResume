import React from 'react';
import styles from './experiences.module.css';
import type {ExperienceProject} from './experienceTypes';

type Props = {
  project: ExperienceProject;
  expanded: boolean;
  onToggle: () => void;
};

function TagList({items, compact = false}: {items: string[]; compact?: boolean}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!compact) {
      setVisibleCount(null);
      return;
    }

    setVisibleCount(items.length);
  }, [compact, items]);

  React.useLayoutEffect(() => {
    if (!compact || visibleCount === null) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (container.scrollWidth > container.clientWidth) {
      setVisibleCount((current) => {
        if (current === null) {
          return current;
        }

        // 1件でも収まらない場合はタグを出さず etc のみにする
        return Math.max(0, current - 1);
      });
    }
  }, [compact, visibleCount, items.length]);

  if (items.length === 0) {
    return <span className={styles.tag}>N/A</span>;
  }

  const slicedItems = visibleCount === null ? items : items.slice(0, visibleCount);
  const showEtc = visibleCount !== null && visibleCount < items.length;

  return (
    <div ref={containerRef} className={`${styles.tags} ${compact ? styles.tagsCompact : ''}`}>
      {slicedItems.map((item) => (
        <span className={styles.tag} key={item}>
          {item}
        </span>
      ))}
      {showEtc ? <span className={styles.etcText}>etc...</span> : null}
    </div>
  );
}

export default function ExperienceProjectCard({project, expanded, onToggle}: Props) {
  const summary = project.result?.trim() || project.summary?.trim() || 'No summary available.';
  const roles = project.role ?? [];
  const os = project.tech?.os ?? [];
  const languages = project.tech?.lang ?? [];
  const infra = project.tech?.infra ?? [];
  const efforts = project.effort ?? [];
  const issueSolving = project.issue_solving ?? [];

  return (
    <article className={`${styles.projectCard} ${expanded ? styles.projectCardExpanded : ''}`}>
      <button type="button" className={styles.projectToggle} onClick={onToggle} aria-expanded={expanded}>
        <div className={styles.projectToggleHead}>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <span className={styles.toggleText}>{expanded ? '閉じる' : '詳細を表示'}</span>
        </div>

        {expanded ? <p className={styles.summary}>{summary}</p> : null}

        <section className={styles.section}>
          <span className={styles.sectionLabel}>Role</span>
          <TagList items={roles} compact={!expanded} />
        </section>

        <section className={styles.section}>
          <span className={styles.sectionLabel}>Tech</span>
          <div className={styles.techBlock}>
            <div className={styles.techRow}>
              <span className={styles.techLabel}>OS</span>
              <TagList items={os} compact={!expanded} />
            </div>

            <div className={styles.techRow}>
              <span className={styles.techLabel}>Language</span>
              <TagList items={languages} compact={!expanded} />
            </div>

            <div className={styles.techRow}>
              <span className={styles.techLabel}>Infrastructure</span>
              <TagList items={infra} compact={!expanded} />
            </div>
          </div>
        </section>
      </button>

      {expanded ? (
        <section className={styles.detailsPanel}>
          <article className={styles.projectDetailCard}>
            <h4 className={styles.projectDetailTitle}>{project.title}</h4>

            <div className={styles.projectDetailKv}>
              <div className={styles.projectDetailK}>役割</div>
              <div className={styles.projectDetailV}>{roles.join(' / ') || '-'}</div>

              <div className={styles.projectDetailK}>成果（定量/定性）</div>
              <div className={styles.projectDetailV}>{summary}</div>

              <div className={styles.projectDetailK}>技術</div>
              <div className={styles.projectDetailV}>
                <div className={styles.techBlock}>
                  <div className={styles.techRow}>
                    <span className={styles.techLabel}>OS</span>
                    <TagList items={os} />
                  </div>
                  <div className={styles.techRow}>
                    <span className={styles.techLabel}>Lang</span>
                    <TagList items={languages} />
                  </div>
                  <div className={styles.techRow}>
                    <span className={styles.techLabel}>Infra</span>
                    <TagList items={infra} />
                  </div>
                </div>
              </div>
            </div>

            {efforts.length > 0 ? (
              <>
                <h4 className={styles.detailHeading}>工夫</h4>
                <ul className={styles.detailList}>
                  {efforts.map((item) => (
                    <li key={`${project.id}-effort-${item}`}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {issueSolving.length > 0 ? (
              <>
                <h4 className={styles.detailHeading}>課題解決</h4>
                <ul className={styles.detailList}>
                  {issueSolving.map((item) => (
                    <li key={`${project.id}-issue-${item}`}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </article>
        </section>
      ) : null}
    </article>
  );
}

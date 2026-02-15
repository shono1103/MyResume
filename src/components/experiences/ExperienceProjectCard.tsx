import React from 'react';
import styles from './experiences.module.css';
import type {ExperienceProject} from '@site/src/util/experienceTypes';

type Props = {
  project: ExperienceProject;
  expanded: boolean;
  onToggle: () => void;
};

function calculateCompactVisibleCount(container: HTMLDivElement, items: string[]): number {
  if (items.length === 0) {
    return 0;
  }

  const availableWidth = container.clientWidth;
  if (availableWidth <= 0) {
    return items.length;
  }

  const measure = document.createElement('div');
  measure.className = `${styles.tags} ${styles.tagsCompact}`;
  measure.style.position = 'absolute';
  measure.style.visibility = 'hidden';
  measure.style.pointerEvents = 'none';
  measure.style.left = '-9999px';
  measure.style.top = '0';
  measure.style.width = `${availableWidth}px`;

  const createTag = (text: string) => {
    const span = document.createElement('span');
    span.className = styles.tag;
    span.textContent = text;
    return span;
  };

  const fits = (count: number): boolean => {
    const nodes = items.slice(0, count).map((item) => createTag(item));
    if (count < items.length) {
      const etc = document.createElement('span');
      etc.className = styles.etcText;
      etc.textContent = 'etc...';
      nodes.push(etc);
    }
    measure.replaceChildren(...nodes);
    return measure.scrollWidth <= measure.clientWidth;
  };

  document.body.appendChild(measure);
  let low = 0;
  let high = items.length;
  let answer = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (fits(mid)) {
      answer = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  measure.remove();
  return answer;
}

function TagList({items, compact = false}: {items: string[]; compact?: boolean}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!compact) {
      setVisibleCount(null);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    let frameId = 0;
    const recalculate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setVisibleCount(calculateCompactVisibleCount(container, items));
      });
    };

    recalculate();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', recalculate);
      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', recalculate);
      };
    }

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [compact, items]);

  React.useEffect(() => {
    if (!compact) {
      return;
    }
    if (visibleCount !== null && visibleCount > items.length) {
      setVisibleCount(items.length);
    }
  }, [compact, items.length, visibleCount]);

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
  const member = project.member?.trim() ?? '';
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

        {member ? (
          <section className={styles.section}>
            <span className={styles.sectionLabel}>Member</span>
            <div className={styles.tags}>
              <span className={styles.tag}>{member}</span>
            </div>
          </section>
        ) : null}

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
          <div className={styles.projectDetailKv}>
            <div className={styles.projectDetailK}>成果（定量/定性）</div>
            <div className={styles.projectDetailV}>{summary}</div>

            <div className={styles.projectDetailK}>工夫</div>
            <div className={styles.projectDetailV}>
              {efforts.length > 0 ? (
                <ul className={styles.detailList}>
                  {efforts.map((item) => (
                    <li key={`${project.id}-effort-${item}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                '-'
              )}
            </div>

            <div className={styles.projectDetailK}>課題解決</div>
            <div className={styles.projectDetailV}>
              {issueSolving.length > 0 ? (
                <ul className={styles.detailList}>
                  {issueSolving.map((item) => (
                    <li key={`${project.id}-issue-${item}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                '-'
              )}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

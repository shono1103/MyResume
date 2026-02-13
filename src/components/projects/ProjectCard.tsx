import React from 'react';
import styles from './projects.module.css';
import type {ProjectYamlEntry} from './projectTypes';

type Props = {
  project: ProjectYamlEntry;
  baseUrl: string;
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'In Progress',
  done: 'Done',
  archived: 'Archived',
};

export default function ProjectCard({project, baseUrl}: Props) {
  const thumbnailPath = project.thumbnail_img_path?.trim();
  const thumbnailUrl = thumbnailPath ? `${baseUrl.replace(/\/$/, '')}${thumbnailPath}` : null;
  const abstractText = project.abstract?.trim() || 'No description yet.';
  const statusText = STATUS_LABEL[project.status ?? ''] ?? project.status ?? 'Unknown';

  return (
    <article className={styles.card}>
      {thumbnailUrl ? (
        <div className={styles.media}>
          <img className={styles.mediaImage} src={thumbnailUrl} alt={`${project.name} thumbnail`} />
        </div>
      ) : (
        <div className={styles.mediaFallback} aria-hidden>
          {project.name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <header className={styles.header}>
        <h3 className={styles.title}>{project.name}</h3>
        <p className={styles.subtitle}>{statusText}</p>
      </header>

      <div className={styles.content}>
        <p className={styles.abstract}>{abstractText}</p>
        <div className={styles.tags}>
          {(project.tech_stack ?? []).map((tech) => (
            <span className={styles.tag} key={`${project.id}-${tech}`}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      <footer className={styles.actions}>
        {project.repos_url ? (
          <a className={styles.button} href={project.repos_url} target="_blank" rel="noreferrer noopener">
            Read more
          </a>
        ) : (
          <span className={styles.buttonDisabled}>Repository TBD</span>
        )}
      </footer>
    </article>
  );
}

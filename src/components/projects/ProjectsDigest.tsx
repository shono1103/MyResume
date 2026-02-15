import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ProjectCard from './ProjectCard';
import projectStyles from './projects.module.css';
import type {ProjectEntry} from '@site/src/util/projectTypes';
import {loadProjectsConfig} from './loadProjectsConfig';

type Props = {
  className: string;
  buttonClassName: string;
  headingClassName: string;
};

export default function ProjectsDigest({
  className,
  buttonClassName,
  headingClassName,
}: Props) {
  const baseUrl = useBaseUrl('/');
  const configPath = '/data/projects/index.yml';
  const [items, setItems] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const parsed = await loadProjectsConfig(configPath, baseUrl);
        const projects = parsed.projects;
        if (projects.length === 0) {
          return;
        }

        const shuffled = [...projects].sort(() => Math.random() - 0.5);
        const randomThree = shuffled.slice(0, 3);
        if (isMounted) {
          setItems(randomThree);
        }
      } catch {
        // Ignore digest fetch errors and keep fallback UI.
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [baseUrl, configPath]);

  return (
    <section className={className}>
      <h3 className={headingClassName}>Products Digest</h3>
      <div className={projectStyles.container}>
        {items.map((item, index) => (
          <ProjectCard key={`${item.id}-${item.name}-${index}`} project={item} baseUrl={baseUrl} />
        ))}
      </div>
      <Link className={buttonClassName} to="/projects">
        view more
      </Link>
    </section>
  );
}

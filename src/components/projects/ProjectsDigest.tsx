import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {load as parseYaml} from 'js-yaml';
import ProjectCard from './ProjectCard';
import projectStyles from './projects.module.css';
import type {ProjectYamlEntry} from './projectTypes';
import type {ProjectsYaml} from '@site/src/util/projectTypes';

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
  const configPath = useBaseUrl('/data/projects.yml');
  const [items, setItems] = useState<ProjectYamlEntry[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const response = await fetch(configPath);
        if (!response.ok) {
          return;
        }

        const parsed = parseYaml(await response.text()) as ProjectsYaml;
        const projects = parsed?.projects ?? [];
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
  }, [configPath]);

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

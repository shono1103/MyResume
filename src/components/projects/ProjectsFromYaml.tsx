import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {load as parseYaml} from 'js-yaml';
import styles from './projects.module.css';
import ProjectCard from './ProjectCard';
import type {ProjectsYamlConfig} from './projectTypes';

type Props = {
  configPath: string;
};

export default function ProjectsFromYaml({configPath}: Props) {
  const baseUrl = useBaseUrl('/');
  const resolvedConfigPath = useBaseUrl(configPath);
  const [config, setConfig] = useState<ProjectsYamlConfig | null>(null);
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
        const parsed = parseYaml(raw) as ProjectsYamlConfig;

        if (!parsed || !Array.isArray(parsed.projects)) {
          throw new Error('Invalid config format: projects is required');
        }

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

  const projects = useMemo(() => config?.projects ?? [], [config]);

  if (error) {
    return <p>Projects data could not be loaded: {error}</p>;
  }

  if (!config) {
    return <p>Loading projects...</p>;
  }

  return (
    <div className={styles.container}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} baseUrl={baseUrl} />
      ))}
    </div>
  );
}

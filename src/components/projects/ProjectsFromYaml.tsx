import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './projects.module.css';
import ProjectCard from './ProjectCard';
import type {ProjectsYamlConfig} from '@site/src/util/projectTypes';
import {loadProjectsConfig} from './loadProjectsConfig';

type Props = {
  configPath: string;
};

export default function ProjectsFromYaml({configPath}: Props) {
  const baseUrl = useBaseUrl('/');
  const [config, setConfig] = useState<ProjectsYamlConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const parsed = await loadProjectsConfig(configPath, baseUrl);

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
  }, [baseUrl, configPath]);

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

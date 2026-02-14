import React, {useEffect, useMemo, useState} from 'react';
import ExperienceProjectCard from './ExperienceProjectCard';
import styles from './experiences.module.css';
import type {ExperienceCompany, ExperiencesYamlConfig} from './experienceTypes';
import {loadExperiencesConfig} from './loadExperiencesConfig';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  configPath: string;
  companySlug: string;
};

export default function CompanyExperiences({configPath, companySlug}: Props) {
  const baseUrl = useBaseUrl('/');
  const [config, setConfig] = useState<ExperiencesYamlConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const parsed = await loadExperiencesConfig(configPath, baseUrl);

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

  const company = useMemo<ExperienceCompany | null>(() => {
    if (!config) {
      return null;
    }

    return config.companies.find((item) => item.slug === companySlug) ?? null;
  }, [companySlug, config]);

  if (error) {
    return <p>Experiences data could not be loaded: {error}</p>;
  }

  if (!config) {
    return <p>Loading experiences...</p>;
  }

  if (!company) {
    return <p>Company not found: {companySlug}</p>;
  }

  return (
    <>
      {company.period ? <p>在籍期間: {company.period}</p> : null}
      <div className={`${styles.grid} ${activeProjectId ? styles.gridFocused : ''}`}>
        {company.projects.map((project) => {
          const isExpanded = activeProjectId === project.id;
          const shouldHide = activeProjectId !== null && !isExpanded;

          if (shouldHide) {
            return null;
          }

          return (
            <ExperienceProjectCard
              key={project.id}
              project={project}
              expanded={isExpanded}
              onToggle={() => setActiveProjectId(isExpanded ? null : project.id)}
            />
          );
        })}
      </div>
    </>
  );
}

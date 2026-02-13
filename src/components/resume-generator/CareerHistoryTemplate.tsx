import React from 'react';
import styles from './CareerHistoryTemplate.module.css';

interface Project {
  title: string;
  summary: string;
  role: string[];
  tech: {
    os?: string[];
    lang?: string[];
    infra?: string[];
  };
}

interface Experience {
  name: string;
  period: string;
  projects: Project[];
}

interface PersonalProject {
  name: string;
  tech_stack: string[];
  abstract: string;
  repos_url: string;
}

interface CareerHistoryData {
  resumeSiteUrl: string;
  abstract: string;
  experiences: Experience[];
  personalProjects: PersonalProject[];
  selfPR: string;
}

interface CareerHistoryTemplateProps {
  data: CareerHistoryData;
}

export default function CareerHistoryTemplate({ data }: CareerHistoryTemplateProps): React.JSX.Element {
  return (
    <div className={styles.careerContainer}>
      <div className={styles.careerPage}>
        <h1 className={styles.documentTitle}>職務経歴書</h1>
        
        <div className={styles.section}>
          <p className={styles.resumeLink}>
            詳細なレジュメサイト: <a href={data.resumeSiteUrl} target="_blank" rel="noopener noreferrer">{data.resumeSiteUrl}</a>
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>職務経歴要約</h2>
          <div className={styles.abstractContent}>
            {data.abstract}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>職務経歴</h2>
          {data.experiences.map((exp, expIndex) => (
            <div key={expIndex} className={styles.experienceBlock}>
              <h3 className={styles.companyName}>{exp.name}</h3>
              <p className={styles.period}>{exp.period}</p>
              
              {exp.projects.map((project, projIndex) => (
                <div key={projIndex} className={styles.projectBlock}>
                  <h4 className={styles.projectTitle}>{project.title}</h4>
                  <p className={styles.projectSummary}>{project.summary}</p>
                  
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>役割:</span>
                    <span>{project.role.join(', ')}</span>
                  </div>
                  
                  {project.tech.os && project.tech.os.length > 0 && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>OS:</span>
                      <span>{project.tech.os.join(', ')}</span>
                    </div>
                  )}
                  
                  {project.tech.lang && project.tech.lang.length > 0 && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>言語:</span>
                      <span>{project.tech.lang.join(', ')}</span>
                    </div>
                  )}
                  
                  {project.tech.infra && project.tech.infra.length > 0 && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>インフラ:</span>
                      <span>{project.tech.infra.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>個人プロジェクト</h2>
          {data.personalProjects.map((project, index) => (
            <div key={index} className={styles.personalProjectBlock}>
              <h3 className={styles.projectName}>{project.name}</h3>
              <p className={styles.projectAbstract}>{project.abstract}</p>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>技術スタック:</span>
                <span>{project.tech_stack.join(', ')}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>リポジトリ:</span>
                <a href={project.repos_url} target="_blank" rel="noopener noreferrer">{project.repos_url}</a>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>自己PR</h2>
          <div className={styles.selfPRContent}>
            {data.selfPR}
          </div>
        </div>
      </div>
    </div>
  );
}

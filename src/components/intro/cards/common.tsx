import React from 'react';
import styles from '../intro.module.css';

export function Chip({children}: {children: React.ReactNode}) {
  return <span className={styles.chip}>{children}</span>;
}

export function SkillGroup({title, skills}: {title: string; skills: string[]}) {
  return (
    <div className={styles.subBlock}>
      <div className={styles.subTitle}>{title}</div>
      <div className={styles.chipRow}>
        {skills.map((skill) => (
          <Chip key={skill}>{skill}</Chip>
        ))}
      </div>
    </div>
  );
}

export function formatBirth(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = `${value.getMonth() + 1}`.padStart(2, '0');
    const d = `${value.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return value;
}

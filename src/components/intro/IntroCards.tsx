import React from 'react';
import clsx from 'clsx';
import styles from './intro.module.css';
import type {IntroData} from './introTypes';

type CardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export function Card({title, className, children}: CardProps) {
  return (
    <section className={clsx(styles.card, className)}>
      {title ? <div className={styles.cardTitle}>{title}</div> : null}
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function Chip({children}: {children: React.ReactNode}) {
  return <span className={styles.chip}>{children}</span>;
}

function SkillGroup({title, skills}: {title: string; skills: string[]}) {
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

function PracticalSkills({skills}: {skills: string[]}) {
  return <SkillGroup title="Practical" skills={skills} />;
}

function ExploringSkills({skills}: {skills: string[]}) {
  return <SkillGroup title="Exploring" skills={skills} />;
}

function formatBirth(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = `${value.getMonth() + 1}`.padStart(2, '0');
    const d = `${value.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return value;
}

export function BaseInfoCard({intro, children}: {intro: IntroData; children?: React.ReactNode}) {
  const base = intro.base_info[0];
  if (!base) {
    return null;
  }

  return (
    <Card title="Base Info" className={styles.profile}>
      <div className={styles.baseInfoLayout}>
        <img className={styles.avatar} src={base.profile_img_path} alt={`${base.name} icon`} />
        <div className={styles.baseInfoText}>
          <div className={styles.name}>{base.name}</div>
          <p className={styles.baseMeta}>Birth: {formatBirth(base.birth)}</p>
          <p className={styles.baseMeta}>From: {base.from}</p>
        </div>
        {children ? <div className={styles.baseDigestSlot}>{children}</div> : null}
      </div>
    </Card>
  );
}

export function EmailCard({email}: {email: string}) {
  return (
    <Card title="Email">
      <a className={styles.email} href={`mailto:${email}`}>
        {email}
      </a>
    </Card>
  );
}

export function MottoCard({motto}: {motto: string}) {
  return (
    <Card title="Motto">
      <p className={styles.mottoInline}>{motto}</p>
    </Card>
  );
}

export function HobbyCard({hobbies}: {hobbies: string[]}) {
  return (
    <Card title="Hobby">
      <div className={styles.chipRow}>
        {hobbies.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>
    </Card>
  );
}

export function SkillsCard({intro}: {intro: IntroData}) {
  const skills = intro.skills[0] ?? {practical: [], hobby: []};

  return (
    <Card title="Skills">
      <div className={styles.twoCol}>
        <PracticalSkills skills={skills.practical} />
        <ExploringSkills skills={skills.hobby} />
      </div>
    </Card>
  );
}

export function CuriousCard({fields}: {fields: string[]}) {
  return (
    <Card title="Curious Fields">
      <div className={styles.chipRow}>
        {fields.map((field) => (
          <Chip key={field}>{field}</Chip>
        ))}
      </div>
    </Card>
  );
}

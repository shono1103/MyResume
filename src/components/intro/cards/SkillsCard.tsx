import React from 'react';
import styles from '../intro.module.css';
import type {IntroData} from '../introTypes';
import Card from './Card';
import {SkillGroup} from './common';

type Props = {
  intro: IntroData;
};

export default function SkillsCard({intro}: Props) {
  const skills = intro.skills ?? {work_experience: [], personal_projects: [], learning_in_progress: []};

  return (
    <Card title="Skills">
      <div className={styles.twoCol}>
        <SkillGroup title="Work Experience" skills={skills.work_experience} />
        <SkillGroup title="Personal Projects" skills={skills.personal_projects} />
        <SkillGroup title="Learning In Progress" skills={skills.learning_in_progress} />
      </div>
    </Card>
  );
}

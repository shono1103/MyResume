import React from 'react';
import styles from '../intro.module.css';
import Card from './Card';
import {Chip} from './common';

type Props = {
  strengths: string[];
};

export default function CoreStrengthsCard({strengths}: Props) {
  return (
    <Card title="Core Strengths">
      <div className={styles.chipRow}>
        {strengths.map((strength) => (
          <Chip key={strength}>{strength}</Chip>
        ))}
      </div>
    </Card>
  );
}

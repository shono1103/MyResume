import React from 'react';
import styles from '../intro.module.css';
import Card from './Card';
import {Chip} from './common';

type Props = {
  fields: string[];
};

export default function CuriousCard({fields}: Props) {
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

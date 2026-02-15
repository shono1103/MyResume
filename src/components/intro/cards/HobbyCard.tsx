import React from 'react';
import styles from '../intro.module.css';
import Card from './Card';
import {Chip} from './common';

type Props = {
  hobbies: string[];
};

export default function HobbyCard({hobbies}: Props) {
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

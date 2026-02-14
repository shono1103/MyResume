import React from 'react';
import styles from '../intro.module.css';
import Card from './Card';

type Props = {
  motto: string;
};

export default function MottoCard({motto}: Props) {
  return (
    <Card title="Motto">
      <p className={styles.mottoInline}>{motto}</p>
    </Card>
  );
}

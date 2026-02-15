import React from 'react';
import styles from '../intro.module.css';
import Card from './Card';

type Props = {
  email: string;
};

export default function EmailCard({email}: Props) {
  return (
    <Card title="Email">
      <a className={styles.email} href={`mailto:${email}`}>
        {email}
      </a>
    </Card>
  );
}

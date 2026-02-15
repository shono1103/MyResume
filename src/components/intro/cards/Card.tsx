import React from 'react';
import clsx from 'clsx';
import styles from '../intro.module.css';

type CardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Card({title, className, children}: CardProps) {
  return (
    <section className={clsx(styles.card, className)}>
      {title ? <div className={styles.cardTitle}>{title}</div> : null}
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

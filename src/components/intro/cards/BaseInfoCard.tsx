import React from 'react';
import type {IntroData} from '../introTypes';
import styles from '../intro.module.css';
import Card from './Card';
import {formatBirth} from './common';

type Props = {
  intro: IntroData;
  children?: React.ReactNode;
};

export default function BaseInfoCard({intro, children}: Props) {
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

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
  const [imgError, setImgError] = React.useState(false);
  const base = intro.base_info[0];
  if (!base) {
    return null;
  }

  const initials = (base.name || '?').trim().slice(0, 1).toUpperCase();
  const shouldShowFallback = imgError || !base.profile_img_path?.trim();

  return (
    <Card title="Base Info" className={styles.profile}>
      <div className={styles.baseInfoLayout}>
        {shouldShowFallback ? (
          <div className={styles.avatar} aria-label={`${base.name} fallback icon`}>
            {initials}
          </div>
        ) : (
          <img className={styles.avatar} src={base.profile_img_path} alt={`${base.name} icon`} onError={() => setImgError(true)} />
        )}
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

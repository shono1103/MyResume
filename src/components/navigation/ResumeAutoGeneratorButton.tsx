import React, {useEffect, useState} from 'react';
import ResumeAutoGenerator from '@site/src/components/documents/ResumeAutoGenerator';
import styles from './ResumeAutoGeneratorButton.module.css';

type Props = {
  label?: string;
  mobile?: boolean;
};

export default function ResumeAutoGeneratorButton({label = '書類生成', mobile}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (mobile) {
    return null;
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        {label}
      </button>

      {open ? (
        <div className={styles.overlay} onClick={() => setOpen(false)} role="presentation">
          <section className={styles.modal} onClick={(event) => event.stopPropagation()} aria-label="履歴書・職務経歴書生成フォーム">
            <div className={styles.head}>
              <h2 className={styles.title}>履歴書・職務経歴書生成フォーム</h2>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}>
                閉じる
              </button>
            </div>
            <div className={styles.body}>
              <ResumeAutoGenerator showPreview={false} submitLabel="submit" />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

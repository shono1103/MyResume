import React, {useState} from 'react';
import ResumeAutoGenerator from '@site/src/components/documents/ResumeAutoGenerator';
import Modal from '@site/src/components/common/Modal';
import styles from './ResumeAutoGeneratorButton.module.css';

type Props = {
  label?: string;
  mobile?: boolean;
};

export default function ResumeAutoGeneratorButton({label = '書類生成', mobile}: Props) {
  const [open, setOpen] = useState(false);

  if (mobile) {
    return null;
  }

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="履歴書・職務経歴書生成フォーム" panelClassName={styles.modal}>
        <div className={styles.head}>
          <h2 className={styles.title}>履歴書・職務経歴書生成フォーム</h2>
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            閉じる
          </button>
        </div>
        <div className={styles.body}>
          <ResumeAutoGenerator showPreview={false} submitLabel="submit" />
        </div>
      </Modal>
    </>
  );
}

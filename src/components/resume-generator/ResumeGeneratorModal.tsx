import React, { useState } from 'react';
import styles from './ResumeGeneratorModal.module.css';

interface FormData {
  phone: string;
  address: string;
  photoFile: File | null;
}

interface ResumeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (formData: FormData) => void;
}

export default function ResumeGeneratorModal({ isOpen, onClose, onGenerate }: ResumeGeneratorModalProps): React.JSX.Element | null {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ phone, address, photoFile });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>履歴書・職務経歴書生成</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              電話番号 <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="例: 090-1234-5678"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              住所 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 東京都渋谷区..."
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="photo" className={styles.label}>
              証明写真（履歴書用）
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className={styles.fileInput}
            />
            <p className={styles.helpText}>※ 証明写真は履歴書にのみ使用されます（職務経歴書には含まれません）</p>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              キャンセル
            </button>
            <button type="submit" className={styles.generateButton}>
              生成する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

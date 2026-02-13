import React from 'react';
import styles from './ResumeTemplate.module.css';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  address: string;
  photoDataUrl?: string;
  hobbies: string[];
  history: Array<{
    time: string;
    title: string;
  }>;
  certifications: Array<{
    name: string;
    DateOfQualification: string;
  }>;
}

interface ResumeTemplateProps {
  data: ResumeData;
}

export default function ResumeTemplate({ data }: ResumeTemplateProps): React.JSX.Element {
  return (
    <div className={styles.resumeContainer}>
      <div className={styles.resumePage}>
        <h1 className={styles.documentTitle}>履歴書</h1>
        
        <div className={styles.headerSection}>
          <div className={styles.personalInfo}>
            <div className={styles.infoRow}>
              <label>氏名：</label>
              <span className={styles.name}>{data.name}</span>
            </div>
            <div className={styles.infoRow}>
              <label>住所：</label>
              <span>{data.address}</span>
            </div>
            <div className={styles.infoRow}>
              <label>電話番号：</label>
              <span>{data.phone}</span>
            </div>
            <div className={styles.infoRow}>
              <label>メールアドレス：</label>
              <span>{data.email}</span>
            </div>
          </div>
          {data.photoDataUrl && (
            <div className={styles.photoContainer}>
              <img src={data.photoDataUrl} alt="証明写真" className={styles.photo} />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>学歴・職歴</h2>
          <table className={styles.historyTable}>
            <tbody>
              {data.history.map((item, index) => (
                <tr key={index}>
                  <td className={styles.dateCell}>{item.time}</td>
                  <td className={styles.contentCell}>{item.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>資格</h2>
          <table className={styles.certificationTable}>
            <tbody>
              {data.certifications.map((cert, index) => (
                <tr key={index}>
                  <td className={styles.dateCell}>{cert.DateOfQualification}</td>
                  <td className={styles.contentCell}>{cert.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>趣味</h2>
          <p className={styles.hobbyText}>{data.hobbies.join('、')}</p>
        </div>
      </div>
    </div>
  );
}

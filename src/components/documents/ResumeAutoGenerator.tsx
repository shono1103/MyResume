import React, {useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './ResumeAutoGenerator.module.css';
import type {FormState, Props} from '@site/src/util/documentGeneratorTypes';
import {loadResumeData} from './resumeDataLoader';
import {buildResumeHtml} from './resumeHtmlBuilder';
import {buildCareerHtml} from './careerHtmlBuilder';

const PHOTO_MAX_SIZE_BYTES = 8 * 1024 * 1024;
const PHOTO_ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const INITIAL_FORM: FormState = {
  postalCode: '',
  address: '',
  phone: '',
  motivation: '',
  preference: '',
  photoDataUrl: '',
};

export default function ResumeAutoGenerator({
  autoOpenOnGenerate = false,
  showPreview = true,
  submitLabel = '履歴書・職務経歴書を生成',
}: Props) {
  const baseUrl = useBaseUrl('/').replace(/\/$/, '');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [resumeHtml, setResumeHtml] = useState('');
  const [careerHtml, setCareerHtml] = useState('');

  const canPrint = useMemo(() => Boolean(resumeHtml && careerHtml), [resumeHtml, careerHtml]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const file = event.target.files?.[0];
    if (!file) {
      updateField('photoDataUrl', '');
      return;
    }

    if (!PHOTO_ALLOWED_MIME_TYPES.has(file.type)) {
      setPhotoError('証明写真は JPEG または PNG を選択してください。');
      updateField('photoDataUrl', '');
      event.target.value = '';
      return;
    }

    if (file.size > PHOTO_MAX_SIZE_BYTES) {
      setPhotoError('証明写真は 8MB 以下の画像を選択してください。');
      updateField('photoDataUrl', '');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error ?? new Error('failed to read image'));
        reader.readAsDataURL(file);
      });

      updateField('photoDataUrl', dataUrl);
    } catch {
      setPhotoError('証明写真の読み込みに失敗しました。画像を選び直してください。');
      updateField('photoDataUrl', '');
      event.target.value = '';
    }
  }

  function openPreviewPrint(html: string, target?: Window | null) {
    const opened = target ?? window.open('', '_blank');
    if (!opened) {
      return;
    }

    opened.document.open();
    opened.document.write(html);
    opened.document.close();
    opened.focus();
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const resumeWindow = autoOpenOnGenerate ? window.open('', '_blank') : null;
    const careerWindow = autoOpenOnGenerate ? window.open('', '_blank') : null;

    try {
      const loaded = await loadResumeData(baseUrl);
      const resume = buildResumeHtml(loaded.templates.resume, loaded.data, form);
      const career = buildCareerHtml(loaded.templates.career, loaded.data, form);

      setResumeHtml(resume);
      setCareerHtml(career);

      if (autoOpenOnGenerate) {
        openPreviewPrint(resume, resumeWindow);
        openPreviewPrint(career, careerWindow);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
      if (resumeWindow) {
        resumeWindow.close();
      }
      if (careerWindow) {
        careerWindow.close();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.formCard}>
        <p className={styles.hint}>フォーム入力 + dataファイルを使って、履歴書/職務経歴書を自動生成します。</p>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>証明写真</span>
            <input className={styles.input} type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} />
            {photoError ? <p>{photoError}</p> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>郵便番号</span>
            <input className={styles.input} value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span className={styles.label}>住所</span>
            <input className={styles.input} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>電話番号</span>
            <input className={styles.input} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span className={styles.label}>志望動機</span>
            <textarea className={styles.textarea} value={form.motivation} onChange={(e) => updateField('motivation', e.target.value)} />
          </label>

          <label className={`${styles.field} ${styles.fieldWide}`}>
            <span className={styles.label}>本人希望記入欄</span>
            <textarea className={styles.textarea} value={form.preference} onChange={(e) => updateField('preference', e.target.value)} />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={handleGenerate} disabled={loading}>
            {loading ? '生成中...' : submitLabel}
          </button>
          {canPrint ? (
            <>
              <button type="button" className={styles.buttonSecondary} onClick={() => openPreviewPrint(resumeHtml)}>
                履歴書を別タブで開く
              </button>
              <button type="button" className={styles.buttonSecondary} onClick={() => openPreviewPrint(careerHtml)}>
                職務経歴書を別タブで開く
              </button>
            </>
          ) : null}
        </div>

        {error ? <p>生成に失敗しました: {error}</p> : null}
      </div>

      {showPreview ? (
        <div className={styles.previewGrid}>
          <section className={styles.previewCard}>
            <div className={styles.previewHead}>
              <h3 className={styles.previewTitle}>履歴書プレビュー</h3>
            </div>
            <div className={styles.previewViewport}>
              <iframe className={styles.iframe} srcDoc={resumeHtml} title="履歴書プレビュー" />
            </div>
          </section>

          <section className={styles.previewCard}>
            <div className={styles.previewHead}>
              <h3 className={styles.previewTitle}>職務経歴書プレビュー</h3>
            </div>
            <div className={styles.previewViewport}>
              <iframe className={styles.iframe} srcDoc={careerHtml} title="職務経歴書プレビュー" />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

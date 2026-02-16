import type {ResumeData} from '@site/src/util/documentGeneratorTypes';
import {appendLinkOrText} from '../utils/dom';

function resolveGenerationSourceUrl(data: ResumeData): string {
  return data.portfolioUrlFromData || data.githubUrl || '';
}

export function createGenerationNoteElement(doc: Document, data: ResumeData, documentLabel: string): HTMLDivElement {
  const sourceUrl = resolveGenerationSourceUrl(data);
  const note = doc.createElement('div');

  note.append(`この${documentLabel}は佐伯奨乃によって作成された`);
  appendLinkOrText(doc, note, sourceUrl, {linkText: 'MyResume', fallbackText: 'MyResume'});
  note.append('で生成されました。');

  return note;
}

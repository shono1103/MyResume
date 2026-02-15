import type {FormState, ResumeData} from '@site/src/util/documentGeneratorTypes';

type CertificationRowSource = ResumeData['certifications'][number];

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

function parseYearMonth(value?: unknown): {year: number; month: number} | null {
  const text = normalizeText(value).trim();
  if (!text) {
    return null;
  }

  const match = text.match(/^(\d{4})[./-](\d{1,2})/);
  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function formatYearMonth(value?: unknown): string {
  const parsed = parseYearMonth(value);
  if (!parsed) {
    return normalizeText(value).trim();
  }

  return `${parsed.year}年${parsed.month}月`;
}

function formatTodayJa(): string {
  const today = new Date();
  return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日現在`;
}

function toInputDate(value?: unknown): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(normalizeText(value));
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function calcAge(value?: unknown): string {
  if (!value) {
    return '';
  }

  const birth = value instanceof Date ? value : new Date(normalizeText(value));
  if (Number.isNaN(birth.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasNotHadBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return `${age}`;
}

function createTableRow(documentRef: Document, yearMonth: string, content: string, centered = true): HTMLTableRowElement {
  const tr = documentRef.createElement('tr');
  const tdDate = documentRef.createElement('td');
  tdDate.className = centered ? 'h-1 center' : 'h-1';
  tdDate.textContent = yearMonth;

  const tdContent = documentRef.createElement('td');
  tdContent.textContent = content;

  tr.appendChild(tdDate);
  tr.appendChild(tdContent);
  return tr;
}

function replaceTableRows(documentRef: Document, tableSelector: string, rows: Array<{yearMonth: string; content: string}>, withEndRow = false) {
  const table = documentRef.querySelector(tableSelector);
  if (!table) {
    return;
  }

  const allRows = Array.from(table.querySelectorAll('tr'));
  const headerRow = allRows[0];
  if (!headerRow) {
    return;
  }

  allRows.slice(1).forEach((row) => row.remove());

  rows.forEach((item) => {
    table.appendChild(createTableRow(documentRef, item.yearMonth, item.content));
  });

  if (withEndRow) {
    const tr = documentRef.createElement('tr');
    const tdDate = documentRef.createElement('td');
    tdDate.className = 'h-1 center';
    tdDate.textContent = '';
    const tdEnd = documentRef.createElement('td');
    tdEnd.className = 'right';
    tdEnd.textContent = '以上';
    tr.appendChild(tdDate);
    tr.appendChild(tdEnd);
    table.appendChild(tr);
  }
}

function setCellText(element: Element | null, value: string) {
  if (!element) {
    return;
  }

  element.textContent = value;
}

function buildCertificationContent(item: CertificationRowSource): string {
  const name = normalizeText(item.name).trim();
  const resultLabel = normalizeText(item.result_label).trim();
  const orgName = normalizeText(item.org_name).trim();
  const body = [name, resultLabel].filter(Boolean).join(' ');

  if (!body) {
    return '';
  }

  return orgName ? `${body}（${orgName}）` : body;
}

export function buildResumeHtml(template: string, data: ResumeData, form: FormState): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, 'text/html');
  doc.title = '履歴書.html';

  const infoRows = doc.querySelectorAll('table[aria-label="基本情報"] tr');
  setCellText(infoRows[0]?.querySelector('td'), data.pronounce);
  setCellText(infoRows[1]?.querySelector('td'), data.name);

  const birthLabel = `${toInputDate(data.birth)}（満 ${calcAge(data.birth)} 歳）`;
  setCellText(infoRows[2]?.querySelector('td'), birthLabel);
  setCellText(infoRows[2]?.querySelector('.gender-cell'), data.gender);

  setCellText(doc.querySelector('.date'), formatTodayJa());

  const photoNode = doc.querySelector('.photo');
  if (photoNode && form.photoDataUrl) {
    photoNode.innerHTML = '';
    const img = doc.createElement('img');
    img.src = form.photoDataUrl;
    img.alt = '証明写真';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    photoNode.appendChild(img);
  }

  setCellText(doc.querySelector('.addr-zip'), form.postalCode ? `〒${form.postalCode}` : '〒');
  setCellText(doc.querySelector('.addr-main'), form.address);

  const contactRows = doc.querySelectorAll('table[aria-label="住所・連絡先"] tr');
  setCellText(contactRows[1]?.querySelector('td'), form.phone);
  setCellText(contactRows[2]?.querySelector('td'), data.email);

  const educationRows = data.timeline
    .filter((item) => item.tags?.includes('education'))
    .map((item) => ({yearMonth: formatYearMonth(item.time), content: normalizeText(item.title).trim()}))
    .filter((item) => item.content);

  replaceTableRows(doc, 'table[aria-label="学歴"]', educationRows);

  const workRows = data.timeline
    .filter((item) => item.tags?.includes('work') || item.tags?.includes('now'))
    .map((item) => ({yearMonth: formatYearMonth(item.time), content: normalizeText(item.title).trim()}))
    .filter((item) => item.content);

  replaceTableRows(doc, 'table[aria-label="職歴"]', workRows, true);

  const certRows = [...data.certifications]
    .sort((a, b) => normalizeText(a.DateOfQualification).localeCompare(normalizeText(b.DateOfQualification)))
    .map((item) => ({yearMonth: formatYearMonth(item.DateOfQualification), content: buildCertificationContent(item)}))
    .filter((item) => item.content);

  replaceTableRows(doc, 'table[aria-label="免許・資格"]', certRows);

  const motivationCell = doc.querySelector('table[aria-label="志望動機"] td');
  const selfPrCell = doc.querySelector('table[aria-label="自己PR"] td');
  const preferenceCell = doc.querySelector('table[aria-label="本人希望記入欄"] td');

  if (motivationCell) {
    motivationCell.textContent = form.motivation;
    (motivationCell as HTMLElement).style.whiteSpace = 'pre-wrap';
  }

  if (selfPrCell) {
    selfPrCell.textContent = '職務経歴書参照';
    (selfPrCell as HTMLElement).style.whiteSpace = 'pre-wrap';
  }

  if (preferenceCell) {
    preferenceCell.textContent = form.preference;
    (preferenceCell as HTMLElement).style.whiteSpace = 'pre-wrap';
  }

  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}

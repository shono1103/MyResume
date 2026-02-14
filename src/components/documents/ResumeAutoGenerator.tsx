import React, {useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {load as parseYaml} from 'js-yaml';
import styles from './ResumeAutoGenerator.module.css';
import type {
  FormState,
  HeaderYaml,
  Props,
  ResumeData,
} from '@site/src/util/documentGeneratorTypes';
import type {Certification, CertificationsYaml} from '@site/src/util/certificationTypes';
import type {ExperienceCompany, ExperiencesIndexYaml} from '@site/src/util/experienceTypes';
import type {TimelineItem, HistoryYaml} from '@site/src/util/historyTypes';
import type {IntroYaml} from '@site/src/util/introTypes';
import type {ProjectEntry, ProjectsYaml, ProjectTech} from '@site/src/util/projectTypes';

const INITIAL_FORM: FormState = {
  postalCode: '',
  address: '',
  phone: '',
  motivation: '',
  preference: '',
  photoDataUrl: '',
};

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

function markdownToText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '・')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitParagraphs(markdown: string): string[] {
  return markdownToText(markdown)
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function flattenTech(tech?: ProjectTech[]): string[] {
  if (!tech || tech.length === 0) {
    return [];
  }

  const tags = tech.flatMap((item) => [
    ...(item.os ?? []),
    ...(item.lang ?? []),
    ...(item.framework ?? []),
    ...(item.infra ?? []),
  ]);

  return Array.from(new Set(tags));
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${path} (${response.status})`);
  }

  return response.text();
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isIntroBaseInfoArray(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(
    (item) =>
      isRecord(item) &&
      (item.name === undefined || typeof item.name === 'string') &&
      (item.pronounce === undefined || typeof item.pronounce === 'string') &&
      (item.birth === undefined || typeof item.birth === 'string' || item.birth instanceof Date) &&
      (item.gender === undefined || typeof item.gender === 'string'),
  );
}

function isIntroYaml(value: unknown): value is IntroYaml {
  if (!isRecord(value)) {
    return false;
  }
  if (value.intro === undefined) {
    return true;
  }
  if (!isRecord(value.intro)) {
    return false;
  }

  const intro = value.intro;
  const isBaseInfoValid = intro.base_info === undefined || isIntroBaseInfoArray(intro.base_info);
  const isEmailValid = intro.email === undefined || typeof intro.email === 'string';
  const isCoreStrengthsValid = intro.core_strengths === undefined || isStringArray(intro.core_strengths);
  const isCuriousFieldsValid = intro.curious_fields === undefined || isStringArray(intro.curious_fields);
  const isSkillsValid =
    intro.skills === undefined ||
    (isRecord(intro.skills) &&
      (intro.skills.work_experience === undefined || isStringArray(intro.skills.work_experience)) &&
      (intro.skills.personal_projects === undefined || isStringArray(intro.skills.personal_projects)) &&
      (intro.skills.learning_in_progress === undefined || isStringArray(intro.skills.learning_in_progress)));

  return isBaseInfoValid && isEmailValid && isCoreStrengthsValid && isCuriousFieldsValid && isSkillsValid;
}

function isHistoryYaml(value: unknown): value is HistoryYaml {
  if (!isRecord(value)) {
    return false;
  }
  if (value.timeline === undefined) {
    return true;
  }
  return Array.isArray(value.timeline) && value.timeline.every((item) => isRecord(item));
}

function isCertificationsYaml(value: unknown): value is CertificationsYaml {
  if (!isRecord(value)) {
    return false;
  }
  if (value.certifications === undefined) {
    return true;
  }
  return (
    Array.isArray(value.certifications) &&
    value.certifications.every(
      (item) =>
        isRecord(item) &&
        (item.name === undefined || typeof item.name === 'string') &&
        (item.DateOfQualification === undefined || typeof item.DateOfQualification === 'string'),
    )
  );
}

function isProjectsYaml(value: unknown): value is ProjectsYaml {
  if (!isRecord(value)) {
    return false;
  }
  if (value.projects === undefined) {
    return true;
  }
  return Array.isArray(value.projects) && value.projects.every((item) => isRecord(item));
}

function isHeaderYaml(value: unknown): value is HeaderYaml {
  if (!isRecord(value)) {
    return false;
  }
  return value.links === undefined || Array.isArray(value.links);
}

function isExperiencesIndexYaml(value: unknown): value is ExperiencesIndexYaml {
  if (!isRecord(value)) {
    return false;
  }
  return value.companies === undefined || Array.isArray(value.companies);
}

function toTimelineItems(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is TimelineItem => isRecord(item));
}

function toCertifications(value: unknown): Certification[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is Certification => isRecord(item));
}

function toProjects(value: unknown): ProjectEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is ProjectEntry => isRecord(item));
}

function isExperienceCompany(value: unknown): value is ExperienceCompany {
  return isRecord(value);
}

function loadLinkByKey(headerParsed: HeaderYaml | null, key: string): string {
  const links = headerParsed?.links;
  if (!Array.isArray(links)) {
    return '';
  }

  const block = links.find((item) => isRecord(item) && Array.isArray(item[key]));
  const values = block?.[key];
  if (!Array.isArray(values) || values.length === 0) {
    return '';
  }

  return typeof values[0]?.link === 'string' ? values[0].link : '';
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeText(item)).filter(Boolean);
}

async function loadResumeData(baseUrl: string): Promise<{data: ResumeData; templates: {resume: string; career: string}}> {
  const [introText, historyText, certificationsText, projectsText, headerText, selfPrText, resumeTemplate, careerTemplate] =
    await Promise.all([
      fetchText(`${baseUrl}/data/intro.yml`),
      fetchText(`${baseUrl}/data/history.yml`),
      fetchText(`${baseUrl}/data/certifications.yml`),
      fetchText(`${baseUrl}/data/projects.yml`),
      fetchText(`${baseUrl}/data/header.yml`),
      fetchText(`${baseUrl}/data/selfPR.md`),
      fetchText(`${baseUrl}/templates/resume.html`),
      fetchText(`${baseUrl}/templates/career-history.html`),
    ]);

  const introParsedRaw = parseYaml(introText);
  const historyParsedRaw = parseYaml(historyText);
  const certificationsParsedRaw = parseYaml(certificationsText);
  const projectsParsedRaw = parseYaml(projectsText);
  const headerParsedRaw = parseYaml(headerText);

  const introParsed = isIntroYaml(introParsedRaw) ? introParsedRaw : null;
  const historyParsed = isHistoryYaml(historyParsedRaw) ? historyParsedRaw : null;
  const certificationsParsed = isCertificationsYaml(certificationsParsedRaw) ? certificationsParsedRaw : null;
  const projectsParsed = isProjectsYaml(projectsParsedRaw) ? projectsParsedRaw : null;
  const headerParsed = isHeaderYaml(headerParsedRaw) ? headerParsedRaw : null;

  const experiencesIndexText = await fetchText(`${baseUrl}/data/experiences/index.yml`);
  const experiencesIndexParsedRaw = parseYaml(experiencesIndexText);
  const experiencesIndexParsed = isExperiencesIndexYaml(experiencesIndexParsedRaw) ? experiencesIndexParsedRaw : null;
  const experienceFiles = Array.isArray(experiencesIndexParsed?.companies)
    ? experiencesIndexParsed.companies
        .map((item) => item?.file)
        .filter((item): item is string => typeof item === 'string')
    : [];

  const experienceCompanies = await Promise.all(
    experienceFiles.map(async (item) => {
      const raw = await fetchText(`${baseUrl}${item}`);
      const parsed = parseYaml(raw);
      return isExperienceCompany(parsed) ? parsed : {};
    }),
  );

  const abstractPath = experienceCompanies.find((company) => company?.name)?.abstract_mdFilePath;
  const abstractMarkdown = abstractPath ? await fetchText(`${baseUrl}${abstractPath}`) : '';

  const baseInfo = introParsed?.intro?.base_info?.[0] ?? {};
  const skillsNode = introParsed?.intro?.skills;
  const skillsRecord = isRecord(skillsNode) ? skillsNode : null;

  const workExperience = toStringArray(skillsRecord?.work_experience);
  const personalProjects = toStringArray(skillsRecord?.personal_projects);
  const learningInProgress = toStringArray(skillsRecord?.learning_in_progress);

  const portfolioUrl = typeof window !== 'undefined' ? new URL(baseUrl || '/', window.location.origin).toString() : '';

  return {
    data: {
      name: normalizeText(baseInfo?.name),
      pronounce: normalizeText(baseInfo?.pronounce),
      birth: normalizeText(baseInfo?.birth),
      gender: normalizeText(baseInfo?.gender),
      email: normalizeText(introParsed?.intro?.email),
      timeline: toTimelineItems(historyParsed?.timeline),
      certifications: toCertifications(certificationsParsed?.certifications),
      selfPrMarkdown: selfPrText,
      coreStrengths: toStringArray(introParsed?.intro?.core_strengths),
      curiousFields: toStringArray(introParsed?.intro?.curious_fields),
      skillsWorkExperience: workExperience,
      skillsPersonalProjects: personalProjects,
      skillsLearningInProgress: learningInProgress,
      githubUrl: loadLinkByKey(headerParsed, 'github'),
      portfolioUrlFromData: portfolioUrl,
      projects: toProjects(projectsParsed?.projects),
      experiences: experienceCompanies,
      experienceAbstract: abstractMarkdown,
    },
    templates: {
      resume: resumeTemplate,
      career: careerTemplate,
    },
  };
}

function setCellText(element: Element | null, value: string) {
  if (!element) {
    return;
  }

  element.textContent = value;
}

function buildResumeHtml(template: string, data: ResumeData, form: FormState): string {
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
    .map((item) => ({yearMonth: formatYearMonth(item.DateOfQualification), content: normalizeText(item.name).trim()}))
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

function appendTagList(documentRef: Document, target: Element, tags: string[]) {
  target.innerHTML = '';
  if (tags.length === 0) {
    const span = documentRef.createElement('span');
    span.className = 'tag';
    span.textContent = '-';
    target.appendChild(span);
    return;
  }

  tags.forEach((tag) => {
    const span = documentRef.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    target.appendChild(span);
  });
}

function buildCareerHtml(template: string, data: ResumeData, form: FormState): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, 'text/html');
  doc.title = '職務経歴書.html';

  const profile = doc.querySelector('.profile');
  if (profile) {
    profile.innerHTML = '';
    const rows = [
      ['氏名', data.name],
      ['Email', data.email],
      ['GitHub', data.githubUrl],
      ['Portfolio', data.portfolioUrlFromData || '-'],
    ];

    rows.forEach(([label, value]) => {
      const row = doc.createElement('div');
      row.className = 'row';
      const strong = doc.createElement('strong');
      strong.textContent = `${label}:`;
      row.appendChild(strong);
      row.append(' ');

      if (typeof value === 'string' && value.startsWith('http')) {
        const link = doc.createElement('a');
        link.href = value;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = value;
        row.appendChild(link);
      } else {
        row.append(value || '-');
      }

      profile.appendChild(row);
    });

    const note = doc.createElement('div');
    note.className = 'row small';
    note.textContent = '※住所/電話番号/証明写真は履歴書に反映';
    profile.appendChild(note);
  }

  const subTime = doc.querySelector('.title .sub time');
  if (subTime) {
    const iso = new Date().toISOString().slice(0, 10);
    subTime.setAttribute('datetime', iso);
    subTime.textContent = iso;
  }

  const summaryParagraph = doc.querySelector('#summary .card > p');
  if (summaryParagraph) {
    const paragraph = splitParagraphs(data.experienceAbstract)[0] ?? markdownToText(data.selfPrMarkdown);
    summaryParagraph.textContent = paragraph;
  }

  const areaList = doc.querySelectorAll('#summary .grid .card .list')[0];
  if (areaList) {
    areaList.innerHTML = '';
    const areas =
      data.coreStrengths.length > 0
        ? data.coreStrengths
        : data.curiousFields.length > 0
          ? data.curiousFields
          : ['バックエンド', 'インフラ', '運用改善'];
    areas.slice(0, 6).forEach((item) => {
      const li = doc.createElement('li');
      li.textContent = item;
      areaList.appendChild(li);
    });
  }

  const skillGroups = doc.querySelectorAll('#summary .skill-group');
  if (skillGroups[0]) {
    appendTagList(doc, skillGroups[0].querySelector('.tags') as Element, data.skillsWorkExperience);
  }
  if (skillGroups[1]) {
    appendTagList(doc, skillGroups[1].querySelector('.tags') as Element, data.skillsPersonalProjects);
  }
  if (skillGroups[2]) {
    const learnings =
      data.skillsLearningInProgress.length > 0
        ? data.skillsLearningInProgress
        : Array.from(new Set(data.projects.flatMap((item) => flattenTech(item.tech)))).slice(0, 8);
    appendTagList(doc, skillGroups[2].querySelector('.tags') as Element, learnings);
  }

  const experienceSection = doc.querySelector('#experience');
  if (experienceSection) {
    Array.from(experienceSection.querySelectorAll('.company-group')).forEach((item) => item.remove());

    data.experiences.forEach((company) => {
      const companyGroup = doc.createElement('article');
      companyGroup.className = 'company-group';

      const head = doc.createElement('div');
      head.className = 'company-head';

      const left = doc.createElement('div');
      left.className = 'left';
      const companyName = doc.createElement('div');
      companyName.className = 'company';
      companyName.textContent = company.name ?? '-';
      const meta = doc.createElement('div');
      meta.className = 'meta';
      meta.textContent = '職種: ソフトウェアエンジニア';
      left.appendChild(companyName);
      left.appendChild(meta);

      const right = doc.createElement('div');
      right.className = 'right';
      const period = doc.createElement('div');
      period.textContent = company.period ?? '-';
      right.appendChild(period);

      head.appendChild(left);
      head.appendChild(right);
      companyGroup.appendChild(head);

      const projectWrap = doc.createElement('div');
      projectWrap.className = 'company-projects';

      (company.projects ?? []).forEach((project) => {
        const item = doc.createElement('article');
        item.className = 'project-item';

        const title = doc.createElement('h3');
        title.className = 'project-title';
        title.textContent = project.title ?? '-';

        const kv = doc.createElement('div');
        kv.className = 'kv';

        const pairs: Array<[string, string]> = [
          ['役割', (project.role ?? []).join(' / ') || '-'],
          ['成果（定量/定性）', normalizeText(project.result).trim() || normalizeText(project.summary).trim() || '-'],
        ];

        pairs.forEach(([k, v]) => {
          const kDiv = doc.createElement('div');
          kDiv.className = 'k';
          kDiv.textContent = k;
          const vDiv = doc.createElement('div');
          vDiv.className = 'v';
          vDiv.textContent = v;
          kv.appendChild(kDiv);
          kv.appendChild(vDiv);
        });

        const techK = doc.createElement('div');
        techK.className = 'k';
        techK.textContent = '技術';
        const techV = doc.createElement('div');
        techV.className = 'v';
        techV.innerHTML = `
          <div class="tech-groups">
            <div class="tech-row"><div class="tech-label">OS</div><div class="tags"></div></div>
            <div class="tech-row"><div class="tech-label">Lang</div><div class="tags"></div></div>
            <div class="tech-row"><div class="tech-label">Infra</div><div class="tags"></div></div>
          </div>
        `;

        const tagRows = techV.querySelectorAll('.tech-row .tags');
        appendTagList(doc, tagRows[0], project.tech?.os ?? []);
        appendTagList(doc, tagRows[1], project.tech?.lang ?? []);
        appendTagList(doc, tagRows[2], project.tech?.infra ?? []);

        kv.appendChild(techK);
        kv.appendChild(techV);

        item.appendChild(title);
        item.appendChild(kv);

        const effort = project.effort ?? [];
        const issue = project.issue_solving ?? [];

        if (effort.length > 0) {
          const h3 = doc.createElement('h3');
          h3.textContent = '工夫';
          item.appendChild(h3);
          const ul = doc.createElement('ul');
          ul.className = 'list';
          effort.forEach((entry) => {
            const li = doc.createElement('li');
            li.textContent = entry;
            ul.appendChild(li);
          });
          item.appendChild(ul);
        }

        if (issue.length > 0) {
          const h3 = doc.createElement('h3');
          h3.textContent = '課題解決';
          item.appendChild(h3);
          const ul = doc.createElement('ul');
          ul.className = 'list';
          issue.forEach((entry) => {
            const li = doc.createElement('li');
            li.textContent = entry;
            ul.appendChild(li);
          });
          item.appendChild(ul);
        }

        projectWrap.appendChild(item);
      });

      companyGroup.appendChild(projectWrap);
      experienceSection.appendChild(companyGroup);
    });
  }

  const projectsSection = doc.querySelector('#projects');
  if (projectsSection) {
    Array.from(projectsSection.querySelectorAll('.job')).forEach((item) => item.remove());

    data.projects.forEach((project) => {
      const article = doc.createElement('article');
      article.className = 'job';

      const head = doc.createElement('div');
      head.className = 'job-head';

      const left = doc.createElement('div');
      left.className = 'left';
      const company = doc.createElement('div');
      company.className = 'company';
      company.textContent = project.name ?? '-';
      const meta = doc.createElement('div');
      meta.className = 'meta';
      meta.textContent = '個人開発 / OSS';
      left.appendChild(company);
      left.appendChild(meta);

      const right = doc.createElement('div');
      right.className = 'right';
      const repoDiv = doc.createElement('div');
      repoDiv.textContent = 'GitHub: ';
      if (project.repos_url) {
        const link = doc.createElement('a');
        link.href = project.repos_url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = project.repos_url;
        repoDiv.appendChild(link);
      } else {
        repoDiv.append('-');
      }

      right.appendChild(repoDiv);
      head.appendChild(left);
      head.appendChild(right);
      article.appendChild(head);

      const kv = doc.createElement('div');
      kv.className = 'kv';

      const dataPairs: Array<[string, string]> = [
        ['概要', normalizeText(project.abstract).trim() || '-'],
        ['工夫', (project.effort ?? []).join(' / ') || '-'],
      ];

      dataPairs.forEach(([k, v]) => {
        const kDiv = doc.createElement('div');
        kDiv.className = 'k';
        kDiv.textContent = k;
        const vDiv = doc.createElement('div');
        vDiv.className = 'v';
        vDiv.textContent = v;
        kv.appendChild(kDiv);
        kv.appendChild(vDiv);
      });

      const techK = doc.createElement('div');
      techK.className = 'k';
      techK.textContent = '技術';
      const techV = doc.createElement('div');
      techV.className = 'v';
      const tagWrap = doc.createElement('div');
      tagWrap.className = 'tags';
      appendTagList(doc, tagWrap, flattenTech(project.tech));
      techV.appendChild(tagWrap);
      kv.appendChild(techK);
      kv.appendChild(techV);

      article.appendChild(kv);

      const features = project.main_function ?? [];
      if (features.length > 0) {
        const h3 = doc.createElement('h3');
        h3.textContent = '主要機能';
        article.appendChild(h3);

        const ul = doc.createElement('ul');
        ul.className = 'list';
        features.forEach((item) => {
          const li = doc.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        article.appendChild(ul);
      }

      projectsSection.appendChild(article);
    });
  }

  const prSectionCard = doc.querySelector('#pr .card');
  if (prSectionCard) {
    prSectionCard.innerHTML = '';
    const paragraphs = splitParagraphs(data.selfPrMarkdown);
    paragraphs.forEach((item) => {
      const p = doc.createElement('p');
      p.textContent = item;
      prSectionCard.appendChild(p);
    });
  }

  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}

export default function ResumeAutoGenerator({
  autoOpenOnGenerate = false,
  showPreview = true,
  submitLabel = '履歴書・職務経歴書を生成',
}: Props) {
  const baseUrl = useBaseUrl('/').replace(/\/$/, '');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeHtml, setResumeHtml] = useState('');
  const [careerHtml, setCareerHtml] = useState('');

  const canPrint = useMemo(() => Boolean(resumeHtml && careerHtml), [resumeHtml, careerHtml]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      updateField('photoDataUrl', '');
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error ?? new Error('failed to read image'));
      reader.readAsDataURL(file);
    });

    updateField('photoDataUrl', dataUrl);
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
            <input className={styles.input} type="file" accept="image/*" onChange={handlePhotoChange} />
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
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => openPreviewPrint(resumeHtml)}
              >
                履歴書を別タブで開く
              </button>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => openPreviewPrint(careerHtml)}
              >
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

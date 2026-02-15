import type {FormState, ResumeData} from '@site/src/util/documentGeneratorTypes';
import type {ExperienceCompany, ExperienceProject} from '@site/src/util/experienceTypes';
import type {ProjectEntry, ProjectTech} from '@site/src/util/projectTypes';

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
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

function appendTagList(documentRef: Document, target: Element | null, tags: string[]) {
  if (!target) {
    return;
  }

  if (tags.length === 0) {
    const span = documentRef.createElement('span');
    span.className = 'tag';
    span.textContent = '-';
    target.replaceChildren(span);
    return;
  }

  const tagElements = tags.map((tag) => {
    const span = documentRef.createElement('span');
    span.className = 'tag';
    span.textContent = tag;
    return span;
  });

  target.replaceChildren(...tagElements);
}

function appendKeyValueRows(documentRef: Document, target: HTMLElement, pairs: Array<[string, string]>) {
  pairs.forEach(([key, value]) => {
    const keyDiv = documentRef.createElement('div');
    keyDiv.className = 'k';
    keyDiv.textContent = key;

    const valueDiv = documentRef.createElement('div');
    valueDiv.className = 'v';
    valueDiv.textContent = value;

    target.appendChild(keyDiv);
    target.appendChild(valueDiv);
  });
}

function appendListSection(documentRef: Document, target: HTMLElement, title: string, items: string[]) {
  if (items.length === 0) {
    return;
  }

  const heading = documentRef.createElement('h3');
  heading.textContent = title;
  target.appendChild(heading);

  const list = documentRef.createElement('ul');
  list.className = 'list';
  items.forEach((item) => {
    const li = documentRef.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  target.appendChild(list);
}

function createCareerDocument(template: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, 'text/html');
  doc.title = '職務経歴書.html';
  return doc;
}

function fillHeaderSection(doc: Document, data: ResumeData) {
  const profile = doc.querySelector('.profile');
  if (profile) {
    const rows: Array<[string, string]> = [
      ['氏名', data.name],
      ['Email', data.email],
      ['GitHub', data.githubUrl],
      ['Portfolio', data.portfolioUrlFromData || '-'],
    ];

    const rowElements = rows.map(([label, value]) => {
      const row = doc.createElement('div');
      row.className = 'row';
      const strong = doc.createElement('strong');
      strong.textContent = `${label}:`;
      row.appendChild(strong);
      row.append(' ');

      if (value.startsWith('http')) {
        const link = doc.createElement('a');
        link.href = value;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = value;
        row.appendChild(link);
      } else {
        row.append(value || '-');
      }

      return row;
    });

    const note = doc.createElement('div');
    note.className = 'row small';
    note.textContent = '※住所/電話番号/証明写真は履歴書に反映';

    profile.replaceChildren(...rowElements, note);
  }

  const subTime = doc.querySelector('.title .sub time');
  if (subTime) {
    const iso = new Date().toISOString().slice(0, 10);
    subTime.setAttribute('datetime', iso);
    subTime.textContent = iso;
  }
}

function fillSummarySection(doc: Document, data: ResumeData) {
  const summaryParagraph = doc.querySelector('#summary .card > p');
  if (summaryParagraph) {
    const paragraph = splitParagraphs(data.experienceAbstract)[0] ?? markdownToText(data.selfPrMarkdown);
    summaryParagraph.textContent = paragraph;
  }

  const areaList = doc.querySelectorAll('#summary .grid .card .list')[0];
  if (areaList) {
    const areas =
      data.coreStrengths.length > 0
        ? data.coreStrengths
        : data.curiousFields.length > 0
          ? data.curiousFields
          : ['バックエンド', 'インフラ', '運用改善'];

    const listItems = areas.slice(0, 6).map((item) => {
      const li = doc.createElement('li');
      li.textContent = item;
      return li;
    });
    areaList.replaceChildren(...listItems);
  }

  const skillGroups = doc.querySelectorAll('#summary .skill-group');
  appendTagList(doc, skillGroups[0]?.querySelector('.tags'), data.skillsWorkExperience);
  appendTagList(doc, skillGroups[1]?.querySelector('.tags'), data.skillsPersonalProjects);

  const learnings =
    data.skillsLearningInProgress.length > 0
      ? data.skillsLearningInProgress
      : Array.from(new Set(data.projects.flatMap((item) => flattenTech(item.tech)))).slice(0, 8);
  appendTagList(doc, skillGroups[2]?.querySelector('.tags'), learnings);
}

function createTechGroups(documentRef: Document, os: string[], lang: string[], infra: string[]): HTMLDivElement {
  const techGroups = documentRef.createElement('div');
  techGroups.className = 'tech-groups';

  const entries: Array<[string, string[]]> = [
    ['OS', os],
    ['Lang', lang],
    ['Infra', infra],
  ];

  entries.forEach(([label, tags]) => {
    const row = documentRef.createElement('div');
    row.className = 'tech-row';

    const labelDiv = documentRef.createElement('div');
    labelDiv.className = 'tech-label';
    labelDiv.textContent = label;

    const tagsDiv = documentRef.createElement('div');
    tagsDiv.className = 'tags';
    appendTagList(documentRef, tagsDiv, tags);

    row.appendChild(labelDiv);
    row.appendChild(tagsDiv);
    techGroups.appendChild(row);
  });

  return techGroups;
}

function createExperienceProjectItem(documentRef: Document, project: ExperienceProject): HTMLElement {
  const item = documentRef.createElement('article');
  item.className = 'project-item';

  const title = documentRef.createElement('h3');
  title.className = 'project-title';
  title.textContent = project.title ?? '-';

  const kv = documentRef.createElement('div');
  kv.className = 'kv';

  const pairs: Array<[string, string]> = [
    ['役割', (project.role ?? []).join(' / ') || '-'],
    ['成果（定量/定性）', normalizeText(project.result).trim() || normalizeText(project.summary).trim() || '-'],
  ];
  appendKeyValueRows(documentRef, kv, pairs);

  const techKey = documentRef.createElement('div');
  techKey.className = 'k';
  techKey.textContent = '技術';
  const techValue = documentRef.createElement('div');
  techValue.className = 'v';
  techValue.appendChild(createTechGroups(documentRef, project.tech?.os ?? [], project.tech?.lang ?? [], project.tech?.infra ?? []));

  kv.appendChild(techKey);
  kv.appendChild(techValue);

  item.appendChild(title);
  item.appendChild(kv);

  appendListSection(documentRef, item, '工夫', project.effort ?? []);
  appendListSection(documentRef, item, '課題解決', project.issue_solving ?? []);

  return item;
}

function createCompanyGroup(documentRef: Document, company: ExperienceCompany): HTMLElement {
  const companyGroup = documentRef.createElement('article');
  companyGroup.className = 'company-group';

  const head = documentRef.createElement('div');
  head.className = 'company-head';

  const left = documentRef.createElement('div');
  left.className = 'left';
  const companyName = documentRef.createElement('div');
  companyName.className = 'company';
  companyName.textContent = company.name ?? '-';
  const meta = documentRef.createElement('div');
  meta.className = 'meta';
  meta.textContent = '職種: ソフトウェアエンジニア';
  left.appendChild(companyName);
  left.appendChild(meta);

  const right = documentRef.createElement('div');
  right.className = 'right';
  const period = documentRef.createElement('div');
  period.textContent = company.period ?? '-';
  right.appendChild(period);

  head.appendChild(left);
  head.appendChild(right);
  companyGroup.appendChild(head);

  const projectWrap = documentRef.createElement('div');
  projectWrap.className = 'company-projects';
  (company.projects ?? []).forEach((project) => {
    projectWrap.appendChild(createExperienceProjectItem(documentRef, project));
  });
  companyGroup.appendChild(projectWrap);

  return companyGroup;
}

function fillExperienceSection(doc: Document, data: ResumeData) {
  const experienceSection = doc.querySelector('#experience');
  if (!experienceSection) {
    return;
  }

  const companyGroups = data.experiences.map((company) => createCompanyGroup(doc, company));
  experienceSection.querySelectorAll('.company-group').forEach((item) => item.remove());
  experienceSection.append(...companyGroups);
}

function createPersonalProjectArticle(documentRef: Document, project: ProjectEntry): HTMLElement {
  const article = documentRef.createElement('article');
  article.className = 'job';

  const head = documentRef.createElement('div');
  head.className = 'job-head';

  const left = documentRef.createElement('div');
  left.className = 'left';
  const company = documentRef.createElement('div');
  company.className = 'company';
  company.textContent = project.name ?? '-';
  const meta = documentRef.createElement('div');
  meta.className = 'meta';
  meta.textContent = '個人開発 / OSS';
  left.appendChild(company);
  left.appendChild(meta);

  const right = documentRef.createElement('div');
  right.className = 'right';
  const repoDiv = documentRef.createElement('div');
  repoDiv.textContent = 'GitHub: ';
  if (project.repos_url) {
    const link = documentRef.createElement('a');
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

  const kv = documentRef.createElement('div');
  kv.className = 'kv';
  appendKeyValueRows(documentRef, kv, [
    ['概要', normalizeText(project.abstract).trim() || '-'],
    ['工夫', (project.effort ?? []).join(' / ') || '-'],
  ]);

  const techKey = documentRef.createElement('div');
  techKey.className = 'k';
  techKey.textContent = '技術';
  const techValue = documentRef.createElement('div');
  techValue.className = 'v';
  const tags = documentRef.createElement('div');
  tags.className = 'tags';
  appendTagList(documentRef, tags, flattenTech(project.tech));
  techValue.appendChild(tags);
  kv.appendChild(techKey);
  kv.appendChild(techValue);
  article.appendChild(kv);

  appendListSection(documentRef, article, '主要機能', project.main_function ?? []);

  return article;
}

function fillProjectsSection(doc: Document, data: ResumeData) {
  const projectsSection = doc.querySelector('#projects');
  if (!projectsSection) {
    return;
  }

  const projectArticles = data.projects.map((project) => createPersonalProjectArticle(doc, project));
  projectsSection.querySelectorAll('.job').forEach((item) => item.remove());
  projectsSection.append(...projectArticles);
}

function fillPrSection(doc: Document, data: ResumeData) {
  const prSectionCard = doc.querySelector('#pr .card');
  if (!prSectionCard) {
    return;
  }

  const blocks = splitParagraphs(data.selfPrMarkdown);
  const nodes = blocks.map((block) => {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const isBulletBlock = lines.length > 0 && lines.every((line) => line.startsWith('・'));

    if (isBulletBlock) {
      const list = doc.createElement('ul');
      list.className = 'list';
      lines.forEach((line) => {
        const li = doc.createElement('li');
        li.textContent = line.replace(/^・\s*/, '').trim();
        list.appendChild(li);
      });
      return list;
    }

    const p = doc.createElement('p');
    p.textContent = block;
    p.style.whiteSpace = 'pre-wrap';
    return p;
  });

  prSectionCard.replaceChildren(...nodes);
}

export function buildCareerHtml(template: string, data: ResumeData, form: FormState): string {
  void form;
  const doc = createCareerDocument(template);
  fillHeaderSection(doc, data);
  fillSummarySection(doc, data);
  fillExperienceSection(doc, data);
  fillProjectsSection(doc, data);
  fillPrSection(doc, data);
  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}

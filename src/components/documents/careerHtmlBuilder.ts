import type {FormState, ResumeData} from '@site/src/util/documentGeneratorTypes';
import type {ProjectTech} from '@site/src/util/projectTypes';

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

export function buildCareerHtml(template: string, data: ResumeData, form: FormState): string {
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

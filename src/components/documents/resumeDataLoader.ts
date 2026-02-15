import {load as parseYaml} from 'js-yaml';
import type {HeaderYaml, ResumeData} from '@site/src/util/documentGeneratorTypes';
import type {ExperienceCompany, ExperiencesIndexYaml} from '@site/src/util/experienceTypes';
import type {TimelineItem} from '@site/src/util/historyTypes';
import {parseCertificationsYaml} from '@site/src/util/certificationSchema';
import {parseHeaderYaml} from '@site/src/util/headerSchema';
import {parseHistoryYaml} from '@site/src/util/historySchema';
import {parseIntroYaml} from '@site/src/util/introSchema';
import {parseProjectEntriesRoot, parseProjectEntry} from '@site/src/util/projectSchema';
import {parseExperienceCompany, parseExperienceCompaniesRoot} from '@site/src/util/experienceSchema';

export type ResumeDataLoadErrorCode = 'NETWORK' | 'DATA_LOAD' | 'TEMPLATE_LOAD' | 'DATA_SCHEMA' | 'UNKNOWN';

export class ResumeDataLoadError extends Error {
  code: ResumeDataLoadErrorCode;
  cause?: unknown;

  constructor(code: ResumeDataLoadErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ResumeDataLoadError';
    this.code = code;
    this.cause = cause;
  }
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

function isTemplatePath(path: string): boolean {
  return path.includes('/templates/');
}

async function fetchText(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new ResumeDataLoadError(
        isTemplatePath(path) ? 'TEMPLATE_LOAD' : 'DATA_LOAD',
        `Failed to fetch: ${path} (${response.status})`,
      );
    }

    return response.text();
  } catch (error) {
    if (error instanceof ResumeDataLoadError) {
      throw error;
    }
    throw new ResumeDataLoadError('NETWORK', `Network error while fetching: ${path}`, error);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isExperiencesIndexYaml(value: unknown): value is ExperiencesIndexYaml {
  try {
    parseExperienceCompaniesRoot(value, {source: '/data/experiences/index.yml'});
    return true;
  } catch {
    return false;
  }
}

function toTimelineItems(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is TimelineItem => isRecord(item));
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

export async function loadResumeData(baseUrl: string): Promise<{data: ResumeData; templates: {resume: string; career: string}}> {
  try {
    const [introText, historyText, certificationsText, headerText, selfPrText, resumeTemplate, careerTemplate] =
      await Promise.all([
        fetchText(`${baseUrl}/data/intro.yml`),
        fetchText(`${baseUrl}/data/history.yml`),
        fetchText(`${baseUrl}/data/certifications.yml`),
        fetchText(`${baseUrl}/data/header.yml`),
        fetchText(`${baseUrl}/data/selfPR.md`),
        fetchText(`${baseUrl}/templates/resume.html`),
        fetchText(`${baseUrl}/templates/career-history.html`),
      ]);

    let introParsed;
    let historyParsed;
    let certificationsParsed;
    let projectsParsed;
    let headerParsed: HeaderYaml;

    try {
      const introParsedRaw = parseYaml(introText);
      const historyParsedRaw = parseYaml(historyText);
      const certificationsParsedRaw = parseYaml(certificationsText);
      const headerParsedRaw = parseYaml(headerText);

      introParsed = parseIntroYaml(introParsedRaw, {source: '/data/intro.yml'});
      historyParsed = parseHistoryYaml(historyParsedRaw, {source: '/data/history.yml'});
      certificationsParsed = parseCertificationsYaml(certificationsParsedRaw, {source: '/data/certifications.yml'});
      headerParsed = parseHeaderYaml(headerParsedRaw, {source: '/data/header.yml'});
    } catch (error) {
      throw new ResumeDataLoadError('DATA_SCHEMA', 'Invalid YAML schema in data files', error);
    }

    try {
      const projectsIndexText = await fetchText(`${baseUrl}/data/projects/index.yml`);
      const projectsIndexParsedRaw = parseYaml(projectsIndexText);
      const parsedRoot = parseProjectEntriesRoot(projectsIndexParsedRaw, {source: '/data/projects/index.yml'});
      projectsParsed =
        parsedRoot.kind === 'inline'
          ? {projects: parsedRoot.projects}
          : {
              projects: await Promise.all(
                parsedRoot.refs.map(async (ref) => {
                  const raw = await fetchText(`${baseUrl}${ref.file}`);
                  const parsed = parseYaml(raw);
                  return parseProjectEntry(parsed, {source: ref.file});
                }),
              ),
            };
    } catch (error) {
      if (error instanceof ResumeDataLoadError) {
        throw error;
      }
      throw new ResumeDataLoadError('DATA_SCHEMA', 'Invalid YAML schema in projects files', error);
    }

    const experiencesIndexText = await fetchText(`${baseUrl}/data/experiences/index.yml`);
    let experienceCompanies: ExperienceCompany[] = [];
    try {
      const experiencesIndexParsedRaw = parseYaml(experiencesIndexText);
      const experiencesIndexParsed = isExperiencesIndexYaml(experiencesIndexParsedRaw) ? experiencesIndexParsedRaw : null;
      const parsedRoot = parseExperienceCompaniesRoot(experiencesIndexParsed, {source: '/data/experiences/index.yml'});
      experienceCompanies =
        parsedRoot.kind === 'inline'
          ? parsedRoot.companies
          : await Promise.all(
              parsedRoot.refs.map(async (ref) => {
                const raw = await fetchText(`${baseUrl}${ref.file}`);
                const parsed = parseYaml(raw);
                return parseExperienceCompany(parsed, {source: ref.file});
              }),
            );
    } catch (error) {
      throw new ResumeDataLoadError('DATA_SCHEMA', 'Invalid YAML schema in experiences files', error);
    }

    const abstractPath = experienceCompanies.find((company) => company?.name)?.abstract_mdFilePath;
    const abstractMarkdown = abstractPath ? await fetchText(`${baseUrl}${abstractPath}`) : '';

    const baseInfo = introParsed.intro.base_info?.[0] ?? {};
    const skillsNode = introParsed.intro.skills;
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
        email: normalizeText(introParsed.intro.email),
        timeline: toTimelineItems(historyParsed.timeline),
        certifications: certificationsParsed.certifications,
        selfPrMarkdown: selfPrText,
        coreStrengths: toStringArray(introParsed.intro.core_strengths),
        curiousFields: toStringArray(introParsed.intro.curious_fields),
        skillsWorkExperience: workExperience,
        skillsPersonalProjects: personalProjects,
        skillsLearningInProgress: learningInProgress,
        githubUrl: loadLinkByKey(headerParsed, 'github'),
        portfolioUrlFromData: portfolioUrl,
        projects: projectsParsed.projects,
        experiences: experienceCompanies,
        experienceAbstract: abstractMarkdown,
      },
      templates: {
        resume: resumeTemplate,
        career: careerTemplate,
      },
    };
  } catch (error) {
    if (error instanceof ResumeDataLoadError) {
      throw error;
    }
    throw new ResumeDataLoadError('UNKNOWN', 'Unexpected error while loading resume data', error);
  }
}

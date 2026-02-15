import {load as parseYaml} from 'js-yaml';
import type {HeaderYaml, ResumeData} from '@site/src/util/documentGeneratorTypes';
import type {Certification, CertificationsYaml} from '@site/src/util/certificationTypes';
import type {ExperienceCompany, ExperiencesIndexYaml} from '@site/src/util/experienceTypes';
import type {TimelineItem, HistoryYaml} from '@site/src/util/historyTypes';
import type {IntroYaml} from '@site/src/util/introTypes';
import type {ProjectEntry, ProjectsYaml} from '@site/src/util/projectTypes';

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${path} (${response.status})`);
  }

  return response.text();
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

export async function loadResumeData(baseUrl: string): Promise<{data: ResumeData; templates: {resume: string; career: string}}> {
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

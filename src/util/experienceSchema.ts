import type {ExperienceCompany, ExperienceProject, ExperienceTech} from './experienceTypes';

type ValidationContext = {
  source: string;
};

type IndexedCompanyRef = {
  file: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function optionalString(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!isString(value)) {
    throw new Error(`${path} must be a string`);
  }
  return value;
}

function requiredString(value: unknown, path: string): string {
  if (!isString(value) || value.trim() === '') {
    throw new Error(`${path} is required and must be a non-empty string`);
  }
  return value;
}

function optionalStringArray(value: unknown, path: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!isStringArray(value)) {
    throw new Error(`${path} must be string[]`);
  }
  return value;
}

function parseExperienceTech(value: unknown, path: string): ExperienceTech {
  if (value === undefined || value === null) {
    return {os: [], lang: [], infra: []};
  }
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  return {
    os: optionalStringArray(value.os, `${path}.os`),
    lang: optionalStringArray(value.lang, `${path}.lang`),
    infra: optionalStringArray(value.infra, `${path}.infra`),
  };
}

function parseExperienceProject(value: unknown, path: string): ExperienceProject {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }

  return {
    id: requiredString(value.id, `${path}.id`),
    title: requiredString(value.title, `${path}.title`),
    member: optionalString(value.member, `${path}.member`),
    slug: optionalString(value.slug, `${path}.slug`),
    summary: optionalString(value.summary, `${path}.summary`),
    result: optionalString(value.result, `${path}.result`),
    role: optionalStringArray(value.role, `${path}.role`),
    tech: parseExperienceTech(value.tech, `${path}.tech`),
    effort: optionalStringArray(value.effort, `${path}.effort`),
    issue_solving: optionalStringArray(value.issue_solving, `${path}.issue_solving`),
    detail_markdown_path: optionalString(value.detail_markdown_path, `${path}.detail_markdown_path`),
  };
}

export function parseExperienceCompany(value: unknown, context: ValidationContext): ExperienceCompany {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] company must be an object`);
  }

  const projectsRaw = value.projects;
  if (!Array.isArray(projectsRaw)) {
    throw new Error(`[${context.source}] projects is required and must be an array`);
  }

  const projects = projectsRaw.map((project, index) =>
    parseExperienceProject(project, `[${context.source}] projects[${index}]`),
  );

  return {
    abstract_mdFilePath: optionalString(value.abstract_mdFilePath, `[${context.source}] abstract_mdFilePath`),
    id: requiredString(value.id, `[${context.source}] id`),
    name: requiredString(value.name, `[${context.source}] name`),
    slug: requiredString(value.slug, `[${context.source}] slug`),
    period: optionalString(value.period, `[${context.source}] period`),
    projects,
  };
}

export function parseExperienceCompaniesRoot(
  value: unknown,
  context: ValidationContext,
): {kind: 'inline'; companies: ExperienceCompany[]} | {kind: 'refs'; refs: IndexedCompanyRef[]} {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] root must be an object`);
  }
  if (!Array.isArray(value.companies)) {
    throw new Error(`[${context.source}] companies is required and must be an array`);
  }

  const companiesRaw = value.companies;
  if (companiesRaw.length === 0) {
    return {kind: 'inline', companies: []};
  }

  const hasFileRef = companiesRaw.some((item) => isRecord(item) && isString(item.file));
  if (hasFileRef) {
    const refs = companiesRaw.map((item, index) => {
      if (!isRecord(item) || !isString(item.file) || item.file.trim() === '') {
        throw new Error(`[${context.source}] companies[${index}].file must be a non-empty string`);
      }
      return {file: item.file};
    });
    return {kind: 'refs', refs};
  }

  const companies = companiesRaw.map((item, index) =>
    parseExperienceCompany(item, {source: `${context.source} companies[${index}]`}),
  );
  return {kind: 'inline', companies};
}

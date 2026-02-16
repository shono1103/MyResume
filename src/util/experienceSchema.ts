import type {
  ExperienceCompany,
  ExperienceProject,
  ExperienceTech,
  IndexedExperienceCompanyRef,
  IndexedExperienceProjectRef,
} from './experienceTypes';

type ValidationContext = {
  source: string;
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

function optionalStringList(value: unknown, path: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (isString(value)) {
    return value.trim() === '' ? [] : [value];
  }
  if (isStringArray(value)) {
    return value;
  }
  throw new Error(`${path} must be string or string[]`);
}

function validateRefFile(value: string, path: string): string {
  const file = value.trim();
  if (file === '') {
    throw new Error(`${path} must be a non-empty string`);
  }
  // "/" is treated as the static root (web root), not filesystem absolute path.
  if (!file.startsWith('/')) {
    throw new Error(`${path} must start with "/" (static root-relative path)`);
  }
  if (!file.endsWith('.yml') && !file.endsWith('.yaml')) {
    throw new Error(`${path} must end with .yml or .yaml`);
  }
  if (file.includes('..')) {
    throw new Error(`${path} must not contain ".."`);
  }
  if (file.includes('//')) {
    throw new Error(`${path} must not contain "//"`);
  }
  if (file.includes('\\')) {
    throw new Error(`${path} must not contain "\\"`);
  }
  return file;
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

export function parseExperienceProject(value: unknown, context: ValidationContext): ExperienceProject {
  const path = `[${context.source}]`;
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }

  return {
    id: requiredString(value.id, `${path}.id`),
    title: requiredString(value.title, `${path}.title`),
    member: optionalString(value.member, `${path}.member`),
    slug: optionalString(value.slug, `${path}.slug`),
    summary: optionalString(value.summary, `${path}.summary`),
    result: optionalStringList(value.result, `${path}.result`),
    role: optionalStringArray(value.role, `${path}.role`),
    tech: parseExperienceTech(value.tech, `${path}.tech`),
    effort: optionalStringArray(value.effort, `${path}.effort`),
    detail_markdown_path: optionalString(value.detail_markdown_path, `${path}.detail_markdown_path`),
  };
}

export function parseExperienceProjectsRoot(
  value: unknown,
  context: ValidationContext,
): {kind: 'inline'; projects: ExperienceProject[]} | {kind: 'refs'; refs: IndexedExperienceProjectRef[]} {
  const path = `[${context.source}] projects`;
  if (!Array.isArray(value)) {
    throw new Error(`${path} is required and must be an array`);
  }
  if (value.length === 0) {
    return {kind: 'inline', projects: []};
  }

  const fileRefFlags = value.map((item) => isRecord(item) && isString(item.file));
  const hasFileRef = fileRefFlags.some(Boolean);
  const hasInlineEntry = fileRefFlags.some((flag) => !flag);

  if (hasFileRef && hasInlineEntry) {
    throw new Error(`${path} must be either all file refs or all inline entries; mixed format is not allowed`);
  }

  if (hasFileRef) {
    const refs = value.map((item, index) => {
      if (!isRecord(item) || !isString(item.file)) {
        throw new Error(`${path}[${index}].file must be a string`);
      }
      return {file: validateRefFile(item.file, `${path}[${index}].file`)};
    });
    return {kind: 'refs', refs};
  }

  const projects = value.map((project, index) =>
    parseExperienceProject(project, {source: `${context.source} projects[${index}]`}),
  );
  return {kind: 'inline', projects};
}

export function parseExperienceCompanyRoot(
  value: unknown,
  context: ValidationContext,
):
  | {kind: 'inline'; company: ExperienceCompany}
  | {kind: 'refs'; company: Omit<ExperienceCompany, 'projects'>; refs: IndexedExperienceProjectRef[]} {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] company must be an object`);
  }

  const parsedProjects = parseExperienceProjectsRoot(value.projects, context);
  const baseCompany = {
    abstract_mdFilePath: optionalString(value.abstract_mdFilePath, `[${context.source}] abstract_mdFilePath`),
    id: requiredString(value.id, `[${context.source}] id`),
    name: requiredString(value.name, `[${context.source}] name`),
    slug: requiredString(value.slug, `[${context.source}] slug`),
    period: optionalString(value.period, `[${context.source}] period`),
  };

  if (parsedProjects.kind === 'refs') {
    return {kind: 'refs', company: baseCompany, refs: parsedProjects.refs};
  }

  return {
    kind: 'inline',
    company: {
      ...baseCompany,
      projects: parsedProjects.projects,
    },
  };
}

export function parseExperienceCompany(value: unknown, context: ValidationContext): ExperienceCompany {
  const parsed = parseExperienceCompanyRoot(value, context);
  if (parsed.kind === 'refs') {
    throw new Error(`[${context.source}] projects file refs are not supported in parseExperienceCompany`);
  }
  return parsed.company;
}

export function parseExperienceCompaniesRoot(
  value: unknown,
  context: ValidationContext,
): {kind: 'inline'; companies: ExperienceCompany[]} | {kind: 'refs'; refs: IndexedExperienceCompanyRef[]} {
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

  const fileRefFlags = companiesRaw.map((item) => isRecord(item) && isString(item.file));
  const hasFileRef = fileRefFlags.some(Boolean);
  const hasInlineEntry = fileRefFlags.some((flag) => !flag);

  if (hasFileRef && hasInlineEntry) {
    throw new Error(
      `[${context.source}] companies must be either all file refs or all inline entries; mixed format is not allowed`,
    );
  }

  if (hasFileRef) {
    const refs = companiesRaw.map((item, index) => {
      if (!isRecord(item) || !isString(item.file)) {
        throw new Error(`[${context.source}] companies[${index}].file must be a string`);
      }
      return {file: validateRefFile(item.file, `[${context.source}] companies[${index}].file`)};
    });
    return {kind: 'refs', refs};
  }

  const companies = companiesRaw.map((item, index) =>
    parseExperienceCompany(item, {source: `${context.source} companies[${index}]`}),
  );
  return {kind: 'inline', companies};
}

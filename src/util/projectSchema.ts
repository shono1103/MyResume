import type {ProjectEntry, ProjectTech, ProjectsYamlConfig} from './projectTypes';

type ValidationContext = {
  source: string;
};

type IndexedProjectRef = {
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

function requiredString(value: unknown, path: string): string {
  if (!isString(value) || value.trim() === '') {
    throw new Error(`${path} is required and must be a non-empty string`);
  }
  return value;
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

function optionalStringArray(value: unknown, path: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!isStringArray(value)) {
    throw new Error(`${path} must be string[]`);
  }
  return value;
}

function parseProjectTech(value: unknown, path: string): ProjectTech {
  if (value === undefined || value === null) {
    return {os: [], lang: [], framework: [], infra: []};
  }
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }

  return {
    os: optionalStringArray(value.os, `${path}.os`),
    lang: optionalStringArray(value.lang, `${path}.lang`),
    framework: optionalStringArray(value.framework, `${path}.framework`),
    infra: optionalStringArray(value.infra, `${path}.infra`),
  };
}

export function parseProjectEntry(value: unknown, context: ValidationContext): ProjectEntry {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] project must be an object`);
  }

  const techRaw = value.tech;
  if (techRaw !== undefined && techRaw !== null && !Array.isArray(techRaw)) {
    throw new Error(`[${context.source}] tech must be ProjectTech[]`);
  }

  const techArray = Array.isArray(techRaw) ? techRaw : [];
  const tech = techArray.map((item, index) =>
    parseProjectTech(item, `[${context.source}] tech[${index}]`),
  );

  return {
    id: requiredString(value.id, `[${context.source}] id`),
    name: requiredString(value.name, `[${context.source}] name`),
    repos_url: optionalString(value.repos_url, `[${context.source}] repos_url`),
    abstract: optionalString(value.abstract, `[${context.source}] abstract`),
    tech,
    tech_stack: optionalStringArray(value.tech_stack, `[${context.source}] tech_stack`),
    status: optionalString(value.status, `[${context.source}] status`),
    effort: optionalStringArray(value.effort, `[${context.source}] effort`),
    main_function: optionalStringArray(value.main_function, `[${context.source}] main_function`),
    thumbnail_img_path: optionalString(value.thumbnail_img_path, `[${context.source}] thumbnail_img_path`),
  };
}

export function parseProjectEntriesRoot(
  value: unknown,
  context: ValidationContext,
): {kind: 'inline'; projects: ProjectEntry[]} | {kind: 'refs'; refs: IndexedProjectRef[]} {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] root must be an object`);
  }
  if (!Array.isArray(value.projects)) {
    throw new Error(`[${context.source}] projects is required and must be an array`);
  }

  const projectsRaw = value.projects;
  if (projectsRaw.length === 0) {
    return {kind: 'inline', projects: []};
  }

  const hasFileRef = projectsRaw.some((item) => isRecord(item) && isString(item.file));
  if (hasFileRef) {
    const refs = projectsRaw.map((item, index) => {
      if (!isRecord(item) || !isString(item.file) || item.file.trim() === '') {
        throw new Error(`[${context.source}] projects[${index}].file must be a non-empty string`);
      }
      return {file: item.file};
    });
    return {kind: 'refs', refs};
  }

  const projects = projectsRaw.map((item, index) =>
    parseProjectEntry(item, {source: `${context.source} projects[${index}]`}),
  );
  return {kind: 'inline', projects};
}

export function parseProjectsYaml(value: unknown, context: ValidationContext): ProjectsYamlConfig {
  const parsedRoot = parseProjectEntriesRoot(value, context);
  if (parsedRoot.kind === 'refs') {
    throw new Error(`[${context.source}] projects file refs are not supported in parseProjectsYaml`);
  }
  return {projects: parsedRoot.projects};
}

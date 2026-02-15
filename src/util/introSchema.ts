import type {IntroBaseInfo, IntroSkills, IntroYamlConfig} from './introTypes';

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

function optionalStringOrDate(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
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

function parseIntroBaseInfo(value: unknown, path: string): IntroBaseInfo {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  return {
    profile_img_path: optionalString(value.profile_img_path, `${path}.profile_img_path`),
    name: optionalString(value.name, `${path}.name`),
    pronounce: optionalString(value.pronounce, `${path}.pronounce`),
    birth: optionalStringOrDate(value.birth, `${path}.birth`),
    from: optionalString(value.from, `${path}.from`),
    gender: optionalString(value.gender, `${path}.gender`),
  };
}

function parseIntroSkills(value: unknown, path: string): IntroSkills {
  if (value === undefined || value === null) {
    return {work_experience: [], personal_projects: [], learning_in_progress: []};
  }
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  return {
    work_experience: optionalStringArray(value.work_experience, `${path}.work_experience`),
    personal_projects: optionalStringArray(value.personal_projects, `${path}.personal_projects`),
    learning_in_progress: optionalStringArray(value.learning_in_progress, `${path}.learning_in_progress`),
  };
}

export function parseIntroYaml(value: unknown, context: ValidationContext): IntroYamlConfig {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] root must be an object`);
  }
  if (!isRecord(value.intro)) {
    throw new Error(`[${context.source}] intro is required and must be an object`);
  }

  const baseInfoRaw = value.intro.base_info;
  const baseInfo =
    baseInfoRaw === undefined || baseInfoRaw === null
      ? []
      : Array.isArray(baseInfoRaw)
        ? baseInfoRaw.map((item, index) => parseIntroBaseInfo(item, `[${context.source}] intro.base_info[${index}]`))
        : (() => {
            throw new Error(`[${context.source}] intro.base_info must be an array`);
          })();

  return {
    intro: {
      base_info: baseInfo,
      email: optionalString(value.intro.email, `[${context.source}] intro.email`),
      motto: optionalString(value.intro.motto, `[${context.source}] intro.motto`),
      hobby: optionalStringArray(value.intro.hobby, `[${context.source}] intro.hobby`),
      skills: parseIntroSkills(value.intro.skills, `[${context.source}] intro.skills`),
      core_strengths: optionalStringArray(value.intro.core_strengths, `[${context.source}] intro.core_strengths`),
      curious_fields: optionalStringArray(value.intro.curious_fields, `[${context.source}] intro.curious_fields`),
      ['self-PR_mdFile_path']: optionalString(value.intro['self-PR_mdFile_path'], `[${context.source}] intro.self-PR_mdFile_path`),
    },
    last_update: optionalString(value.last_update, `[${context.source}] last_update`),
  };
}

import type {HistoryYaml, TimelineItem} from './historyTypes';

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

function optionalScalarString(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (isString(value) || typeof value === 'number') {
    return String(value);
  }
  throw new Error(`${path} must be a string/number/date`);
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

function parseTimelineItem(value: unknown, path: string): TimelineItem {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  const dotVariantRaw = value.dotVariant;
  if (dotVariantRaw !== undefined && dotVariantRaw !== 'filled' && dotVariantRaw !== 'outlined') {
    throw new Error(`${path}.dotVariant must be "filled" or "outlined"`);
  }
  const dotVariant = dotVariantRaw as TimelineItem['dotVariant'];

  return {
    id: optionalString(value.id, `${path}.id`),
    time: optionalScalarString(value.time, `${path}.time`),
    title: optionalString(value.title, `${path}.title`),
    tags: optionalStringArray(value.tags, `${path}.tags`),
    organizationUrl: optionalString(value.organizationUrl, `${path}.organizationUrl`),
    details: optionalStringArray(value.details, `${path}.details`),
    dotColor: optionalString(value.dotColor, `${path}.dotColor`),
    dotVariant,
  };
}

export function parseHistoryYaml(value: unknown, context: ValidationContext): HistoryYaml {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] root must be an object`);
  }

  const timelineRaw = value.timeline;
  if (timelineRaw === undefined || timelineRaw === null) {
    return {timeline: []};
  }
  if (!Array.isArray(timelineRaw)) {
    throw new Error(`[${context.source}] timeline must be an array`);
  }

  return {
    timeline: timelineRaw.map((item, index) => parseTimelineItem(item, `[${context.source}] timeline[${index}]`)),
  };
}

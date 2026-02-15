import type {HeaderYaml} from './documentGeneratorTypes';

type ValidationContext = {
  source: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function parseLinkItem(value: unknown, path: string): {link?: string} {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  const link = value.link;
  if (link !== undefined && !isString(link)) {
    throw new Error(`${path}.link must be a string`);
  }
  const normalizedLink = isString(link) ? link : undefined;
  return {link: normalizedLink};
}

function parseLinkBlock(value: unknown, path: string): Record<string, Array<{link?: string}>> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    throw new Error(`${path} must contain at least one key`);
  }

  const normalized: Record<string, Array<{link?: string}>> = {};
  entries.forEach(([key, rawItems]) => {
    if (!Array.isArray(rawItems)) {
      throw new Error(`${path}.${key} must be an array`);
    }
    normalized[key] = rawItems.map((item, index) => parseLinkItem(item, `${path}.${key}[${index}]`));
  });
  return normalized;
}

export function parseHeaderYaml(value: unknown, context: ValidationContext): HeaderYaml {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] root must be an object`);
  }
  const linksRaw = value.links;
  if (linksRaw === undefined || linksRaw === null) {
    return {links: []};
  }
  if (!Array.isArray(linksRaw)) {
    throw new Error(`[${context.source}] links must be an array`);
  }

  return {
    links: linksRaw.map((item, index) => parseLinkBlock(item, `[${context.source}] links[${index}]`)),
  };
}

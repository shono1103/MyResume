import type {Certification, CertificationsYamlConfig} from './certificationTypes';

type ValidationContext = {
  source: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
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

function parseCertification(value: unknown, path: string): Certification {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`);
  }
  return {
    id: optionalString(value.id, `${path}.id`),
    name: optionalString(value.name, `${path}.name`),
    svg_path: optionalString(value.svg_path, `${path}.svg_path`),
    DateOfQualification: optionalString(value.DateOfQualification, `${path}.DateOfQualification`),
  };
}

export function parseCertificationsYaml(value: unknown, context: ValidationContext): CertificationsYamlConfig {
  if (!isRecord(value)) {
    throw new Error(`[${context.source}] root must be an object`);
  }
  if (!Array.isArray(value.certifications)) {
    throw new Error(`[${context.source}] certifications is required and must be an array`);
  }

  return {
    certifications: value.certifications.map((item, index) =>
      parseCertification(item, `[${context.source}] certifications[${index}]`),
    ),
  };
}

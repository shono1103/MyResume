import {load as parseYaml} from 'js-yaml';
import type {ExperienceCompany, ExperiencesYamlConfig} from './experienceTypes';

type IndexedCompanyRef = {
  file: string;
};

type RawConfig = {
  companies?: ExperienceCompany[] | IndexedCompanyRef[];
};

function resolveUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function isCompanyRef(item: unknown): item is IndexedCompanyRef {
  return Boolean(item) && typeof item === 'object' && typeof (item as IndexedCompanyRef).file === 'string';
}

function isExperienceCompany(item: unknown): item is ExperienceCompany {
  return (
    Boolean(item) &&
    typeof item === 'object' &&
    typeof (item as ExperienceCompany).id === 'string' &&
    typeof (item as ExperienceCompany).name === 'string' &&
    typeof (item as ExperienceCompany).slug === 'string' &&
    Array.isArray((item as ExperienceCompany).projects)
  );
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch yaml: ${response.status} (${url})`);
  }
  return response.text();
}

export async function loadExperiencesConfig(configPath: string, baseUrl: string): Promise<ExperiencesYamlConfig> {
  const rootRaw = await fetchText(resolveUrl(baseUrl, configPath));
  const rootParsed = parseYaml(rootRaw) as RawConfig;

  if (!rootParsed || !Array.isArray(rootParsed.companies)) {
    throw new Error('Invalid config format: companies is required');
  }

  const companiesRaw = rootParsed.companies;
  if (companiesRaw.every(isExperienceCompany)) {
    return {companies: companiesRaw};
  }

  if (!companiesRaw.every(isCompanyRef)) {
    throw new Error('Invalid config format: companies must be ExperienceCompany[] or { file }[]');
  }

  const loaded = await Promise.all(
    companiesRaw.map(async (ref) => {
      const companyRaw = await fetchText(resolveUrl(baseUrl, ref.file));
      const companyParsed = parseYaml(companyRaw) as ExperienceCompany;
      if (!isExperienceCompany(companyParsed)) {
        throw new Error(`Invalid company file format: ${ref.file}`);
      }
      return companyParsed;
    }),
  );

  return {companies: loaded};
}

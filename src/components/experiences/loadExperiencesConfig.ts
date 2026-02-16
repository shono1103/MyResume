import {load as parseYaml} from 'js-yaml';
import type {ExperienceCompany, ExperiencesYamlConfig} from '@site/src/util/experienceTypes';
import {
  parseExperienceCompaniesRoot,
  parseExperienceCompanyRoot,
  parseExperienceProject,
} from '@site/src/util/experienceSchema';

function resolveUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
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
  const rootParsed = parseYaml(rootRaw);
  const parsedRoot = parseExperienceCompaniesRoot(rootParsed, {source: configPath});

  if (parsedRoot.kind === 'inline') {
    return {companies: parsedRoot.companies};
  }

  const loaded = await Promise.all(
    parsedRoot.refs.map(async (ref) => {
      const companyRaw = await fetchText(resolveUrl(baseUrl, ref.file));
      const companyParsed = parseYaml(companyRaw);
      const parsedCompany = parseExperienceCompanyRoot(companyParsed, {source: ref.file});
      if (parsedCompany.kind === 'inline') {
        return parsedCompany.company;
      }

      const projects = await Promise.all(
        parsedCompany.refs.map(async (projectRef) => {
          const projectRaw = await fetchText(resolveUrl(baseUrl, projectRef.file));
          const projectParsed = parseYaml(projectRaw);
          return parseExperienceProject(projectParsed, {source: projectRef.file});
        }),
      );

      return {
        ...parsedCompany.company,
        projects,
      };
    }),
  );

  return {companies: loaded};
}

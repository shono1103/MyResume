import {load as parseYaml} from 'js-yaml';
import type {IndexedProjectRef, ProjectEntry, ProjectsYamlConfig} from '@site/src/util/projectTypes';
import {parseProjectEntriesRoot, parseProjectEntry} from '@site/src/util/projectSchema';

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

export async function loadProjectsConfig(configPath: string, baseUrl: string): Promise<ProjectsYamlConfig> {
  const rootRaw = await fetchText(resolveUrl(baseUrl, configPath));
  const rootParsed = parseYaml(rootRaw);
  const parsedRoot = parseProjectEntriesRoot(rootParsed, {source: configPath});

  if (parsedRoot.kind === 'inline') {
    return {projects: parsedRoot.projects};
  }

  const loaded = await Promise.all(
    parsedRoot.refs.map(async (ref: IndexedProjectRef): Promise<ProjectEntry> => {
      const projectRaw = await fetchText(resolveUrl(baseUrl, ref.file));
      const projectParsed = parseYaml(projectRaw);
      return parseProjectEntry(projectParsed, {source: ref.file});
    }),
  );

  return {projects: loaded};
}

export type ExperienceTech = {
  os: string[];
  lang: string[];
  infra: string[];
};

export type ExperienceProject = {
  id: string;
  title: string;
  member?: string;
  slug?: string;
  role: string[];
  tech: ExperienceTech;
  result?: string;
  summary?: string;
  effort: string[];
  issue_solving: string[];
  detail_markdown_path?: string;
};

export type ExperienceCompany = {
  abstract_mdFilePath?: string;
  id: string;
  name: string;
  slug: string;
  period?: string;
  projects: ExperienceProject[];
};

export type ExperiencesIndexYaml = {
  companies: Array<{file: string}>;
};

export type ExperiencesYamlConfig = {
  companies: ExperienceCompany[];
};

export type ExperienceProjectTech = {
  os?: string[];
  lang?: string[];
  infra?: string[];
};

export type ExperienceProject = {
  id: string;
  title: string;
  member?: string;
  slug?: string;
  summary?: string;
  result?: string;
  role?: string[];
  tech?: ExperienceProjectTech;
  effort?: string[];
  issue_solving?: string[];
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

export type ExperiencesYamlConfig = {
  companies: ExperienceCompany[];
};

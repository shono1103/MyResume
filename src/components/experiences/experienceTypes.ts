export type ExperienceProjectTech = {
  os?: string[];
  lang?: string[];
  infra?: string[];
};

export type ExperienceProject = {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  role?: string[];
  tech?: ExperienceProjectTech;
  detail_markdown_path?: string;
};

export type ExperienceCompany = {
  id: string;
  name: string;
  slug: string;
  period?: string;
  projects: ExperienceProject[];
};

export type ExperiencesYamlConfig = {
  companies: ExperienceCompany[];
};

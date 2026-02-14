export type ExperienceTech = {
  os?: string[];
  lang?: string[];
  infra?: string[];
};

export type ExperienceProject = {
  title?: string;
  role?: string[];
  tech?: ExperienceTech;
  result?: string;
  summary?: string;
  effort?: string[];
  issue_solving?: string[];
};

export type ExperienceCompany = {
  abstract_mdFilePath?: string;
  name?: string;
  period?: string;
  projects?: ExperienceProject[];
};

export type ExperiencesIndexYaml = {
  companies?: Array<{file?: string}>;
};

export type ProjectTechGroup = {
  os?: string[];
  lang?: string[];
  framework?: string[];
  infra?: string[];
};

export type ProjectYamlEntry = {
  id: string;
  name: string;
  tech?: ProjectTechGroup[];
  tech_stack?: string[];
  status?: string;
  abstract?: string;
  repos_url?: string;
  effort?: string[];
  main_function?: string[];
  thumbnail_img_path?: string;
};

export type ProjectsYamlConfig = {
  projects: ProjectYamlEntry[];
};

export type ProjectTech = {
  os?: string[];
  lang?: string[];
  framework?: string[];
  infra?: string[];
};

export type ProjectEntry = {
  id?: string;
  name?: string;
  repos_url?: string;
  abstract?: string;
  tech?: ProjectTech[];
  tech_stack?: string[];
  status?: string;
  effort?: string[];
  main_function?: string[];
  thumbnail_img_path?: string;
};

export type ProjectsYaml = {
  projects?: ProjectEntry[];
};

export type ProjectsYamlConfig = {
  projects: ProjectEntry[];
};

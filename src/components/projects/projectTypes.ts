export type ProjectYamlEntry = {
  id: string;
  name: string;
  tech_stack?: string[];
  status?: string;
  abstract?: string;
  repos_url?: string;
  thumbnail_img_path?: string;
};

export type ProjectsYamlConfig = {
  projects: ProjectYamlEntry[];
};

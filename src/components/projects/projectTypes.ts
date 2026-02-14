import type {ProjectEntry, ProjectTech, ProjectsYamlConfig as UtilProjectsYamlConfig} from '@site/src/util/projectTypes';

export type ProjectTechGroup = ProjectTech;

export type ProjectYamlEntry = ProjectEntry & {
  id: string;
  name: string;
};

export type ProjectsYamlConfig = UtilProjectsYamlConfig & {
  projects: ProjectYamlEntry[];
};

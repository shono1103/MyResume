export type IntroBaseInfo = {
  profile_img_path: string;
  name: string;
  birth: string | Date;
  from: string;
};

export type IntroSkills = {
  work_experience: string[];
  personal_projects: string[];
  learning_in_progress: string[];
};

export type IntroData = {
  base_info: IntroBaseInfo[];
  email: string;
  motto: string;
  hobby: string[];
  skills: IntroSkills;
  core_strengths?: string[];
  curious_fields: string[];
  ['self-PR_mdFile_path']?: string;
};

export type IntroYamlConfig = {
  intro: IntroData;
  last_update?: string;
};

export type IntroBaseInfo = {
  profile_img_path: string;
  name: string;
  birth: string | Date;
  from: string;
};

export type IntroSkills = {
  practical: string[];
  hobby: string[];
};

export type IntroData = {
  base_info: IntroBaseInfo[];
  email: string;
  motto: string;
  hobby: string[];
  skills: IntroSkills[];
  curious_fields: string[];
};

export type IntroYamlConfig = {
  intro: IntroData;
  last_update?: string;
};

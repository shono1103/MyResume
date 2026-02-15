import type {
  IntroBaseInfo as UtilIntroBaseInfo,
  IntroData as UtilIntroData,
  IntroSkills,
  IntroYamlConfig as UtilIntroYamlConfig,
} from '@site/src/util/introTypes';

export type IntroBaseInfo = UtilIntroBaseInfo & {
  profile_img_path: string;
  name: string;
  birth: string;
  from: string;
  gender: string;
};

export type IntroData = UtilIntroData & {
  base_info: IntroBaseInfo[];
  email: string;
  motto: string;
  hobby: string[];
  skills: IntroSkills;
  core_strengths?: string[];
  curious_fields: string[];
  ['self-PR_mdFile_path']?: string;
};

export type IntroYamlConfig = UtilIntroYamlConfig & {
  intro: IntroData;
  last_update?: string;
};

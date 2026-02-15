import type {Certification} from './certificationTypes';
import type {ExperienceCompany} from './experienceTypes';
import type {TimelineItem} from './historyTypes';
import type {ProjectEntry} from './projectTypes';

export type ResumeData = {
  name: string;
  pronounce: string;
  birth: string;
  gender: string;
  email: string;
  timeline: TimelineItem[];
  certifications: Certification[];
  selfPrMarkdown: string;
  coreStrengths: string[];
  curiousFields: string[];
  skillsWorkExperience: string[];
  skillsPersonalProjects: string[];
  skillsLearningInProgress: string[];
  githubUrl: string;
  portfolioUrlFromData: string;
  projects: ProjectEntry[];
  experiences: ExperienceCompany[];
  experienceAbstract: string;
};

export type FormState = {
  postalCode: string;
  address: string;
  phone: string;
  motivation: string;
  preference: string;
  photoDataUrl: string;
};

export type Props = {
  autoOpenOnGenerate?: boolean;
  showPreview?: boolean;
  submitLabel?: string;
};

export type HeaderYaml = {
  links?: Array<Record<string, Array<{link?: string}>>>;
};

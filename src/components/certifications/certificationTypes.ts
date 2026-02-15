import type {Certification as UtilCertification, CertificationsYamlConfig as UtilCertificationsYamlConfig} from '@site/src/util/certificationTypes';

export type CertificationEntry = UtilCertification & {
  id: string;
  name: string;
  svg_path: string;
  DateOfQualification: string;
};

export type CertificationsYamlConfig = UtilCertificationsYamlConfig & {
  certifications: CertificationEntry[];
};

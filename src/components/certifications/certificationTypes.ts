export type CertificationEntry = {
  id: string;
  name: string;
  svg_path: string;
  DateOfQualification: string;
};

export type CertificationsYamlConfig = {
  certifications: CertificationEntry[];
};

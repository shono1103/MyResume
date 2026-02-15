export type Certification = {
  id?: string;
  name?: string;
  svg_path?: string;
  DateOfQualification?: string;
};

export type CertificationsYaml = {
  certifications?: Certification[];
};

export type CertificationsYamlConfig = {
  certifications: Certification[];
};

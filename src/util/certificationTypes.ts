export type Certification = {
  id?: string;
  name?: string;
  org_name?: string;
  result_label?: string;
  svg_path?: string;
  DateOfQualification?: string;
};

export type CertificationsYaml = {
  certifications?: Certification[];
};

export type CertificationsYamlConfig = {
  certifications: Certification[];
};

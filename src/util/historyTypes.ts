export type TimelineItem = {
  id?: string;
  time?: string;
  title?: string;
  tags?: string[];
  organizationUrl?: string;
  details?: string[];
  dotColor?: string;
  dotVariant?: 'filled' | 'outlined';
};

export type HistoryYaml = {
  timeline?: TimelineItem[];
};

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'career-timeline',
    'certifications',
    'projects',
    {
      type: 'category',
      label: 'Experiences',
      link: {
        type: 'doc',
        id: 'experiences/index',
      },
      items: [
        'experiences/screen-ict/semiconductor-software/custom-feature',
        'experiences/screen-ict/semiconductor-software/dev-platform-improvement',
      ],
    },
  ],
};

export default sidebars;

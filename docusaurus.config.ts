import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'My Resume',
  tagline: 'IT Engineer Saiki Shono',
  favicon: 'img/shonoshono-favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://shono1103.github.io',
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? '/MyResume/',

  organizationName: 'shono1103',
  projectName: 'MyResume',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/shonoshono.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'My Resume',
      logo: {
        alt: 'My Resume Logo',
        src: 'img/shonoshono.svg',
      },
      items: [],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Home',
              to: '/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/shono1103/MyResume',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Saiki Shono. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

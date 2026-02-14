import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import fs from 'node:fs';
import path from 'node:path';
import {load as parseYaml} from 'js-yaml';

type HeaderLinkRecord = Record<
  string,
  Array<{
    link: string;
    icon_path?: string;
  }>
>;

type HeaderYamlConfig = {
  links?: HeaderLinkRecord[];
};

function resolveIconSrc(iconPath: string, siteBaseUrl: string): string {
  if (/^https?:\/\//.test(iconPath)) {
    return iconPath;
  }

  const normalizedBase = siteBaseUrl.replace(/\/$/, '');
  const normalizedPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
  return `${normalizedBase}${normalizedPath}`;
}

function loadHeaderNavbarItems(siteBaseUrl: string): Array<{type: 'html'; position: 'right'; value: string}> {
  try {
    const yamlPath = path.resolve(process.cwd(), 'static/data/header.yml');
    const raw = fs.readFileSync(yamlPath, 'utf8');
    const parsed = parseYaml(raw) as HeaderYamlConfig;
    const records = parsed?.links ?? [];

    return records.flatMap((record) =>
      Object.entries(record).flatMap(([name, values]) => {
        const item = values?.[0];
        if (!item?.link) {
          return [];
        }

        const iconPath = item.icon_path?.trim() || `/img/header/${name}.svg`;
        const iconSrc = resolveIconSrc(iconPath, siteBaseUrl);
        const label = name.charAt(0).toUpperCase() + name.slice(1);

        return [
          {
            type: 'html' as const,
            position: 'right' as const,
            value: `<a class="header-icon-link" href="${item.link}" target="_blank" rel="noreferrer noopener" aria-label="${label}"><img class="header-icon-image" src="${iconSrc}" alt="${label}" /></a>`,
          },
        ];
      }),
    );
  } catch {
    return [];
  }
}

const siteBaseUrl = process.env.DOCUSAURUS_BASE_URL ?? '/MyResume/';

const config: Config = {
  title: 'My Resume',
  tagline: 'IT Engineer Saiki Shono',
  favicon: 'img/shonoshono-favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://shono1103.github.io',
  baseUrl: siteBaseUrl,

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
      items: [
        {
          type: 'custom-resumeGenerator',
          position: 'right',
          label: '履歴書・職務経歴書生成',
        },
        ...loadHeaderNavbarItems(siteBaseUrl),
      ],
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

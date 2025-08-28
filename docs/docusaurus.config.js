// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenSign™',
  tagline: 'Official OpenSign™ Docs - tutorials, API documentation, self-host help & much more.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.opensignlabs.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<pro jectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't ne ed these.
  organizationName: 'opensignlabs', // Usually your GitHub org/user name.
  projectName: 'opensign', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/opensignlabs/opensign/tree/feat-docs/docs/',
            docItemComponent: "@theme/ApiItem" // derived from docusaurus-theme-openapi-docs
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/feat-docs/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      })
    ],
  ],

  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
        {
          id: "openapi",
          docsPluginId: "default", // e.g. "classic" or the plugin-content-docs id
          config: {
            opensign_v1: {
              // OpenAPI v1
              specPath: "docs/API-docs/v1/opensign.yaml", // your v1 spec file
              outputDir: "docs/API-docs/v1",              // generated mdx + sidebar.js
              sidebarOptions: { groupPathsBy: "tag" },
            },
            opensign_v1_1: {
              // OpenAPI v1.1
              specPath: "docs/API-docs/v1.1/opensign.yaml", // your v1.1 spec file
              outputDir: "docs/API-docs/v1.1",              // generated mdx + sidebar.js
              sidebarOptions: { groupPathsBy: "tag" },
          }
        }
      }
    ]
  ],
  themes: ["docusaurus-theme-openapi-docs"], // exports ApiItem and ApiDemoPanel
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      announcementBar: {
        id: 'support_us',
        content:
          'Help use spread the word - ⭐ OpenSign on <a target="_blank" rel="noopener" href="https://github.com/opensignlabs/opensign">GitHub</a>',
        backgroundColor: '#cae4fa',
        textColor: '#091E42',
        isCloseable: false,
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.png',
      navbar: {
        title: 'OpenSign™',
        logo: {
          alt: 'OpenSign™ Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Help',
          },
          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            position: 'left',
            label: 'APIs',
          },
          {
            type: 'docSidebar',
            sidebarId: 'contributeSidebar',
            position: 'left',
            label: 'Contribute',
          },
          {
            href: 'https://www.opensignlabs.com/plans-pricing',
            label: 'Cloud Pricing',
            position: 'left',
          },
          //{to: '/blog', label: 'Blog', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'selfhostSidebar',
            position: 'left',
            label: 'Self-host',
          },
          {
            href: 'https://github.com/opensignlabs/opensign',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Help',
                to: '/docs/help/intro',
              },
              {
                label: 'APIs',
                to: '/docs/API-docs/v1.1',
              },
              {
                label: 'Contribute',
                to: '/docs/contribute/intro',
              },
              {
                label: 'Self-host',
                to: '/docs/self-host/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.com/invite/xe9TDuyAyj',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/opensign%E2%84%A2/',
              },
              {
                label: 'Twitter',
                href: 'https://www.twitter.com/opensignhq',
              },
              {
                label: 'Facebook',
                href: 'https://www.facebook.com/profile.php?id=61551030403669',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'Official Website',
                href: 'https://www.opensignlabs.com',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/opensignlabs/opensign',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} OpenSign™. <br>The best Open Source DocuSign alternative.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;

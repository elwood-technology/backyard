const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');



module.exports = {
  title: 'Backyard',
  tagline: 'Microservices for everyone!',
  url: 'https://backyard.io',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'backyard-hq',
  projectName: 'backyard',
  themeConfig: {
    navbar: {
      title: 'Docs',
      items: [
        // {
        //   type: 'doc',
        //   docId: 'intro',
        //   position: 'left',
        //   label: 'Intro',
        // },
        // {
        //   type: 'doc',
        //   docId: 'guides',
        //   position: 'left',
        //   label: 'Guides',
        // },
        {
          href: 'https://github.com/backyard-hq/backyard',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [

      ],
      copyright: `Copyright © ${new Date().getFullYear()} Elwood Technology. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {

        docs: {
          id: 'docs',
          path: '../../../docs',
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl:
            'https://github.com/backyard-hq/backyard/edit/master/docs/',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },

      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {

        entryPoints: ['../../context/src/index.ts'],
        tsconfig: '../../tsconfig.json',
        sidebar: {
          categoryLabel: 'Reference',
          position: 0,
          fullNames: true
        },
      },
    ],
  ],
};

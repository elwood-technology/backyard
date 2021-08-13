const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

module.exports = {
  title: 'Backyard',
  tagline: 'Microservices for everyone!',
  url: 'https://backyard.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'elwood-technology',
  projectName: 'backyard',
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'Backyard Logo',
        src: '/logo.svg',
        srcDark: '/logo.svg',
        href: 'https://backyard.io/',
        target: '_self',
      },
      title: 'Backyard',
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        // {
        //   type: 'doc',
        //   docId: 'guides',
        //   position: 'left',
        //   label: 'Guides',
        // },
        {
          href: 'https://github.com/elwood-technology/backyard/discussions',
          label: 'Support',
          position: 'right',
        },
        {
          href: 'https://discord.gg/4cJ6Rbfwyc',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://github.com/elwood-technology/backyard',
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
          path: '../../../docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/elwood-technology/backyard/edit/master/docs/',
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

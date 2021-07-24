const { join } = require('path');

module.exports = {
  darkMode: 'media',
  purge: [
    join(__dirname, '../src/**/*.ts'),
    join(__dirname, '../src/**/*.tsx'),
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@mertasan/tailwindcss-variables'),
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
      colors: {
        canvas: {
          lightest: '#fff',
          light: '#fafafa',
          DEFAULT: '#fff',
          dark: '#3C3C3C',
          darkest: '#222',
        },
      },
    },
  },
};

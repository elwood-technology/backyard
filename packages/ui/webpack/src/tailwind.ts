module.exports = {
  darkMode: 'media',
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

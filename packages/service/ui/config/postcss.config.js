const { join } = require('path');

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')(join(__dirname, './tailwind.config.js')),
    require('autoprefixer'),
  ],
};

import { join, extname } from 'path';

const ext = extname(__filename);

export default {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')(join(__dirname, `./tailwind.${ext}`)),
    require('autoprefixer'),
  ],
};

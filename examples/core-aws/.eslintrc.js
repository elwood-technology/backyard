module.exports = {
  root: true,
  plugins: ['react'],
  extends: ["eslint:recommended"],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  }
};

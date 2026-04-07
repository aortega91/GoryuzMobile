module.exports = {
  root: true,
  extends: [
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
    '@react-native',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off',
  },
};

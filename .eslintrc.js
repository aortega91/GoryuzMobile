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
    // TypeScript default parameter values make this redundant
    'react/require-default-props': 'off',
    // StyleSheet.create at bottom of file is idiomatic in React Native
    '@typescript-eslint/no-use-before-define': ['error', { variables: false, functions: true, classes: true }],
    // airbnb-typescript@18 references rules removed in @typescript-eslint@7+; disable them
    '@typescript-eslint/lines-between-class-members': 'off',
    // Renamed to @typescript-eslint/only-throw-error in v7
    '@typescript-eslint/no-throw-literal': 'off',
    // Redux Toolkit uses Immer — direct state mutation inside reducers is intentional
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
  },
};

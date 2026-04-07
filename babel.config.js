module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@api': './src/api',
          '@assets': './src/assets',
          '@components': './src/components',
          '@features': './src/features',
          '@language': './src/language',
          '@navigation': './src/navigation',
          '@utilities': './src/utilities',
          '@hooks': './src/hooks',
          '@theme': './src/theme',

        },
      },
    ],
  ],
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['nativewind/babel', { mode: 'native' }],
      'react-native-worklets/plugin',
      'react-native-worklets-core/plugin',
    ],
  };
};

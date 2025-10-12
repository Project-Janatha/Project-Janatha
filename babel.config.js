module.exports = (api) => {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    plugins: [
      // NativeWind Babel plugin for className support
      [
        "nativewind/babel",
        {
          "mode": "native"
        }
      ],
      // NOTE: this is only necessary if you are using reanimated for animations
      'react-native-worklets/plugin', 
      'react-native-worklets-core/plugin',
    ],
  }
}

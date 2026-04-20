const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]

config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native/,
]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

config.resolver.extraNodeModules = {
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
  'react-native-web': path.resolve(workspaceRoot, 'node_modules/react-native-web'),
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
}

module.exports = withNativeWind(config, {
  input: './globals.css',
  projectRoot: projectRoot,
})

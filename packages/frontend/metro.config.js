const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

config.resolver.disableHierarchicalLookup = true

// Add blockList to prevent Metro from crawling .git or nested node_modules
config.resolver.blockList = [
  // Exclude the .git folder
  /\.git\/.*/,
  // Exclude nested node_modules to prevent circular references or deep scans
  /.*\/node_modules\/.*\/node_modules\/.*/,
]

module.exports = withNativeWind(config, {
  input: './globals.css',
  projectRoot: projectRoot,
})

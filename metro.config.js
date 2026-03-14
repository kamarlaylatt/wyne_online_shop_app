// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// react-native-paper's "react-native" field points to TypeScript source,
// but Metro 0.83 fails to resolve .tsx files within node_modules source trees.
// Force Metro to use the compiled CommonJS output instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-paper') {
    return {
      filePath: require.resolve('react-native-paper/lib/commonjs/index.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('ttf', 'otf', 'png', 'jpg');

module.exports = withNativeWind(config, { 
  input: "./global.css",
  projectRoot: __dirname,
});

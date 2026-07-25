const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Resolve workspace packages
config.resolver.extraNodeModules = {
  "@ytmusic/shared-types": path.resolve(__dirname, "../packages/shared-types"),
};

module.exports = withNativeWind(config, { input: "./global.css" });

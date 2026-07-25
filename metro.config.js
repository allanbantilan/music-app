const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// youtubei.js (and other modern deps) ship only an `exports` map with no `main`
// field. Metro on SDK 51 ignores `exports` by default, so enable it and pick
// condition names so the native entry wins. `browser` is intentionally omitted:
// it precedes `react-native` in youtubei.js's exports and would otherwise be
// selected first, pulling in the web build.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["react-native", "require", "import"];

module.exports = withNativeWind(config, { input: "./global.css" });

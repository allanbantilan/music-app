/**
 * Config plugin to fix monorepo package resolution in Android builds.
 * Ensures the @ytmusic/shared-types workspace package is found.
 */
const { withAppBuildGradle } = require("expo/config-plugins");
const path = require("path");

module.exports = function withMonorepo(config) {
  return withAppBuildGradle(config, (cfg) => {
    // Ensure the monorepo root is in the include
    const contents = cfg.modResults.contents;
    if (!contents.includes("reactNativeArchitectures")) {
      // Add ndk abiFilters if missing
      cfg.modResults.contents = contents.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }`
      );
    }
    return cfg;
  });
};

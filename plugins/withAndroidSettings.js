const { withSettingsGradle } = require("expo/config-plugins");

module.exports = function withAndroidSettings(config) {
  return withSettingsGradle(config, (cfg) => {
    let src = cfg.modResults.contents;

    // Fix 1: Remove broken includeBuild(null) lines
    src = src.replace(/.*includeBuild\(["']?null["']?\).*\n?/g, "");

    // Fix 2: The apply from: node command sometimes fails on EAS.
    // Wrap it in a try-catch style by checking if the file exists first.
    // Replace the raw execute() call with a safer version.
    src = src.replace(
      /apply from: new File\(\["node".*?execute\(null, rootDir\).*?\), "(.*?)"\)/g,
      (match, gradleFile) => {
        return `try {
  apply from: new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim().replaceAll('\\\\', '/').replace('/react-native/package.json', ''), "${gradleFile}")
} catch (e) {
  logger.warn("Could not apply ${gradleFile}: " + e.message)
}`;
      }
    );

    cfg.modResults.contents = src;
    return cfg;
  });
};

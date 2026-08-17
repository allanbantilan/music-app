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

// With package exports + the "import" condition above, Metro resolves tslib to
// its ESM wrapper (tslib/modules/index.js). In tslib 2.4.0 (pulled in by
// @shopify/flash-list) that wrapper does `_interopRequireDefault(require("../tslib.js")).default.__extends`,
// but the CJS tslib.js sets __esModule with no `default` export, so `.default`
// is undefined -> "Cannot read property '__extends' of undefined" at load. Pin
// tslib to its CJS entry; consumers use `tslib.__extends` directly, which works.
const origResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") {
    return {
      type: "sourceFile",
      filePath: require.resolve("tslib/tslib.js"),
    };
  }
  return (origResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform
  );
};

module.exports = withNativeWind(config, { input: "./global.css" });

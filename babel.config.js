module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-reanimated/plugin MUST be last. Required by reanimated,
    // @gorhom/bottom-sheet, and react-native-draggable-flatlist.
    plugins: ["react-native-reanimated/plugin"],
  };
};

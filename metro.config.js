// Metro bundler config.
// expo-sqlite's web build ships a .wasm file — tell Metro to treat it as an asset
// so `npx expo start --web` can bundle the app (data is still in-memory on web).
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("wasm");

module.exports = config;

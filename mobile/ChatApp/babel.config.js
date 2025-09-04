module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // ← that's it, no plugins needed
  };
};

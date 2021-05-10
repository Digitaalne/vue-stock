module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  setupFiles: [
    "<rootDir>/tests/unit/index.js",
    "<rootDir>/.jest/register-context.js"
  ]
};

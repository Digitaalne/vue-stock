const path = require("path");

const electron = {
  pages: {
    index: {
      entry: "src/main.js",
      target: "electron-renderer"
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
};

const webConfig = {
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "backend.js"
  }
};

module.exports = electron;

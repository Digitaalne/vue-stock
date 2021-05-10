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

module.exports = electron;

var path = require('path');

const electron = {
    pages: {
      index: {
        entry: 'src/main.js',
        target: 'electron-renderer',
      }
    },
    pluginOptions: {
        electronBuilder: {
        nodeIntegration: true
    }
  }
}

 const webConfig = {
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'backend.js',
    },
} 

const tyhi = {pages: {
  index: {
    entry: 'src/main.js',
    target: 'electron-renderer',
  }
}}

module.exports = electron
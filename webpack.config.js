const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/renderer.js',
  target: 'web',
  output: {
    filename: 'renderer.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        type: 'javascript/auto',
      },
    ],
  },
};

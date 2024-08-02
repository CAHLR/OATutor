const webpack = require('webpack');

module.exports = {
  entry: './src/index.js', // Adjust this to your main entry file
  output: {
    filename: 'bundle.js', // Output bundle file
    path: __dirname + '/dist' // Output directory
  },
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "util":  require.resolve("util"),
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false // Prevents Webpack from resolving with the extension
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser', // Needed for some core modules
      Buffer: ['buffer', 'Buffer'] // Needed if using Buffer
    })
  ],
  mode: 'development' // or 'production'
};

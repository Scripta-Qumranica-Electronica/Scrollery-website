const { resolve } = require('path')
const common = require('./webpack.dev.js')
const merge = require('webpack-merge')

const webpack = require('webpack')
const Notify = require('webpack-build-notifier')

module.exports = merge(common, {
  mode: 'development',
  entry: [common.entry, 'webpack-hot-middleware/client'],
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    ignored: /node_modules|dist/
  },
  plugins: [
    // OccurenceOrderPlugin is needed for webpack 1.x only
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // Use NoErrorsPlugin for webpack 1.x
    new webpack.NoEmitOnErrorsPlugin()
  ]
})
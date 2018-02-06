const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

// Not needed for these in karma tests
delete common.entry

module.exports = merge(common, {
  devtool: '#inline-source-map',
  resolve: {
    alias: {
      "@test": resolve(__dirname, 'tests/.utils')
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"testing"'
      }
    })
  ]
})
const { resolve } = require('path')
const merge = require('webpack-merge');
const common = require('./webpack.common.js')

// Not needed for karma tests
delete common.entry
delete common.output

// source maps for pleasant debugging
common.devtool = 'eval-source-map'

module.exports = merge(common, {
  resolve: {
    alias: {
      "@test": resolve(__dirname, 'tests/.utils')
    }
  }
})
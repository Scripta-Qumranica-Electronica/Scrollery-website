const common = require('./webpack.common.js')
const merge = require('webpack-merge')

const UglifyJS = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  watch: false,
  plugins: [
    new UglifyJS()
  ],
  performance: {
    hints: "warning",
    maxAssetSize: 200000,
    maxEntrypointSize: 400000,
  }
})
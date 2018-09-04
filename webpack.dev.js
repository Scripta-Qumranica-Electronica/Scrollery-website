const { resolve } = require('path')
const common = require('./webpack.common.js')
const merge = require('webpack-merge')

const Notify = require('webpack-build-notifier')

module.exports = merge(common, {
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    ignored: /node_modules|dist/
  },
  plugins: [
    new Notify({
      title: 'SQE Webpack Build',
      sound: false
    })
  ]
})
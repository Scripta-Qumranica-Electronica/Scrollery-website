const { resolve } = require('path')
const common = require('./webpack.dev.js')
const merge = require('webpack-merge')

const { HotModuleReplacementPlugin } = require('webpack')
const Notify = require('webpack-build-notifier')

module.exports = merge(common, {
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    ignored: /node_modules|dist/
  },
  plugins: [
    new HotModuleReplacementPlugin(),
  ],

  devServer: {
    index: resolve(__dirname, 'index.html'),
    contentBase: __dirname,
    publicPath: "/dist/",
    port: 9090,
    hot: true,
    overlay: true,
    proxy: {
      "/resources/cgi-bin": {
        target: "http://localhost/~bronson/Spencer/Scrollery-website",
        secure: false
      }
    }
  }
})
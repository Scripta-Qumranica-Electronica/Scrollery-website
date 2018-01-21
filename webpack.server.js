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
    port: 9000,
    hot: true,
    overlay: true,
    proxy: {
      "/resources/cgi-bin": process.env.APP_PORT ?  `http://localhost:${parseInt(process.env.APP_PORT)}` : `http://localhost`
    }
  }
})
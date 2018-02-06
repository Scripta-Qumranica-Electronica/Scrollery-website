const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'src', 'js', 'main.js'),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[name].js",
    publicPath: "dist/",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          scss: [
            'vue-style-loader',
            'css-loader',
            'sass-loader',
            {
              loader: 'sass-resources-loader',
              options: {
                resources: path.resolve(__dirname, 'src/sass/_variables.scss')
              }
            }
          ],
        }
      },
      {
        test: /\.css|\.scss/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        })
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },

  resolve: {
    alias: {
      "vue": 'vue/dist/vue.js',
      "@": path.resolve(__dirname),
      "~": path.resolve(__dirname, "src", "js"),
      "sass": path.resolve(__dirname, "src", "sass"),
      "sass-vars$": path.resolve(__dirname, "src", "sass", "_variables.scss"),
      "legacy": path.resolve(__dirname, "resources", "js")
    }
  },

  target: "web",

  plugins: [
    new CleanWebpackPlugin(),
    new ExtractTextPlugin({
      filename: 'styles.css',
      allChunks: true
    })
  ],
}
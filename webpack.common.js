const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: path.join(__dirname, 'src', 'js', 'main.js'),

  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.[name].js",
    publicPath: "dist/",
  },

  context: __dirname,

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
                resources: path.join(__dirname, 'src/sass/_variables.scss')
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
                sourceMaps: true
              }
            },
            {
              loader: 'resolve-url-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMaps: true
              }
            }
          ]
        })
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: "dist/"
            }  
          }
        ]
      }
    ]
  },

  resolve: {
    alias: {
      "vue": 'vue/dist/vue.js',
      "@": path.join(__dirname),
      "~": path.join(__dirname, "src", "js"),
      "sass": path.join(__dirname, "src", "sass"),
      "sass-vars$": path.join(__dirname, "src", "sass", "_variables.scss"),
      "legacy": path.join(__dirname, "resources", "js")
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
const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, 'resources', 'js', 'index.js'),

  output: {
    // options related to how webpack emits results

    path: path.resolve(__dirname, "dist"), // string
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)

    filename: "bundle.[name].js", // string
    // the filename template for entry chunks

    publicPath: "dist/", // string
    // the url to the output directory resolved relative to the HTML page
  },

  module: {
    // `module.rules` is the same as `module.loaders` in 1.x
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
          loaders: {
            sass: 'vue-style-loader!css-loader!sass-loader',
          }
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
      }
    ]
  },

  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
      "@": path.resolve(__dirname),
      "~": path.resolve(__dirname, "resources", "js")
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
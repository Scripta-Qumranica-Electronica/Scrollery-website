const app = require('./app.js');
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const conf = require('./../webpack.server.js')
const compiler = webpack(conf)

app.use(require('webpack-hot-middleware')(compiler))
const serveWebpack = middleware(compiler, {
  publicPath: '/dist/',
})
app.get(/.*/, (req, res, next) => {
  if (/\/vendors/.test(req.url) || /\/resources/.test(req.url) || /\/node_modules/.test(req.url)) {
    res.sendFile(resolve.apply(null, [__dirname, '..'].concat(req.url.replace(/\?.*$/, '').split('/'))))
  } else {
    serveWebpack(req, res, next)
  }
})

app.listen(process.env.PORT || 9090, () =>
  console.log(`SQE server listening on port ${process.env.PORT || 9090}!`)
)
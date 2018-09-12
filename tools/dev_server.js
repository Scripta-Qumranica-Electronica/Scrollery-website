const app = require('./app.js');
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const proxy = require('http-proxy-middleware')
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

/**
 * These two lines and the 'upgrade' below take care of proxying
 * the websocket.  It seems that in development, socket.io
 * is falling back to long polling, since the connection cannot
 * be upgraded to ws.  I don't know how to fix this, but it does
 * not seem to interfere with development usign socket.io.
 */
const wsProxy = proxy('ws://localhost:6333')
app.use('/socket.io', wsProxy)
    
const server = app.listen(process.env.PORT || 9090, () =>
  console.log(`SQE server listening on port ${process.env.PORT || 9090}!`)
)

server.on('upgrade', wsProxy.upgrade)
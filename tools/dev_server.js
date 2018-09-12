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

// const wsProxy = proxy({
//   target: 'http://localhost:6333', 
//   changeOrigin: true,
//   ws: true,
//   router: {
//     'localhost:3000' : 'http://localhost:6333'
//   }
// })

const wsProxy = proxy('ws://localhost:6333')

app.use('/socket.io', wsProxy)
    
const server = app.listen(process.env.PORT || 9090, () =>
  console.log(`SQE server listening on port ${process.env.PORT || 9090}!`)
)

server.on('upgrade', wsProxy.upgrade)
const { resolve } = require('path')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const conf = require('./webpack.server.js')
const compiler = webpack(conf)
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const url = require('url')
app.use(bodyParser.json({ type: 'application/json' }))

const { exec } = require('child_process')

/**
 * Constants.
 */
var SERVER_SOFTWARE = 'Node/' + process.version
var SERVER_PROTOCOL = 'HTTP/1.1'
var GATEWAY_INTERFACE = 'CGI/1.1'

const perl = (req, res) => {
  const file = resolve.apply(null, [__dirname].concat(req.url.split('/')))

  if (!req.hasOwnProperty('uri')) {
    req.uri = url.parse(req.url)
  }

  var host = (req.headers.host || '').split(':')
  var address = host[0]
  var port = host[1]

  var env = {}

  // These meta-variables below can be overwritten by a
  // user's 'env' object in options
  Object.assign(env, {
    GATEWAY_INTERFACE: GATEWAY_INTERFACE,
    SCRIPT_NAME: file,
    SERVER_NAME: address || 'unknown',
    SERVER_PORT: port || 80,
    SERVER_PROTOCOL: SERVER_PROTOCOL,
    SERVER_SOFTWARE: SERVER_SOFTWARE,
  })

  // The client HTTP request headers are attached to the env as well,
  // in the format: "User-Agent" -> "HTTP_USER_AGENT"
  for (var header in req.headers) {
    var name = 'HTTP_' + header.toUpperCase().replace(/-/g, '_')
    env[name] = req.headers[header]
  }

  // These final environment variables take precedence over user-specified ones.
  env.REQUEST_METHOD = req.method.toUpperCase()
  env.QUERY_STRING = req.uri.query || ''
  env.REMOTE_ADDR = req.connection.remoteAddress
  env.REMOTE_PORT = req.connection.remotePort
  if ('content-length' in req.headers) {
    env.CONTENT_LENGTH = req.headers['content-length']
  }
  if ('content-type' in req.headers) {
    env.CONTENT_TYPE = req.headers['content-type']
  }
  if ('authorization' in req.headers) {
    var auth = req.headers.authorization.split(' ')
    env.AUTH_TYPE = auth[0]
  }

  var stringifiedEnv = []
  for (var k in env) {
    stringifiedEnv.push(`export ${k}="${('' + env[k]).replace(';', ';')}"`)
  }

  const sendErr = msg => res.status(500).send(msg || 'Request Failed')
  exec(
    `${stringifiedEnv.join(' && ')} && carton exec ${file} '${JSON.stringify(req.body)}'`,
    { cwd: file.substring(0, file.lastIndexOf('/')), maxBuffer: Infinity },
    (err, stdout, stderr) => {
      try {
        if (err) {
          console.error(err)
          sendErr(err.message)
        } else if (stderr) {
          console.error(stderr)
          sendErr(stderr)
        } else if (stdout) {
          const payload = stdout.replace(/^[^\{]*/g, '')
          payload ? res.json(JSON.parse(payload)) : res.status(200).send('OK')
        } else {
          res.status(400).send('Request Failed')
        }
      } catch (err) {
        sendErr('Request Failed')
      }
    }
  )
}

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'index.html'))
})

app.use(require('webpack-hot-middleware')(compiler))
const serveWebpack = middleware(compiler, {
  publicPath: '/dist/',
})
app.get(/.*/, (req, res, next) => {
  if (/\/vendors/.test(req.url) || /\/resources/.test(req.url) || /\/node_modules/.test(req.url)) {
    res.sendFile(resolve.apply(null, [__dirname].concat(req.url.replace(/\?.*$/, '').split('/'))))
  } else {
    serveWebpack(req, res, next)
  }
})

app.post(/\.pl/, perl)

app.listen(process.env.PORT || 9090, () =>
  console.log(`SQE server listening on port ${process.env.PORT || 9090}!`)
)

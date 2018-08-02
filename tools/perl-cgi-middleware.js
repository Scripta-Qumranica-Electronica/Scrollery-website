const { resolve } = require('path')
const url = require('url')
const { exec } = require('child_process')

/**
 * Constants.
 */
const SERVER_SOFTWARE = 'Node/' + process.version
const SERVER_PROTOCOL = 'HTTP/1.1'
const GATEWAY_INTERFACE = 'CGI/1.1'

const perl = (req, res) => {
  const file = resolve.apply(null, [__dirname, '..'].concat(req.url.split('/')))

  /**
   * Perl-CGI expects all of the CGI params to be set as environment variables.
   *
   * We'll gather up all of these here and write them into the command
   */

  if (!req.hasOwnProperty('uri')) {
    req.uri = url.parse(req.url)
  }

  const host = (req.headers.host || '').split(':')
  const address = host[0]
  const port = host[1]

  const env = {
    GATEWAY_INTERFACE: GATEWAY_INTERFACE,
    SCRIPT_NAME: file,
    SERVER_NAME: address || 'unknown',
    SERVER_PORT: port || 80,
    SERVER_PROTOCOL: SERVER_PROTOCOL,
    SERVER_SOFTWARE: SERVER_SOFTWARE
  }

  // The client HTTP request headers are attached to the env as well,
  // in the format: "User-Agent" -> "HTTP_USER_AGENT"
  for (const header in req.headers) {
    const name = 'HTTP_' + header.toUpperCase().replace(/-/g, '_')
    env[name] = req.headers[header]
  }
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
    const auth = req.headers.authorization.split(' ')
    env.AUTH_TYPE = auth[0]
  }

  // Stringify together the environment
  const stringifiedEnv = []
  for (const k in env) {
    // coerce the environment value to a string and replace and plain semicolons with escaped versions
    const exported = ('' + env[k]).replace(';', ';')
    stringifiedEnv.push(`export ${k}="${exported}"`)
  }

  const sendErr = msg => res.status(500).send(msg || 'Request Failed')

  // Execute the Perl script as a CGI
  exec(
    // first env variables, followed by carton exec on the file and body as a plain JSON object
    `${stringifiedEnv.join(' && ')} && carton exec ${file} '${JSON.stringify(req.body)}'`,

    // TODO: can the env be placed here?
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
          // attempt to parse response into headers and JSON
          const payload = stdout.replace(/^[^\{]*/g, '')
          payload ? res.json(JSON.parse(payload)) : res.status(200).send('OK')
        } else {
          res.status(400).send('Request Failed')
        }
      } catch (err) {
        console.error({err, stderr, stdout})
        sendErr(stderr || stdout || 'Request Failed')
      }
    }
  )
}

module.exports = perl
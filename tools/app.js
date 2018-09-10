const { resolve } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
var proxy = require('express-http-proxy')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);

// parse JSON bodies 
app.use(bodyParser.json({ type: 'application/json' }))

// the index file
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../index.html'))
})

// handle Perl requests
app.post('/resources/cgi-bin/scrollery-cgi.pl', proxy('http://localhost:9080/resources/cgi-bin/scrollery-cgi.pl'))

// expose the Express app instance
module.exports = app

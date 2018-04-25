const { resolve } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const perl = require('./perl-cgi-middleware.js')


const app = express()

// parse JSON bodies 
app.use(bodyParser.json({ type: 'application/json' }))

// the index file
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../index.html'))
})

// handle Perl requests
app.post(/\.pl/, perl)

// expose the Express app instance
module.exports = app

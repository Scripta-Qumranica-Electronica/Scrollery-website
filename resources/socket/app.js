const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {destroyUpgrade: false})

const PORT = 6333


const loadSocket = (io) => {
  const sockets = require('./sockets.js')
  sockets.sockets(io)
}

loadSocket(io)

http.listen(PORT, function(){
  console.log(new Date())
  console.log(`listening on *:${PORT}`)
})
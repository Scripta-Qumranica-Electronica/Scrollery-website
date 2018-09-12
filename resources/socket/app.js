const app = require('express')()
const http = require('http').Server(app)
const chokidar = require('chokidar')
const io = require('socket.io')(http, {destroyUpgrade: false})

const PORT = 6333

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html')
// })

// io.on('connection', function(socket){
//   console.log('a user connected')
//   socket.on('message', function(msg){
//     console.log(`message: ${msg}`)
//     io.emit('message', `Repeated: ${msg}`);
//   });
// })


const loadSocket = (io) => {
  const sockets = require('./sockets.js')
  sockets.sockets(io)
}

loadSocket(io)

http.listen(PORT, function(){
  console.log(`listening on *:${PORT}`)
})
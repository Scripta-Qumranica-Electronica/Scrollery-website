const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {destroyUpgrade: false})

const PORT = 6333

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', function(socket){
  console.log('a user connected')
  socket.on('message', function(msg){
    console.log(msg)
    io.emit('message', msg);
  });
})

http.listen(PORT, function(){
  console.log(`listening on *:${PORT}`)
})
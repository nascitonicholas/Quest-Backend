const e = require('cors');

const app = require('express')();
const http = require('http').Server(app);
const port = process.env.PORT || 8080;
const frontDomain = 'http://localhost:3000';
const io = require('socket.io')(http, {
  cors: {
    origin: frontDomain,
    methods: ["GET", "POST"]
  }
});

//TESTE - MONTANDO SALAS DE CHAT - PARA 2 USUARIOS/CADA SEM O USO DA API  

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

var rooms = [];

io.on('connection', (socket) => {
  //identificar o id da cnn do socket
  var socketId = socket.id;

  // logicas da salas
  if (rooms.length == 0)
    rooms.push({ p1: socketId })
  else {
    var freeRoom;
    rooms.forEach(e => {
      if (!e.p2) {
        freeRoom = e
        return
      }
    })

    if (!freeRoom)
      rooms.push({ p1: socketId })
    else freeRoom.p2 = socketId
  }

  console.log(rooms)

  // evento
  socket.on('front message', msg => {
    var socketId = socket.id;
    // procurar a sala
    var room;
    rooms.forEach(e => {
      if (e.p1 == socketId || e.p2 == socketId)
      {
        room = e
        console.log(['room', room])
        io.to(room.p1)
          .to(room.p2)
          .emit('back message', msg)

        return
      }
    })
  })

});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


// socketId = socket.id;
//   room.push(socketId);

//   socket.on('front message', msg => {
//     io.of('/').emit('back message', msg);
//   });
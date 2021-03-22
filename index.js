const { ETIMEDOUT } = require('constants');
//const cors = require('cors');
const app = require('express')();
const http = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 8080;
const frontDomain = 'http://localhost:3000';
const io = require('socket.io')(http, {
  cors: {
    origin: frontDomain,
    methods: ["GET", "POST"]
  }
});

const gameStateMachine = require('../models/gameStateMachine')

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


//TESTE: chat
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/src/index.html');
// });

//TODO: mandar para controller 
//TODO: tratar error 
app.post('/create-player', (req, res) => {
  send(postCreatePlayer(req.body));
  res.status(201).end();
});

app.get('/list-rooms', (req, res) => {
  res.send(getRoomsAvailable());
});

app.post('/create-room', (req, res) => {
  res.send(postCreateRoom(req.body));
});

app.post('/join-room', (req, res) => {
  res.send(postJoinRoom(req.body));
});

var rooms = [];
var players = [];

function postCreatePlayer(body) {
  var player = {
    playerId: body.playerId,
    playerName: body.playerName
  }

  players.push(player);

  return ;
}

function getRoomsAvailable() {
  if (!rooms)
    return rooms;

  return rooms.filter(room => {
    return room.maxPlayers > room.players.length;
  });

}

function postCreateRoom(body) {

  var player = players.find(x => x.playerId == body.playerId);
  if(!player){
    return //TODO: retornar erro - jogador nao encontrado 
  }

  if(body.maxPlayers < 2 || body.maxPlayers > 4){
    return //TODO: retornar erro - quantidde de jogadores invalida 
  }

  var room = {
    roomId: "room-" + uuidv4(),
    roomName: roomName,
    players: [player],
    maxPlayers: maxPlayer,
    socketUp: false
  }

  rooms.push(room);
  return room;
}

function postJoinRoom(body) {
  var player = findPlayerById(body.playerId);
  var room = findRoomById(body.roomId);
  
  // TODO: buscar forma de dar um lock no array - single thread
  ----------->continuar daqui
  if (room.maxPlayers > room.players.length)
    room.players.push(player)
  else return 503;

  return room;
}

function findPlayerById(playerId) {
  var player = players.find(x => x.playerId == playerId);
  if(!player){
    return //TODO: retornar erro - jogador nao encontrado 
  }
  return player;
}

function findRoomById(roomId) {
  var room = rooms.find(x => x.roomId == roomId);
  if(!room){
    return //TODO: retornar erro - sala nao encontrada 
  }
  return room;
}


io.on('connection', (socket) => {
 
  socket.on('new-visitor', () => {
    io.to(socket.id).emit('visitor-id', { playerId: socket.id });
  })
 
  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    rooms.find(x => x.socketIn = true);

  })

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  })

});


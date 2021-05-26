const { ETIMEDOUT } = require('constants');
const { mainModule } = require('process');
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
const controller = require('./src/controllers/controller');
let Controller = new controller(app);
const StateMachine = (require('./src/models/stateMachine'))();
const Question = (require('./src/models/question'))();

//TODO: migrar para controller
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

app.post('/create-player', (req, res) => {
  send(postCreatePlayer(req.body));
  res.status(201).end();
});

app.get('/list-rooms', (req, res) => {
  res.send(getRoomsAvailable());
});

app.post('/create-room', (req, res) => {
  res.send(createRoom(req.body));
});

var rooms = [];
var players = [];
const QUESTION_INITIAL_TIMER_VALUE = 10; //ajustar se necessario
const BET_INITIAL_TIMER_VALUE = 5;
const NUMBER_OF_ROUNDS = 5  //Total de rounds por partida - ajustas conforme regra de negocio

function postCreatePlayer(body) {
  var player = {
    playerId: body.playerId,
    playerName: body.playerName,
  }
  players.push(player);
  return player;
}

function getRoomsAvailable() {
  if (!rooms)
    return rooms;

  return rooms.map(room => {
    room.maxPlayers > room.players.length && room.socketUp;
  });
}

function createRoom(body) {
  var player = findPlayerById(body.playerId);

  if(body.maxPlayers < 2 || body.maxPlayers > 4){
    return //TODO: retornar erro - quantidde de jogadores invalida 
  }
  var room = {
    roomId: "room-" + uuidv4(),
    roomName: roomName,
    players: [player],
    maxPlayers: body.maxPlayers,
    socketUp: false
  }
  rooms.push(room);
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

function timer(timerValue) {
  var timer = setInterval(function(){
    
    if(timerValue <= 0){
      clearInterval(timer);
    }
    
    returnTimerValue(timerValue--);
  }, 1000)
}

function returnTimerValue(timerValue) {

  
}


//Eventos Socket
io.on('connection', (socket) => {
 
  socket.on('new-visitor', () => {
    io.to(socket.id).emit('visitor-id', { playerId: socket.id });
  });
 
  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    room.findRoomById(roomId).socketUp = true;
  });

  socket.on('join-room', (roomId) => {
    var player = findPlayerById(socket.id);
    var room = findRoomById(roomId);
      
      // TODO: buscar forma de dar um lock no array - single thread
      if (room != undefined && room.maxPlayers > room.players.length){
        room.players.push(player);
        socket.join(roomId);
      }
      else{
        io.to(socket.id).emit('error', {code: 409, message:'A sala atingiu a quantidade maxima de jogadores'});
      }
  });

  socket.on('start', (roomId) => {
    var room = findRoomById(roomId);
    if(room.players.length >= 2){
      StateMachine.start(room); 
      io.to(roomId).emit('question-categories', Question.getAllCategories());
    
    }else{
      io.to(socket.id).emit('error', {code: 409, message:'A sala não possui a quantidade minima de jogadores para iniciar a partida.'});
    }
  });

  socket.on('new-round', (roomId) => {
    var room = findRoomById(roomId);
    room.players.forEach(player => {
      
      if(player.coins === 0 || room.round > NUMBER_OF_ROUNDS){ 
        io.to(roomId).emit('game-over', room);
      }
      io.to(roomId).emit('ok', room);
    });
  });

  socket.on('new-question', (roomId, categoryId) => {
    StateMachine.setQuestionTimer(QUESTION_INITIAL_TIMER_VALUE);
    var room = findRoomById(roomId);
    room.question = Question.getOne(room, categoryId);
    room.answer = "";

    io.to(roomId).emit('new-question', room);
  });

  socket.on('bet-timer', (roomId) => {
    var couter = BET_INITIAL_TIMER_VALUE; 
    var timer = setInterval(function(){
      if(couter <= 0){
        clearInterval(timer);
      }
      io.to(roomId).emit('timer-running', couter--);
    }, 1000)   
  });

  socket.on('bet', (roomId, bet, upvote) => {
    var room = findRoomById(roomId);
    StateMachine.bet(room, socket.id, bet, upvote);
  });

  socket.on('question-timer', (roomId) => {
    var couter = QUESTION_INITIAL_TIMER_VALUE; 
    var timer = setInterval(function(){
      if(couter <= 0 || StateMachine.answered){//acesso direto ao atributo?
        clearInterval(timer);
      }
      couter--;
      StateMachine.setQuestionTimer(couter);
      io.to(roomId).emit('timer-running', couter);
    }, 1000)
  });

  socket.on('answer', (roomId, questionId, answer, timer) => {
    var room = findRoomById(roomId);
    var question = Question.findById(questionId, room.question.category);
    io.to(roomId).emit('round-results', StateMachine.getResults(room, question, answer))
  });

  socket.on('time-over', (roomId) => {
    var room = findRoomById(roomId, questionId);
    var question = Question.findById(questionId, room.question.category);
    io.to(roomId).emit('round-results', StateMachine.getResults(room, question, 0, QUESTION_INITIAL_TIMER_VALUE))
  });

})

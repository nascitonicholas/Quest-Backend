const { ETIMEDOUT } = require('constants');
const { mainModule } = require('process');
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

var cors = require('cors')

app.use(cors())

var bodyParser = require('body-parser')
app.use(bodyParser.json())

const stateMachine = new (require('./src/models/stateMachine'))();
const question = new (require('./src/models/question'))();

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
  question.getAllCategories((err, cat) => {});
  question.getAllQuestionCards((err,cards) => {});
});

app.post('/create-player', (req, res) => {
  console.log(req)
  postCreatePlayer(req.body);
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
const QUESTION_INITIAL_TIMER_VALUE = 10; //ajustar se necessario e converter para time
const BET_INITIAL_TIMER_VALUE = 5;
const NUMBER_OF_ROUNDS = 5  //Total de rounds por partida - ajustas conforme regra de negocio

function postCreatePlayer(body) {
  console.log(body)
  var player = {
    playerId: body.playerId,
    playerName: body.playerName,
  }
  players.push(player);
  console.log('jogador criado com sucesso. ', player)
  return player;
}

function getRoomsAvailable() {
  console.log('salas criadas: ' , rooms);
  if (!rooms)
    return null;

  var avaliableRooms = [];
  rooms.forEach(x =>{
    if(x.maxPlayers > x.players.length && x.socketUp){
      avaliableRooms.push(x);
    }
  })

  return avaliableRooms;
}

function createRoom(body) {
  var request = {
    room: body.roomName,
    playerId: body.playerId,
    maxPlayer: body.maxPlayers
  }

  var player = findPlayerById(body.playerId);

  if (request.maxPlayer < 2 || request.maxPlayer > 4) {
    console.log("quantidade de jogadores invalida");
  }
  var room = {
    roomId: "room-" + uuidv4(),
    roomName: request.room,
    players: [player],
    maxPlayers: request.maxPlayer,
    socketUp: true
  }
  rooms.push(room);

  console.log('Sala criada: ', room);
  return room;
}

function findPlayerById(playerId) {
  var player = players.find(x => x.playerId == playerId);
  if (!player) {
    console.log('jogador nao encontrado');
    return null;//TODO: retornar erro - jogador nao encontrado 
  }
  return player;
}

function findRoomById(roomId) {
  var room = rooms.find(x => x.roomId == roomId);
  if (!room) {
    console.log('sala nao encontrada');
    return //TODO: retornar erro - sala nao encontrada 
  }
  return room;
}

function timer(timerValue) {
  var timer = setInterval(function () {

    if (timerValue <= 0) {
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
    if (room != undefined && room.maxPlayers > room.players.length) {
      room.players.push(player);
      socket.join(roomId);
    }
    else {
      io.to(socket.id).emit('error', { code: 409, message: 'A sala atingiu a quantidade maxima de jogadores' });
    }
  });

  socket.on('start', (roomId) => {
    var room = findRoomById(roomId);
    if (room.players.length >= 2) {
      stateMachine.start(room);
      io.to(roomId).emit('question-categories', question.getAllCategories());

    } else {
      io.to(socket.id).emit('error', { code: 409, message: 'A sala não possui a quantidade minima de jogadores para iniciar a partida.' });
    }
  });
//TODO: alterar fluxo recebendo a categoria vinda do front
  socket.on('new-round', (roomId, categoryId) => {
    var room = findRoomById(roomId);
    room.players.forEach(player => {

      if (player.coins === 0 || room.round > NUMBER_OF_ROUNDS) {
        io.to(roomId).emit('game-over', room);
      }
      io.to(roomId).emit('ok', room);
    });
  });

  socket.on('new-question', (roomId, categoryId) => {
    stateMachine.setQuestionTimer(QUESTION_INITIAL_TIMER_VALUE);
    var room = findRoomById(roomId);
    room.question = question.getOne(room, categoryId);
    room.answer = "";

    io.to(roomId).emit('new-question', room);
  });

  socket.on('bet-timer', (roomId) => {
    var couter = BET_INITIAL_TIMER_VALUE;
    var timer = setInterval(function () {
      if (couter <= 0) {
        clearInterval(timer);
      }
      io.to(roomId).emit('timer-running', couter--);
    }, 1000)
    io.to(roomId).emit('timer-running')//chamar um cronometro e emitir esse evento a cada segundo atualizando o front
  });

  socket.on('bet', (roomId, bet, upvote) => {
    var room = findRoomById(roomId);
    stateMachine.bet(room, socket.id, bet, upvote);
  });

  socket.on('question-timer', (roomId) => {
    var couter = QUESTION_INITIAL_TIMER_VALUE;
    var timer = setInterval(function () {
      if (couter <= 0 || stateMachine.answered) {//acesso direto ao atributo?
        clearInterval(timer);
      }
      couter--;
      stateMachine.setQuestionTimer(couter);
      io.to(roomId).emit('timer-running', couter);
    }, 1000)
    io.to(roomId).emit('timer-running')//chamar um cronometro e emitir esse evento a cada segundo atualizando o front
  });

  socket.on('answer', (roomId, questionId, answer, timer) => {
    var room = findRoomById(roomId);
    var question = question.findById(questionId, room.question.category);
    io.to(roomId).emit('round-results', stateMachine.getResults(room, question, answer, timer))

  });

  socket.on('time-over', (roomId) => {
    var room = findRoomById(roomId, questionId);
    var question = question.findById(questionId, room.question.category);
    io.to(roomId).emit('round-results', stateMachine.getResults(room, question, 0, QUESTION_INITIAL_TIMER_VALUE))
  });

})

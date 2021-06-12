room = {
    roomId: "room-" + uuidv4(),
    roomName: string,
    players: [player],
    maxPlayers: 4,
    socketUp: false,
    stateMachine
},

player = {
    playerId: body.playerId,
    playerName: body.playerName,
    score: 0,
    coins: 25, //TODO: quantidade de posntos de aposta a definir  
    bet: 0,
    upVote: true,
    isPresent: true
  },


stateMachine = {
    actingPlayerId: room.players[0], 
    round: 0,  
    correctAnswer: undefined,    //boolean
    alreadyAsked: []
}
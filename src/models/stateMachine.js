function StateMachine() {
        this.start = (numberOfPlayers, rooms) => {
        console.log(numberOfPlayers, ' + ', rooms)
    }

    this.start = (room) => {
        var stateMachine = {
            actingPlayerId: room.players[0], 
            round: 0,  
            correctAnswer: undefined,    //boolean
            alreadyAsked: []
        }
        room[stateMachine] = stateMachine;
        room.players.forEach((player) => {
            player[score] = 0,
            player[coins] = 25, //TODO: quantidade de posntos de aposta a definir  
            player[bet] = 0,
            player[upVote] = true,
            player[isPresent] = true    //TODO: implementar validacao no socket
        }) 
    }

    this.bet = (room, playerId, bet, upVote) => {
        var player = room.players.find(p => p.playerId == playerId);
        player.coins -= bet;
        player.bet = bet;
        player.upVote = upVote;
    }   

    this.getResults = (room, question, answer, timer, QUESTION_INITIAL_TIMER_VALUE = 0) => {
        room.correctAnswer = (question.correctAnswer == answer);
        room.round ++;

        var actingPlayer = room.players.find(p => p.playerId == room.actingPlayerId);
       
        room.players.forEach( player => {
            player.score = updateScore(actingPlayer, player, room.correctAnswer, timer);
        });
  
        actingPlayerIndex = room.players.indexOf(actingPlayer);
        
        if(actingPlayerIndex + 1 === room.players.length){
            room.actingPlayerId = room.players[0];
        } else {
            room.actingPlayerId = room.players[actingPlayerIndex++];
        }
        
        return room;
    }

    this.updateScore = (actingPlayer, player, correctAnswer, timer) => {
        if(player.playerId === actingPlayer.playerId){
            if(correctAnswer){
                return player.score += player.bet + timer;
            }
            return player.score -= (player.bet + QUESTION_INITIAL_TIMER_VALUE);
        }

        if(upVote == correctAnswer){
            return player.score += player.bet;
        }
        return player.score -= player.bet;       
    }

}

module.exports = StateMachine;
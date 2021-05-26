function StateMachine() {
        this.start = (numberOfPlayers, rooms) => {
        console.log(numberOfPlayers, ' + ', rooms)
    }

    this.start = (room) => {
        var stateMachine = {
            actingPlayerId: room.players[0], 
            round: 0,  
            correctAnswer: undefined,    //boolean
            alreadyAsked: [],
            questionTimer: 0,
            answered: false
        }
        room[stateMachine] = stateMachine;
        room.players.forEach((player) => {
            player[score] = 0,
            player[coins] = 25, //quantidade de pontos de aposta a definir  
            player[bet] = 0,
            player[upVote] = true,
            player[isPresent] = true    //implementar validacao no socket
        }) 
    }

    this.setQuestionTimer = (initialTimerValue) => {
        room.questionTimer = initialTimerValue;
    }

    this.bet = (room, playerId, bet, upVote) => {
        var player = room.players.find(p => p.playerId == playerId);
        player.coins -= bet;
        player.bet = bet;
        player.upVote = upVote;
    }   

    this.getResults = (room, question, answer, QUESTION_INITIAL_TIMER_VALUE = 0) => {
        room.answered = true;
        room.correctAnswer = (question.correctAnswer == answer);
        room.round ++;

        var actingPlayer = room.players.find(p => p.playerId == room.actingPlayerId);
       
        room.players.forEach( player => {
            if(answer === 0){
                player.score = updateScore(actingPlayer, player, room.correctAnswer, QUESTION_INITIAL_TIMER_VALUE, answer);
            }else{
                player.score = updateScore(actingPlayer, player, room.correctAnswer, room.timer, answer);
            }
            
        });
  
        actingPlayerIndex = room.players.indexOf(actingPlayer);
        
        if(actingPlayerIndex + 1 === room.players.length){
            room.actingPlayerId = room.players[0];
        } else {
            room.actingPlayerId = room.players[actingPlayerIndex++];
        }
        
        return room;
    }

    this.updateScore = (actingPlayer, player, correctAnswer, stopedTimer, answer) => {
        if(player.playerId === actingPlayer.playerId){
            if(correctAnswer){
                return player.score += player.bet + stopedTimer;
            }
            if(answer === 0){
                return player.score -= (player.bet + stopedTimer)
            }
            return player.score -= player.bet;
        }

        if(upVote == correctAnswer){
            return player.score += player.bet;
        }
        return player.score -= player.bet;       
    }
}

module.exports = StateMachine;
const games = {};

const getGame = (gameId) => {
    return games[gameId];
};

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

const createGame = (gameId, questions) => {
    games[gameId] = {
        currentQuestion: 0,
        score: 0,
        questions,
        milestones: [5000, 100000],
        usedLifelines: {
            "fifty-fifty": false,
            "ask-audience": false,
            "phone-friend": false,
            "double-dip": false,
        },
        doubleDipActivated: false,
        lastReachedMilestone: [0],
        gameOver: false,
    };
    games[gameId].questions.forEach((q) => shuffle(q.options));
};

const updateGameState = (gameId, newGameState) => {
    games[gameId] = newGameState;
};

module.exports = { getGame, createGame, updateGameState };
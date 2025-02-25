const express = require("express");
const router = express.Router();
const { getGame, createGame, updateGameState } = require("../services/gameService");

const prizeValues = [500, 1000, 2000, 3000, 5000, 10000, 15000, 25000, 50000, 100000, 200000, 400000, 800000, 1500000, 3000000];

router.post('/start', (req, res) => {
    const {gameId, questions, milestones} = req.body;
    createGame(gameId, questions, milestones);
    res.json({ message: 'Game started', gameId });
});

router.get('/:gameId', (req, res) => {
    const game = getGame(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
});

router.post('/answer', (req, res) => {
    const { gameId, answer } = req.body;
    const game = getGame(gameId);

    if (!game) return res.status(404).json({ error: 'Game not found' });

    const currentQuestionIndex = game.currentQuestion;
    const correctAnswer = game.questions[currentQuestionIndex].correct;

    if (answer === correctAnswer) {
        game.score = prizeValues[currentQuestionIndex];

        if (game.milestones.includes(game.score)) {
            game.lastReachedMilestone.push(game.score);
        }

        game.currentQuestion++;

        if (game.currentQuestion >= game.questions.length) {
            game.gameOver = true;
            game.score = prizeValues.at(-1);
        }
        if (game.doubleDipActivated) {
            game.doubleDipActivated = false;
        }

        updateGameState(gameId, game);
        return res.json({ correct: true });
    } else if (game.doubleDipActivated) {      
        game.doubleDipActivated = false;
        updateGameState(gameId, game);
        return res.json({ correct: false, doubleDipActivated: true });
    } else {        
        game.gameOver = true;
        game.score = game.lastReachedMilestone.at(-1);
        updateGameState(gameId, game);
        return res.json({ correct: false, finalScore: game.score, doubleDipActivated: false });
    }
});

module.exports = router;
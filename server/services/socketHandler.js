const WebSocket = require("ws");
const {createGame, getGame, updateGameState} = require("./gameService");

const questionValues = [
    0, 500, 1000, 2000, 3000, 5000, 10000, 15000, 25000, 50000,
    100000, 200000, 400000, 800000, 1500000, 3000000,
];

function handleMessage(ws, message) {
    let data;
    try {
        data = JSON.parse(message);        
    } catch (err) {
        console.log("Error parsing message:", err);
        return;
    }

    switch (data.type) {
        case "joinGame": {
            const { gameId, playerId, role, settings, nickname } = data;

            if (role === "host") {               
                createGame(gameId, settings.questions, settings.milestones);  
                const game = getGame(gameId);             
                game.secondsPerQuestion = settings.secondsPerQuestion;
                game.format = settings.format;
                game.players = new Map(); 
                console.log(`Game ${gameId} created by host ${playerId}`);
            }

            ws.gameId = gameId;
            ws.playerId = playerId;
            ws.role = role;

            const game = getGame(gameId);
            if (game) {
                if (role === "player") {
                    game.players.set(playerId, { ws, nickname });                                        
                } else if (role === "host") {
                    game.hostId = playerId;
                    game.hostWs = ws;
                }
                setTimeout(() => {
                    broadcastCurrentPlayers(gameId);
                }, 100);

                broadcastGameState(gameId);
            }
            break;
        }
        case "leaveGame": {
            const { gameId, playerId } = data;
            const game = getGame(gameId);
            if (game && game.players.has(playerId)) {
                game.players.delete(playerId);

                const playerLeftMessage = {
                    type: "playerLeft",
                    playerId,
                };
                broadcastToGame(gameId, playerLeftMessage);
                broadcastGameState(gameId);
            }
            break;
        }
        case "hostLeft": {
            const { gameId, playerId } = data;
            const hostLeftMessage = {
                type: "hostLeft",
                playerId,
            };
            broadcastToGame(gameId, hostLeftMessage);
            updateGameState(gameId, null);
            break;
        }
        case "navigate": {
            const { gameId } = data;
            const game = getGame(gameId);
            if (game) {
                game.players.forEach((info) => {
                    if (info.ws && info.ws.readyState === WebSocket.OPEN) {
                        info.ws.send(
                            JSON.stringify({
                                type: "gameStarted",
                                gameId,
                            })
                        );
                    }
                });
        
                if (game.hostWs && game.hostWs.readyState === WebSocket.OPEN) {
                    setTimeout(() => {
                        game.hostWs.send(
                            JSON.stringify({
                                type: "gameStarted",
                                gameId,
                            })
                        );
                    }, 500); 
                }
            }
            break;
        }
        case "startGame": {
            const { gameId } = data;
            const game = getGame(gameId);
            if (game) {        
                game.question = getNextQuestion(game);
                game.playerAnswers = {};           
                
                updateGameState(gameId, game);
                broadcastGameState(gameId);                
                startServerTimer(gameId, game.secondsPerQuestion);                               
            } else {
                console.log(`startGame: Game not found or invalid host for gameId ${gameId}`);
            }
            break;
        }
        case "playerAnswer": {
            const { gameId, playerId, answer, isDoubleDipActivated } = data;
            const game = getGame(gameId);
            if (game && game.players.has(playerId)) {
                if (isDoubleDipActivated) {
                    const player = game.players.get(playerId);
                    const isCorrect = answer === game.question.correct;
                    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
                        player.ws.send(JSON.stringify({ type: "doubleDipUpdate", isCorrect: isCorrect }));
                    }
                    if (!isCorrect) {
                        return;
                    }
                }
                game.playerAnswers = game.playerAnswers || {};
                game.playerAnswers[playerId] = answer;
                updateGameState(gameId, game);
            }
            break;
        }
        case "gameCanceled": {
            const { gameId } = data;
            const game = getGame(gameId);
            if (game) {
                game.players.forEach((player) => {
                    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
                        player.ws.send(JSON.stringify({ type: "gameCanceled" }));
                    }
                });
            }
            break;
        }        
        case "nextQuestion": {
            const { gameId } = data;
            const game = getGame(gameId);
            if (game) {
                stopServerTimer(gameId);

                const isLastQuestion = game.currentQuestion === game.questions.length - 1;

                if (isLastQuestion) {
                    game.gameOver = true;                    

                    updateGameState(gameId, game);
                    broadcastGameState(gameId);
                    return;
                }

                game.currentQuestion++;
                game.question = getNextQuestion(game);                
                game.score = questionValues[game.currentQuestion];
                game.playerAnswers = {};

                updateGameState(gameId, game);
                broadcastGameState(gameId);
                startServerTimer(gameId, game.secondsPerQuestion);
            }
            break;
        }
        default:
            console.log("Unknown message type:", data.type);
    }
}

function broadcastGameState(gameId) {
    const game = getGame(gameId);
    if (game) {
        const gameState = {
            type: "gameStateUpdate",
            gameId,
            timer: game.secondsPerQuestion,
            currentQuestion: game.question,
            format: game.format,
            milestones: game.milestones,
            score: game.score,
            gameOver: game.gameOver,
            questionIndex: game.currentQuestion,
            leaderboard: getLeaderboard(game),
            spectators: Array.from(game.players.entries())
                .filter(([id, info]) => info.spectator)
                .map(([id, info]) => ({
                    playerId: id,
                    nickname: info.nickname,
                })), 
        };
        
        broadcastToGame(gameId, gameState);
    }
}

function broadcastCurrentPlayers(gameId) {
    const game = getGame(gameId);
    if (game) {
        const currentPlayers = Array.from(game.players.entries()).map(([id, info]) => ({
            playerId: id,
            nickname: info.nickname,
        }));

        broadcastToGame(gameId, {
            type: "currentPlayers",
            players: currentPlayers,            
        });
    }
}

function broadcastToGame(gameId, message) {
    const game = getGame(gameId);
    if (game) {
        game.players.forEach((info) => {
            if (info.ws && info.ws.readyState === WebSocket.OPEN) {
                info.ws.send(JSON.stringify(message));
            }
        });

        if (game.hostWs && game.hostWs.readyState === WebSocket.OPEN) {
            game.hostWs.send(JSON.stringify(message));
        }
    }
}

function getNextQuestion(game) {
    if (game.currentQuestion < game.questions.length) {
        return game.questions[game.currentQuestion];
    }
}

function getLeaderboard(game) {
    return Array.from(game.players.entries())
    .map(([id, info]) => ({
        playerId: id,
        nickname: info.nickname,
        finalScore: info.finalScore || 0,
        score: info.score || 0,
        isSpectator: info.spectator || false,
        answeredQuestions: info.answeredQuestions || 0, 
    }))
    .sort((a, b) => {
        if (b.answeredQuestions !== a.answeredQuestions) {
            return b.answeredQuestions - a.answeredQuestions;
        }
        return b.score - a.score;
    });
}

function startServerTimer(gameId, duration) {
    const game = getGame(gameId);
    if (game) {
        game.timer = duration;

        const timerInterval = setInterval(() => {
            if (game.timer <= 0) {
                clearInterval(timerInterval);
                game.timerInterval = null;

                processPlayerAnswers(gameId); 
                return;
            }

            game.timer -= 1;
            broadcastToGame(gameId, {
                type: "timerUpdate",
                seconds: game.timer,
            });
        }, 1000);

        game.timerInterval = timerInterval; 
    }
}

function stopServerTimer(gameId) {
    const game = getGame(gameId);
    if (game && game.timerInterval) {
        clearInterval(game.timerInterval);
        game.timerInterval = null;
    }
}

function processPlayerAnswers(gameId) {
    const game = getGame(gameId);
    if (game) {        
        const currentQuestionIndex = game.currentQuestion + 1;
        const questionValue = questionValues[currentQuestionIndex] || 0;
        const milestones = game.milestones;

        game.players.forEach((info, id) => {
            if (info.spectator) {
                return;
            }

            const givenAnswer = game.playerAnswers[id];

            if (!givenAnswer) {
                info.spectator = true; 
            } else if (game.question && givenAnswer === game.question.correct) {
                if (milestones.includes(questionValue) || questionValue === 3000000) {
                    info.finalScore = questionValue;                        
                }           
                info.score = questionValue;
                info.answeredQuestions = info.answeredQuestions ? info.answeredQuestions + 1 : 1;   
            } else {
                info.spectator = true; 
            }
        });

        game.playerAnswers = {};
        updateGameState(gameId, game);
        broadcastGameState(gameId);
    }
}

function initSocketServer(wss) {
    wss.on("connection", (ws) => {
        ws.server = wss;

        ws.on("message", (message) => {
            handleMessage(ws, message);
        });

        ws.on("close", () => {
            const { gameId, playerId, role } = ws;
            const game = getGame(gameId);
            if (game) {
                if (role === "player") {
                    game.players.delete(playerId);
                    broadcastCurrentPlayers(gameId);
                } else if (role === "host") {
                    updateGameState(gameId, null);
                    broadcastToGame(gameId, { type : "hostLeft"});
                }
            }
        });
    });
}

module.exports = { initSocketServer };
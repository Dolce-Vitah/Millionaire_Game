import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SocketService from "../services/socketService";
import "../assets/MultiplayerGameScreen.css";
import "../assets/HostGameScreen.css";
import "./ScoreBoard";
import ScoreBoard from "./ScoreBoard";
import { playBackgroundMusic, stopBackgroundMusic, playStartTune } from "../services/musicManagerService";

const HostGameScreen = () => {
    const location = useLocation();
    const { gameId } = location.state || {};
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [milestones, setMilestones] = useState([]);
    const [timer, setTimer] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameOverMessage, setGameOverMessage] = useState(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(true);
    const hasGameStarted = useRef(false);
    const navigate = useNavigate();

    const navigateToFinalLeaderboard = useCallback(() => {
        SocketService.sendMessage({
            type: "gameCanceled",
            gameId,
        });
    
        navigate("/finalLeaderboard", { state: { leaderboard } });
    }, [navigate, leaderboard, gameId]);

    useEffect(() => {
        if (gameId && !hasGameStarted.current) {
            SocketService.sendMessage({
                type: "startGame",
                gameId,
            });
            hasGameStarted.current = true;
            playStartTune();
            setTimeout(() => {
                playBackgroundMusic("easy", 0);
            }, 2000);
        }
    }, [gameId])

    useEffect(() => {
        const handleTimerUpdate = (data) => {
            const { seconds } = data;
            setTimer(seconds);
        };

        const handleGameUpdate = (data) => {
            console.log("Received game update:", data);
            if (data.currentQuestion) {
                setCurrentQuestion(data.currentQuestion);
                setLeaderboard(data.leaderboard);
                setScore(data.score);
                setMilestones(data.milestones); 

                if (data.gameOver) {
                    setGameOverMessage("Игра окончена. Перейдём к итоговой таблице лидеров.");
                    setTimeout(() => {
                        stopBackgroundMusic();
                        navigateToFinalLeaderboard();
                    }, 6000);
                }

                const activePlayers = data.leaderboard.filter((player) => !player.isSpectator);
                if (activePlayers.length === 0) {
                    setGameOverMessage("Все игроки стали зрителями. Игра завершена. Перейдём к итоговой таблице лидеров.");
                    setTimeout(() => {
                        stopBackgroundMusic();
                        navigateToFinalLeaderboard();
                    }, 6000);
                }
            }
        };

        SocketService.on("timerUpdate", handleTimerUpdate);
        SocketService.on("gameStateUpdate", handleGameUpdate);

        return () => {
            SocketService.off("timerUpdate", handleTimerUpdate);
            SocketService.off("gameStateUpdate", handleGameUpdate);
        };
    }, [navigateToFinalLeaderboard]);

    const handleNextQuestion = () => {
        SocketService.sendMessage({ type: "nextQuestion", gameId });
    };

    const handlePauseMusic = () => {
        if (isMusicPlaying) {
            stopBackgroundMusic();            
        } else {
            playBackgroundMusic("easy", 0);  
        }
        setIsMusicPlaying(!isMusicPlaying);
    };    

    return (
        <div className="multiplayer-game-screen">
            <div className="fade-from-black-overlay"></div>
            <div className="spotlight-left"></div>
            <div className="spotlight-right"></div>
            <ScoreBoard score={score} milestones={milestones} isMultiplayer={true}/>
            {gameOverMessage && (
                <div className="game-over-message">
                    <p>{gameOverMessage}</p>
                </div>
            )}
            {currentQuestion ? (
                <div className="multiplayer-question-container">
                    <div className="multiplayer-question">{currentQuestion.question}</div>
                    <div className="multiplayer-options">
                        {currentQuestion.options.map((option, index) => (
                            <button key={index} className={option === currentQuestion.correct ? "correct-answer" : ""}>
                                {String.fromCharCode(65 + index) + ": " + option}
                            </button>
                        ))}
                    </div>
                    <div className="timer">
                        <div className="timer-value">{timer}</div>
                    </div>
                    <div className="host-buttons-container">
                        <button onClick={handlePauseMusic}>
                            {isMusicPlaying ? "Пауза музыки" : "Возобновить музыку"}
                        </button>
                        <button onClick={handleNextQuestion}>Следующий вопрос</button>
                        <button onClick={navigateToFinalLeaderboard}>Завершить игру</button>
                    </div>
                </div>
            ) : (
                <p>Ожидание начала игры...</p>
            )}
            <div className="leaderboard-container">
                <ul className="leaderboard">
                    {leaderboard.map((player, index) => (
                        <li key={index} className={`${player.isSpectator ? "spectator" : ""} ${index === 0 ? "leader" : ""}`}>
                            <span className="player-nickname">{player.nickname}</span>
                            <span className="player-score">{player.score}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HostGameScreen;
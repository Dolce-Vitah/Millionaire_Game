import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SocketService from "../services/socketService";
import "../assets/MultiplayerGameScreen.css";
import "../assets/PlayerGameScreen.css";
import "./ScoreBoard";
import ScoreBoard from "./ScoreBoard";
import Lifelines from "./Lifelines";
import AudiencePoll from "./AudiencePoll";  
import PhoneFriend from "./PhoneFriend";
import DoubleDipMessage from "./DoubleDipMessage";

const PlayerGameScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { gameId, playerId } = location.state || {};
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [format, setFormat] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [timer, setTimer] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [lifelines, setLifelines] = useState({ fiftyFifty: false, askAudience: false, phoneFriend: false });
    const [options, setOptions] = useState([]);
    const [audienceData, setAudienceData] = useState(null);
    const [friendGuess, setFriendGuess] = useState(null);
    const [doubleDipActivated, setDoubleDipActivated] = useState(false);
    const [isSpectator, setIsSpectator] = useState(false);
    const [showSpectatorPrompt, setShowSpectatorPrompt] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState(null);
    const [score, setScore] = useState(0);

    const navigateToFinalLeaderboard = useCallback(() => {
            navigate("/finalLeaderboard", { state: { leaderboard } });
    }, [navigate, leaderboard])

    useEffect(() => {
        const handleGameCanceled = () => {
            navigate("/finalLeaderboard", { state: { leaderboard } });
        };

        const handleDoubleDipUpdate = (data) => {
            if (!data.isCorrect) {
                setTimeout(() => {
                    setSelectedAnswer(null); 
                }, 3000);
            } else {
                setDoubleDipActivated(false); 
            }
        };

        const handleTimerUpdate = (data) => {
            const { seconds } = data;
            setTimer(seconds);
        };

        const handleGameUpdate = (data) => {
            if (data.spectators && data.spectators.some((spectator) => spectator.playerId === playerId)) {
                if (!isSpectator) {
                    const player = data.leaderboard.find((p) => p.playerId === playerId);
                    if (player) {
                        setScore(player.finalScore);
                    }
                    setShowSpectatorPrompt(true); 
                    setIsSpectator(true);                     
                }
            }
            if (data.currentQuestion) {
                setCurrentQuestion(data.currentQuestion);
                setOptions(data.currentQuestion.options);
                setFormat(data.format);
                setScore(data.score);
                setMilestones(data.milestones);
                setLeaderboard(data.leaderboard);
                setSelectedAnswer(null);

                if (data.gameOver) {
                    setGameOverMessage("Игра окончена. Перейдём к итоговой таблице лидеров.");
                    setTimeout(() => {
                        navigateToFinalLeaderboard();
                    }, 6000);
                }

                const activePlayers = data.leaderboard.filter((player) => !player.isSpectator);
                if (activePlayers.length === 0) {
                    setGameOverMessage("Все игроки стали зрителями. Игра завершена. Перейдём к итоговой таблице лидеров.");
                    setTimeout(() => {
                        navigateToFinalLeaderboard();
                    }, 6000);
                }
            }
        };

        SocketService.on("timerUpdate", handleTimerUpdate);
        SocketService.on("gameStateUpdate", handleGameUpdate);
        SocketService.on("doubleDipUpdate", handleDoubleDipUpdate);
        SocketService.on("gameCanceled", handleGameCanceled);

        return () => {
            SocketService.off("timerUpdate", handleTimerUpdate);
            SocketService.off("gameStateUpdate", handleGameUpdate);
            SocketService.off("doubleDipUpdate", handleDoubleDipUpdate);
            SocketService.off("gameCanceled", handleGameCanceled);
        };
    }, [playerId, isSpectator, navigateToFinalLeaderboard, leaderboard, navigate]);

    const handleAnswer = (answer) => {
        if (timer > 0 && !selectedAnswer) {
            setSelectedAnswer(answer);

            SocketService.sendMessage({
                type: "playerAnswer",
                gameId,
                playerId,
                answer,
                isDoubleDipActivated: doubleDipActivated,
            });
        }
    };

    const handleUseLifeline = (type, response) => {
        if (type === "fifty-fifty") {
            setOptions(response.options);
        } else if (type === "ask-audience") {
            setAudienceData(response.audienceVotes);
            setTimeout(() => setAudienceData(null), 5000);
        } else if (type === "phone-friend") {
            setFriendGuess(response.guess);
            setTimeout(() => setFriendGuess(null), 5000);
        } else if (type === "double-dip") {
            setDoubleDipActivated(true);
        }
        setLifelines((prev) => ({ ...prev, [type]: true }));
    };

    const handleLeaveGame = () => {
        SocketService.sendMessage({
            type: "leaveGame",
            gameId,
            playerId,
        });
        navigate("/"); 
    };

    const handleStayAsSpectator = () => {
        setShowSpectatorPrompt(false);
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
            {showSpectatorPrompt && (
                <div className="player-modal">
                    <div className="player-modal-content">
                        <p>Ваш итоговый счёт: {score}. Хотите остаться в качестве зрителя или покинуть игру?</p>
                        <button onClick={handleStayAsSpectator}>Остаться зрителем</button>
                        <button onClick={handleLeaveGame}>Покинуть игру</button>
                    </div>
                </div>
            )}          
            {currentQuestion ? (            
            <div className="multiplayer-question-container">
                <div className="multiplayer-question">{currentQuestion.question}</div>
                    <div className="multiplayer-options">
                        {options.map((option, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleAnswer(option)}
                                disabled={selectedAnswer === option || isSpectator}
                                className={timer === 0 && option === currentQuestion.correct ? "player-correct-answer" : ""}>
                                {option ? String.fromCharCode(65 + index) + ":": ""}    {option}
                            </button>
                        ))}
                    </div>
                    <div className="timer">
                        <div className="timer-value">{timer}</div>
                    </div>
            </div>
            ) : (
                <p>Ожидание начала игры...</p>
            )}

            <Lifelines 
            gameId={gameId} 
            format={format} 
            usedLifelines={lifelines} 
            onApplyLifeline={handleUseLifeline} 
            isMultiplayer={true}
            />

            {doubleDipActivated && selectedAnswer && (
                <div className="double-dip-notification">
                    <p>Неправильный выбор. У вас есть ещё одна попытка!</p>
                </div>
            )}

            {audienceData && <AudiencePoll votes={audienceData}/>}
            {friendGuess && <PhoneFriend decision={friendGuess} difficulty={currentQuestion.difficulty}/>}
            {doubleDipActivated && <DoubleDipMessage />}
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

export default PlayerGameScreen;
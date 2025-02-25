import React, { useState, useEffect, useMemo, useCallback } from "react";
import "../assets/GameScreen.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { startGame, submitAnswer, getGameState } from "../services/gameService";
import { fetchQuestions } from '../services/questionsService';
import GameOver from "./GameOver";
import Lifelines from "./Lifelines";
import ScoreBoard from "./ScoreBoard";
import AudiencePoll from "./AudiencePoll";
import PhoneFriend from "./PhoneFriend";
import DoubleDipMessage from "./DoubleDipMessage";
import Confetti from "./Confetti";
import { playBackgroundMusic, stopBackgroundMusic, playFeedbackSound, playPauseTune, playStartTune, playLevelTransition } from "../services/musicManagerService";

const GameScreen = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const format = queryParams.get("format");
    const milestoneParam = queryParams.get("milestones");
    const milestones = useMemo(() => {
        return milestoneParam
          ? milestoneParam.split(",").map(item => Number(item.trim())).filter(num => !isNaN(num))
          : [];
    }, [milestoneParam]);
    const navigate = useNavigate();

    const [gameId, setGameId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [audienceData, setAudienceData] = useState(null);
    const [friendGuess, setFriendGuess] = useState(null);
    const [doubleDipActivated, setDoubleDipActivated] = useState(false);
    const [usedLifelines, setUsedLifelines] = useState({
        "fifty-fifty": false,
        "ask-audience": false,
        "phone-friend": false,
        "double-dip": false,
    });

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const updateGameState = useCallback(async (gameId) => {
        const gameState = await getGameState(gameId);
        if (gameState.gameOver) {
            setGameOver(true);            
        } else {
            const question = gameState.questions[gameState.currentQuestion];
            setCurrentQuestion(question);
            setOptions(question.options);
            setUsedLifelines(gameState.usedLifelines);
            
            if (gameState.currentQuestion === 5 || gameState.currentQuestion === 10) {
                stopBackgroundMusic();
                playLevelTransition();
                setTimeout(() => {
                    playBackgroundMusic(question.difficulty, gameState.currentQuestion);
                }, 3000);
            } else {
                playBackgroundMusic(question.difficulty, gameState.currentQuestion);
            }
        }
        setScore(gameState.score);
    });

    useEffect(() => {
        async function initializeGame() {
            const storedGameId = localStorage.getItem("gameId");

            if (!storedGameId) {
                const data = await fetchQuestions();
                const gameData = await startGame(data, milestones);
                setGameId(gameData.gameId);
                playStartTune();
                await updateGameState(gameData.gameId);

                localStorage.setItem("gameId", gameData.gameId);                
            } else {
                setGameId(storedGameId);
                await updateGameState(storedGameId);
            }
        }
        initializeGame();
    }, [format, milestones, playStartTune]);    

    const handleAnswer = async (answer) => {
        setSelectedAnswer(answer);        
        const gameState = await getGameState(gameId);
        const response = await submitAnswer(gameId, answer);   

        if (doubleDipActivated) {
            if (!response.correct) {
                setTimeout(() => {
                    setSelectedAnswer(null); 
                }, 3000); 
            } else {
                setDoubleDipActivated(false);
            }
        }
        if (response.doubleDipActivated) {
            return;
        }

        const answerState = response.correct ? "correct" : "wrong";
        const pauseTime = gameState.currentQuestion === 14 || gameState.currentQuestion === 9 ? 5000 : 3000;
        
        if (currentQuestion.difficulty === "medium" || currentQuestion.difficulty === "hard") {
            stopBackgroundMusic();
            playPauseTune();

            setTimeout(() => {
                setIsCorrect(true);
                playFeedbackSound(answerState, currentQuestion.difficulty, gameState.currentQuestion);
                setTimeout(async () => {
                    if (response.correct) {
                        await updateGameState(gameId);
                        setSelectedAnswer(null);                        
                    } else {
                        setGameOver(true);
                        setScore(response.finalScore);
                        setSelectedAnswer(null);
                    }
                    setIsCorrect(false);
                }, pauseTime);
                if (gameState.currentQuestion === 14) {
                    setShowConfetti(true);
                }                
            }, 4000);                                
        } else {
            setIsCorrect(true);
            playFeedbackSound(answerState, currentQuestion.difficulty, gameState.currentQuestion);
            setTimeout(async () => {
                if (response.correct) {
                    await updateGameState(gameId);
                    setSelectedAnswer(null);
                } else {
                    setGameOver(true);
                    setScore(response.finalScore);
                    setSelectedAnswer(null);
                }
                setIsCorrect(false);
            }, 3000);
        }                
    };

    const applyLifelineEffect = (type, response) => {
        if (type === "fifty-fifty") {
            setOptions(response.options);
        } else if (type === "ask-audience") {
            setAudienceData(response.audienceVotes);
            setTimeout(() => {
                setAudienceData(null);
            }, 5000);
        } else if (type === "phone-friend") {
            setFriendGuess(response.guess);
            setTimeout(() => {
                setFriendGuess(null);
            }, 5000);
        } else if (type === "double-dip") {
            setDoubleDipActivated(true);
        }
        setUsedLifelines((prev) => ({...prev, [type] : true}));
    };

    return (
        <div className='game-container'>
            {showConfetti && <Confetti />}
            <div className="fade-from-black-overlay"></div>
            <div className="spotlight-left"></div>
            <div className="spotlight-right"></div>
            {gameOver ? (
                <GameOver score={score} />
            ) : (
                <>
                    <ScoreBoard score={score} milestones={milestones} isMultiplayer={false}/>
                    <div className="question-container">
                        <div className="question">{currentQuestion?.question}</div>
                        <div className='options'>
                            {options.map((option, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handleAnswer(option)}
                                    disabled={selectedAnswer === option}
                                    className={`${isCorrect && option === currentQuestion.correct ? "correct" : ""}`}>
                                    {option ? String.fromCharCode(65 + index) + ":": ""}    {option}
                                </button>
                            ))}
                        </div>
                    </div>                    
                    <Lifelines 
                    gameId={gameId} 
                    format={format} 
                    usedLifelines={usedLifelines} 
                    onApplyLifeline={applyLifelineEffect} 
                    isMultiplayer={false}
                    />

                    {audienceData && <AudiencePoll votes={audienceData} />}
                    {friendGuess && <PhoneFriend decision={friendGuess} difficulty={currentQuestion.difficulty} />}
                    {doubleDipActivated && <DoubleDipMessage />}

                    {doubleDipActivated && selectedAnswer && (
                        <div className="double-dip-notification">
                            <p>Неправильный выбор. У вас есть ещё одна попытка!</p>
                        </div>
                    )}

                    <button className="menu-button" onClick={() => {
                        stopBackgroundMusic();
                        navigate('/')}
                        }>
                        <i className="fas fa-home"></i>
                    </button>
                </>
            )}
        </div>
    );
};

export default GameScreen;
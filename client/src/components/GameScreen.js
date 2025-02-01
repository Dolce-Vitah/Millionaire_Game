import React, { useState, useEffect } from "react";
import "../assets/GameScreen.css";
import { useLocation } from "react-router-dom";
import { startGame, submitAnswer, getGameState } from "../services/gameService";
import { fetchQuestions } from '../services/questionsService';
import GameOver from "./GameOver";
import Lifelines from "./Lifelines";
import ScoreBoard from "./ScoreBoard";
import AudiencePoll from "./AudiencePoll";
import PhoneFriend from "./PhoneFriend";

const GameScreen = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    //const gameMode = queryParams.get("mode");
    const format = queryParams.get("format");

    const [gameId, setGameId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [audienceData, setAudienceData] = useState(null);
    const [friendGuess, setFriendGuess] = useState(null);
    const [usedLifelines, setUsedLifelines] = useState({
        "fifty-fifty": false,
        "ask-audience": false,
        "phone-friend": false,
        "double-dip": false,
    });

    useEffect(() => {
        async function initializeGame() {
            const storedGameId = localStorage.getItem("gameId");

            if (!storedGameId) {
                const data = await fetchQuestions();
                const gameData = await startGame(data);
                setGameId(gameData.gameId);
                updateGameState(gameData.gameId);

                localStorage.setItem("gameId", gameData.gameId);
            } else {
                setGameId(storedGameId);
                updateGameState(storedGameId);
            }
        }
        initializeGame();
    }, [format]);

    const updateGameState = async (gameId) => {
        const gameState = await getGameState(gameId);
        if (gameState.gameOver) {
            setGameOver(true);
        } else {
            const question = gameState.questions[gameState.currentQuestion];
            setCurrentQuestion(question);
            setOptions(question.options);
            setUsedLifelines(gameState.usedLifelines);
        }
        setScore(gameState.score);
    };

    const handleAnswer = async (answer) => {
        const response = await submitAnswer(gameId, answer);
        if (response.correct) {
            updateGameState(gameId);
        } else {
            setGameOver(true);
            setScore(response.finalScore);
        }
    };

    const applyLifelineEffect = (type, response) => {
        if (type === "fifty-fifty") {
            setOptions(response.options);
        } else if (type === "ask-audience") {
            setAudienceData(response.audienceVotes);
            setTimeout(() => {
                setAudienceData(null);
            }, 4000);
        } else if (type === "phone-friend") {
            setFriendGuess(response.guess);
            setTimeout(() => {
                setFriendGuess(null);
            }, 4000);
        }
        setUsedLifelines((prev) => ({...prev, [type] : true}));
    };

    return (
        <div className='game-container'>
            {gameOver ? (
                <GameOver score={score} />
            ) : (
                <>
                    <ScoreBoard score={score} />
                    <div className="question">{currentQuestion?.question}</div>
                    <div className='options'>
                        {options.map((option, index) => (
                            <button key={index} onClick={() => handleAnswer(option)}>
                                {option ? String.fromCharCode(65 + index) + ":": ""}    {option}
                            </button>
                        ))}
                    </div>
                    <Lifelines 
                    gameId={gameId} 
                    format={format} 
                    usedLifelines={usedLifelines} 
                    onApplyLifeline={applyLifelineEffect} 
                    />

                    {audienceData && <AudiencePoll votes={audienceData} />}
                    {friendGuess && <PhoneFriend decision={friendGuess} difficulty={currentQuestion.difficulty} />}
                </>
            )}
        </div>
    );
};

export default GameScreen;
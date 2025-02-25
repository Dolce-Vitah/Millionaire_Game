import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../assets/FinalLeaderboard.css";

const FinalLeaderboard = () => {
    const location = useLocation();
    const leaderboard = location.state?.leaderboard || [];
    const navigate = useNavigate();

    return (
        <div className="final-leaderboard">
            <div className="spotlight-left"></div>
            <div className="spotlight-right"></div>
            <h1>Итоговая таблица лидеров</h1>
            <ul>
                <li className="leaderboard-header">
                    <span className="player-nickname">Игрок</span>
                    <span className="player-questions">Ответы</span>
                    <span className="player-score">Очки</span>
                </li>
                {leaderboard.map((player, index) => (
                    <li key={index} className={`${index === 0 ? "leader" : ""}`}>
                        <span className="player-nickname">{player.nickname}</span>
                        <span className="player-questions">{player.answeredQuestions}</span>
                        <span className="player-score">{player.finalScore}</span>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate("/")}>Вернуться в главное меню</button>
        </div>
    );
};

export default FinalLeaderboard;
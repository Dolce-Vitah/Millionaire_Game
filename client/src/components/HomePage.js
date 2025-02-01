import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/HomePage.css";
import logo from "../assets/main_logo.png";

const HomePage = () => {
    const [gameMode, setGameMode] = useState(null);
    const [format, setFormat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("gameId");
    }, []);

    const startGame = () => {
        if (!gameMode || !format) {
            alert("Please select a game mode and format!");
            return;
        }
        navigate(`/game?mode=${gameMode}&format=${format}`);
    };

    return (
        <div className="home-container">
            <img src={logo} alt="Game Logo" className="logo"/>

            <div className="selection">
                <h3>Выберите режим</h3>
                <button className={gameMode === "singleplayer" ? "selected" : ""} onClick={() => setGameMode("singleplayer")}>
                    Одиночный
                </button>
                <button className={gameMode === "multiplayer" ? "selected" : ""} onClick={() => setGameMode("multiplayer")}>
                    Совместный
                </button>
            </div>

            <div className="selection">
                <h3>Выберите формат</h3>
                <button className={format === "original" ? "selected" : ""} onClick={() => setFormat("original")}>
                    Оригинальный
                </button>
                <button className={format === "high-risk" ? "selected" : ""} onClick={() => setFormat("high-risk")}>
                    Рискованный
                </button>
            </div>

            <button className="start-btn" onClick={startGame}>
                Начать игру
            </button>
        </div>
    );
};

export default HomePage;

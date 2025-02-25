import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SocketService from "../services/socketService";
import "../assets/Lobby.css";
import CurrencyOverlay from "./CurrencyOverlay";
import { stopBackgroundMusic } from "../services/musicManagerService";

const Lobby = () => {
    const location = useLocation();
    const { invitationLink, gameId, playerId, role = "", nickname = "" } = location.state || {};
    const [players, setPlayers] = useState(
        role === "player" ? [{ playerId, nickname }] : []
    );
    const [transitionActive, setTransitionActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleCurrentPlayers = (data) => {
            if (data.players) {
                setPlayers(data.players);
            }
        };        

        const handleHostLeft = (data) => {
            alert("Ведущий отменил игру. Вы будете перенаправлены на главную страницу.");
            navigate("/");
        };

        const handleGameStarted = () => {
            setTransitionActive(true);            

            setTimeout(() => {
                stopBackgroundMusic();
                if (role === "player") {
                    navigate("/playerGame", { state: { gameId, playerId } });
                } else if (role === "host") {
                    navigate("/hostGame", { state: { gameId } });
                }
            }, 2000);
        };

        const handlePlayerLeft = (data) => {
            if (data.playerId) {
                setPlayers(prev => {
                    const filtered = prev.filter(p => p.playerId !== data.playerId);
                    return filtered;
                });
            }
        };        

        SocketService.on("currentPlayers", handleCurrentPlayers);
        SocketService.on("hostLeft", handleHostLeft);
        SocketService.on("playerLeft", handlePlayerLeft);
        SocketService.on("gameStarted", handleGameStarted);

        return () => {
            if (typeof SocketService.off === "function") {
                SocketService.off("currentPlayers", handleCurrentPlayers);
                SocketService.off("hostLeft", handleHostLeft);
                SocketService.off("playerLeft", handlePlayerLeft);
                SocketService.off("gameStarted", handleGameStarted);
            }
        };
    }, [playerId, role, navigate, gameId]);

    const handleStartGame = () => {
        SocketService.sendMessage({
            type: "navigate",
            gameId,
        });
    };

    const handleLeave = () => {
        if (role === "host") {
            SocketService.sendMessage({
                type: "hostLeft",
                gameId,
            });
        } else {
            SocketService.sendMessage({
                type: "leaveGame",
                gameId,
                playerId,
            });
        }
        navigate("/");
    };

    return (
        <div className="lobby">
            <h2>Комната ожидания</h2>
            <p>Код для приглашения игроков:</p>
            <input type="text" readOnly value={invitationLink} />
            <h3>Присоединившиеся игроки:</h3>
            {players.length > 0 ? (
                <ul className="players-list">
                    {players.map((player, index) => (
                        <li key={index}>{player.nickname}</li>
                    ))}
                </ul>
            ) : (
                <p>Пока нет игроков...</p>
            )}

            {role === "host" && (
                <button className="start-game-button" onClick={handleStartGame}>
                    Запустить игру
                </button>
            )}

            {role === "host" && (
                <button className="cancel-button" onClick={handleLeave}>
                    Отменить
                </button>
            )}

            {role === "player" && (
                <button className="leave-button" onClick={handleLeave}>
                    Выйти из игры
                </button>
            )}

            {transitionActive && (
                <div className="transition-overlay"></div>
            )}

            <CurrencyOverlay />
        </div>
    );
};

export default Lobby;
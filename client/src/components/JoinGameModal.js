import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SocketService from "../services/socketService";
import "../assets/JoinGameModal.css"; 

const JoinGameModal = ({ onClose }) => {
    const [invitationLink, setInvitationLink] = useState("");
    const [nickname, setNickname] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        try {
            setErrorMessage("");

            if (!invitationLink.trim() || !nickname.trim()) {
                setErrorMessage("Введите ссылку для участия и ваш никнейм.");
                return;
            }

            if (nickname.length < 8 || nickname.length > 32 || !/^[A-Za-z0-9]+$/.test(nickname)) {
                setErrorMessage("Никнейм должен содержать от 8 до 32 символов, используя латинские буквы или цифры.");
                return;
            }

            const url = new URL(invitationLink);
            const gameId = url.searchParams.get("gameId");
            if (!gameId) {
                setErrorMessage("Некорректная ссылка. Пожалуйста, попробуйте снова.");
                return;
            }
            const playerId = "player-" + Math.floor(Math.random() * 1000);
            SocketService.connect(() => {
                SocketService.sendMessage({
                    type: "joinGame",
                    gameId,
                    playerId,
                    role: "player",
                    nickname 
                });
            });
            
            navigate("/lobby", { state: { invitationLink, gameId, playerId, role: "player", nickname } });
        } catch (error) {
            setErrorMessage("Введена некорректная ссылка. Пожалуйста, проверьте и попробуйте ещё раз.");
        }
    };

    return (
        <div className="join-game-modal-overlay">
            <div className="modal-content join-game-modal">
                <h2>Присоединиться к игре</h2>
                <div className="input-group">
                    <label>Ссылка на игру:</label>
                    <input
                        type="text"
                        placeholder="Вставьте ссылку"
                        value={invitationLink}
                        onChange={(e) => setInvitationLink(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Ваш никнейм:</label>
                    <input
                        type="text"
                        placeholder="Введите ваш никнейм"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <p className="warning">
                        Никнейм должен содержать от 8 до 32 символов, используйте только латинские буквы или цифры.
                    </p>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                
                <div className="modal-buttons">
                    <button className="join-button" onClick={handleJoin}>Присоединиться</button>
                    <button className="cancel-button" onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
};

export default JoinGameModal;
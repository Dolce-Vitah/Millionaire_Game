import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuestions } from "../services/questionsService";
import { validateQuestions, shuffleQuestions } from "../services/hostSettingsService";
import SocketService from "../services/socketService";
import "../assets/HostSettingsModal.css"; 
import JsonStructurePopover from "./JsonStructurePopover";

const HostSettingsModal = ({ onClose }) => {
    const [gameId] = useState("game-" + Date.now());
    const [invitationLink] = useState(`${window.location.origin}/join?gameId=${gameId}`);

    const [questionMethod, setQuestionMethod] = useState("builtIn");
    const [questions, setQuestions] = useState(null);
    const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);
    const [format, setFormat] = useState("original");
    const [milestone, setMilestone] = useState("");
    const [showJsonPopover, setShowJsonPopover] = useState(false);
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.name.endsWith(".json")) {
                alert("Пожалуйста, загрузите файл в формате JSON.");
                clearFileInput();
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsedQuestions = JSON.parse(e.target.result);

                    const validationResult = validateQuestions(parsedQuestions);
                    if (!validationResult.valid) {
                        alert(validationResult.error);
                        clearFileInput();
                        return;
                    }

                    const shuffledQuestions = shuffleQuestions(parsedQuestions);                    
                    setQuestions(shuffledQuestions);
                } catch (err) {
                    console.error("Ошибка при разборе JSON файла:", err);
                    alert("Ошибка при чтении файла. Проверьте его формат.");
                    clearFileInput();
                }
            };
            reader.readAsText(file);
        }
    }

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    }

    const handleSettingsSubmit = async () => {
        const playerId = "player-" + Math.floor(Math.random() * 1000);
        let finalQuestions = questions;

        if (questionMethod === "builtIn") {
            finalQuestions = await fetchQuestions();
            setQuestions(finalQuestions);
        }

        SocketService.connect(() => {
            SocketService.sendMessage({
                type: "joinGame",
                gameId,
                playerId,
                role: "host",
                settings: {
                    questions: finalQuestions,
                    secondsPerQuestion,
                    format,
                    milestones: format === "high-risk" ? [milestone] : [5000, 100000],
                },
            });
        });
        
        navigate("/lobby", { state: { invitationLink, gameId, playerId, role: "host"} });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(invitationLink)
            .then(() => console.log("Код игры скопирован"))
            .catch((err) => console.error("Ошибка копирования кода игры:", err));
    };

    const isNarrow = questionMethod !== "custom" && format !== "high-risk";

    return (
        <div className="settings-modal-overlay">
            <div className={`modal-content host-settings-modal ${isNarrow ? "narrow" : ""}`}>
                <h2>Настройки игры для хоста</h2>
                <div className="setting-grid">
                    <div className="group-first-column">
                        <div className="setting-group">
                            <label>Способ выбора вопросов:</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="questionMethod"
                                        value="builtIn"
                                        checked={questionMethod === "builtIn"}
                                        onChange={(e) => setQuestionMethod(e.target.value)}
                                    />
                                    Использовать встроенные
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="questionMethod"
                                        value="custom"
                                        checked={questionMethod === "custom"}
                                        onChange={(e) => setQuestionMethod(e.target.value)}
                                    />
                                    Загрузить свои
                                </label>                        
                            </div>
                        </div>                                        

                        <div className="setting-group">
                            <label>Формат игры:</label>
                            <select value={format} onChange={(e) => setFormat(e.target.value)}>
                                <option value="original">Оригинальный</option>
                                <option value="high-risk">Рискованный</option>
                            </select>
                        </div>                      

                        <div className="setting-group">
                                <label>Время на вопрос:</label>
                                <select value={secondsPerQuestion} onChange={(e) => setSecondsPerQuestion(Number(e.target.value))}>
                                    <option value={30}>30 секунд</option>
                                    <option value={45}>45 секунд</option>
                                    <option value={60}>60 секунд</option>
                                    <option value={75}>75 секунд</option>
                                    <option value={90}>90 секунд</option>
                                </select>
                        </div> 
                    </div>

                    <div className="group-second-column">
                    {questionMethod === "custom" && (
                        <div className="setting-group">
                            <label>Загрузите файл с вопросами (.json):</label>
                            <div className="file-upload-container">
                                <input type="file" accept=".json" onChange={handleFileUpload} ref={fileInputRef} />
                                <button
                                    className="example-info-button"
                                    onClick={() => setShowJsonPopover(true)}
                                >
                                    ?
                                </button>   
                            </div>                         
                        </div>
                    )}

                    {format === "high-risk" && (
                        <div className="setting-group milestone-select">
                            <label>Выберите несгораемую сумму:</label>
                            <select value={milestone} onChange={(e) => setMilestone(Number(e.target.value))}>
                                <option value="">-- Выберите --</option>
                                <option value="500">500</option>
                                <option value="1000">1000</option>
                                <option value="2000">2000</option>
                                <option value="3000">3000</option>
                                <option value="5000">5000</option>
                                <option value="10000">10000</option>
                                <option value="15000">15000</option>
                                <option value="25000">25000</option>
                                <option value="50000">50000</option>
                                <option value="100000">100000</option>
                                <option value="200000">200000</option>
                                <option value="400000">400000</option>
                                <option value="800000">800000</option>
                                <option value="1500000">1500000</option>
                            </select>
                        </div>
                    )}
                    </div>
                </div>             

                <div className="invitation-link">
                    <p>Ссылка для приглашения игроков:</p>
                    <div className="copy-link-container">
                        <input type="text" readOnly value={invitationLink} />
                        <button className="copy-button" onClick={handleCopyLink}>Копировать</button>
                    </div>
                </div> 

                <div className="modal-buttons">
                    <button className="submit-button" onClick={handleSettingsSubmit}>Запустить игру</button>
                    <button className="cancel-button" onClick={onClose}>Отмена</button>
                </div> 
                
                {showJsonPopover && (
                    <JsonStructurePopover onClose={() => setShowJsonPopover(false)} />
                )}                           
            </div>            
        </div>
    );
};

export default HostSettingsModal;
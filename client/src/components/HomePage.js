import React, { useState, useEffect, useCallback } from "react";
import CurrencyOverlay from "./CurrencyOverlay";
import GlowingLogo from "./GlowingLogo";
import { useNavigate } from "react-router-dom";
import FormatModal from "./FormatModal";
import MilestonesModal from "./MilestonesModal";
import RoleSelectionModal from "./RoleSelectionModal";
import HostSettingsModal from "./HostSettingsModal";
import JoinGameModal from "./JoinGameModal";
import "../assets/HomePage.css";
import { playMainPageBackground, stopBackgroundMusic, setGlobalVolume } from "../services/musicManagerService";

const milestoneOptions = [500, 1000, 2000, 3000, 5000, 10000, 15000, 25000, 50000, 100000, 200000, 400000, 800000, 1500000];

const HomePage = () => {
    const [gameMode, setGameMode] = useState(null);
    const [format, setFormat] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [showFormatModal, setShowFormatModal] = useState(false);
    const [showHostSettingsModal, setShowHostSettingsModal] = useState(false);
    const [showJoinGameModal, setShowJoinGameModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showMilestonesModal, setShowMilestonesModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [transitionActive, setTransitionActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("gameId");
    }, []);

    useEffect(() => {
        playMainPageBackground();
    }, []);

    const startGame = useCallback(() => {        
        stopBackgroundMusic();
        const query = `game?format=${format}&milestones=${milestones}`;
        navigate(query);
    }, [format, milestones, navigate]);

    const handleStartTransition = useCallback(() => {
        setTransitionActive(true);
        setTimeout(() => {
            startGame();
        }, 2000);
    }, [startGame]);

    const selectSingleplayer = () => {
        setGameMode("singleplayer");
        setShowFormatModal(true);
    };

    const selectMultiplayer = () => {
        setGameMode("multiplayer");
        setShowRoleModal(true);
    }

    const handleRoleSelection = (selectedRole) => {
        setShowRoleModal(false);
        if (selectedRole === "host") {
            setShowHostSettingsModal(true);            
        } else if (selectedRole === "player") {
            setShowJoinGameModal(true);
        }
    };
    
    const chooseFormat = (selectedFormat) => {
        setFormat(selectedFormat);
        setShowFormatModal(false);

        if (selectedFormat === "high-risk") {
            setShowMilestonesModal(true);
        } else {
            setMilestones([5000, 100000]);
        }
    };

    const chooseMilestones = (selectedSum) => {
        setMilestones([selectedSum]);
        setShowMilestonesModal(false);
    }

    useEffect(() => {
        if (format && (format !== "high-risk" || milestones.length > 0)) {
            handleStartTransition();
        }
    }, [format, milestones, handleStartTransition]);

    const handleVolumeChange = (e) => {
        const newVolume = Number(e.target.value) / 100;
        setGlobalVolume(newVolume);
      };

    return (
        <div className="home-container">
            <GlowingLogo />

            <div className="selection">
                <h3>Выберите режим</h3>
                <button className={gameMode === "singleplayer" ? "selected" : ""} onClick={() => selectSingleplayer()}>
                    Одиночный
                </button>
                <button className={gameMode === "multiplayer" ? "selected" : ""} onClick={() => selectMultiplayer()}>
                    Совместный
                </button>
            </div>

            {showFormatModal && (
                <FormatModal 
                    chooseFormat={chooseFormat} 
                    closeModal={() => setShowFormatModal(false)} 
                />
            )}

            {showMilestonesModal && (
                <MilestonesModal 
                    milestoneOptions={milestoneOptions} 
                    chooseMilestones={chooseMilestones} 
                    closeModal={() => setShowMilestonesModal(false)} 
                />
            )}

            {showRoleModal && (
                <RoleSelectionModal
                handleRoleSelection={handleRoleSelection}
                closeModal={() => setShowRoleModal(false)}
              />
            )}

            {showHostSettingsModal && (
                <HostSettingsModal onClose={() => setShowHostSettingsModal(false)} />
            )}

            {showJoinGameModal && (
                <JoinGameModal onClose={() => setShowJoinGameModal(false)} />
            )}

            <div className="home-icons">
                <i className="fas fa-cog" onClick={() => setShowSettingsModal(true)} title="Settings"></i>
                <i className="fas fa-scroll" onClick={() => setShowRulesModal(true)} title="Rules"></i>
                <i className="fas fa-question-circle" onClick={() => setShowHelpModal(true)} title="Help"></i>
            </div>
            

            {showSettingsModal && (
                <div className="modal-overlay">
                    <div className="settings-modal">
                        <h3>Настройки</h3>
                        <input 
                          type="range" 
                          min="0" 
                          max="100"
                          onChange={handleVolumeChange} 
                        />
                        <button onClick={() => setShowSettingsModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}

            {showRulesModal && (
                <div className="modal-overlay">
                    <div className="rules-modal">
                        <h3>Правила игры</h3>
                        <p>
                            Вам предстоит сыграть в интеллектуальную игру, состоящую из 15 вопросов.<br /><br />
                            1. Каждый вопрос имеет 4 варианта ответа, но только один является верным.<br /><br />
                            2. Пять первых вопросов - лёгкие. Вопросы с шестого по десятый - уже посерьёзнее, а наиболее сложные - с 11-го по 15-ый.<br /><br />
                            3. В игре есть понятие "несгораемой суммы". Её нельзя проиграть, даже если дан неправильный ответ на вопрос.<br /><br />
                            4. На всю игру даются 3 подсказки:<br /><br />                           
                            "50 на 50" - убирает 2 неверных ответа<br /> 
                            "Звонок другу" - вы можете позвонить другу и спросить его мнение<br />
                            "Помощь зала" - игроки в зале могут помочь вам с ответом на вопрос<br /><br />
                            5. В рискованном формате появляется четвёртая подсказка - "Второй шанс".
                        </p>                           
                        <button onClick={() => setShowRulesModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}

            {showHelpModal && (
                <div className="modal-overlay">
                    <div className="help-modal">
                        <h3>Помощь</h3>
                        <p>Если у вас возникли вопросы или проблемы, Вы можете написать мне:</p>
                        <p>Email: valetta.di@yandex.ru</p>
                        <p>Telegram: @DoLce_Vitah</p>
                        <button onClick={() => setShowHelpModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}

            <CurrencyOverlay />

            {transitionActive && <div className="fade-out-overlay"></div>}
        </div>
    );
};

export default HomePage;

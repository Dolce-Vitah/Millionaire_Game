import React from "react";
import "../assets/Lifelines.css";
import { getLifeline } from "../services/lifelinesService";

const Lifelines = ({ gameId, format, usedLifelines, onApplyLifeline, isMultiplayer }) => {
    const handleLifeline = async (type) => {
        if (usedLifelines[type]) return;

        const response = await getLifeline(gameId, type);
        
        onApplyLifeline(type, response);
    };

    const lifelinesClass = format === "high-risk" ? "lifelines high-risk" : "lifelines";

    return (
        <div className={`${lifelinesClass} ${isMultiplayer ? "multiplayer" : ""}`}>
            <button onClick={() => handleLifeline("fifty-fifty")} disabled={usedLifelines["fifty-fifty"]}>
            <i className="fas fa-random"></i>
            </button>
            <button onClick={() => handleLifeline("ask-audience")} disabled={usedLifelines["ask-audience"]}>
            <i className="fas fa-users"></i>
            </button>
            <button onClick={() => handleLifeline("phone-friend")} disabled={usedLifelines["phone-friend"]}>
            <i className="fas fa-phone-alt"></i>
            </button>
            {format === "high-risk" && (
                <button onClick={() => handleLifeline("double-dip")} disabled={usedLifelines["double-dip"]}>
                <i className="fas fa-sync"></i>
                </button>
            )}            
        </div>
    );
};

export default Lifelines;
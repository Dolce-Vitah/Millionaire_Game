import React from "react";
import "../assets/Lifelines.css";
import { getLifeline } from "../services/lifelinesService";

const Lifelines = ({ gameId, format, usedLifelines, onApplyLifeline }) => {
    const handleLifeline = async (type) => {
        if (usedLifelines[type]) return;

        const response = await getLifeline(gameId, type, format);
        
        onApplyLifeline(type, response);
    };

    return (
        <div className="lifelines">
            <button onClick={() => handleLifeline("fifty-fifty")} disabled={usedLifelines["fifty-fifty"]}>
            <i class="fas fa-random"></i>
            </button>
            <button onClick={() => handleLifeline("ask-audience")} disabled={usedLifelines["ask-audience"]}>
            <i class="fas fa-users"></i>
            </button>
            <button onClick={() => handleLifeline("phone-friend")} disabled={usedLifelines["phone-friend"]}>
            <i class="fas fa-phone-alt"></i>
            </button>
            {format === "high-risk" && (
                <button onClick={() => handleLifeline("double-dip")} disabled={usedLifelines["double-dip"]}>Double Dip</button>
            )}            
        </div>
    );
};

export default Lifelines;
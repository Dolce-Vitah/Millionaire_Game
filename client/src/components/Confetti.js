import React, { useEffect, useState } from "react";
import "../assets/Confetti.css";

const Confetti = () => {
    const [confettiPieces, setConfettiPieces] = useState([]);

    useEffect(() => {
        const pieces = Array.from({ length: 300 }, () => {
            const x = Math.random() * 100;         

            return {
                id: Math.random(),
                x,
                rotation: Math.random() * 360, 
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                size: Math.random() * 10 + 5, 
                delay: Math.random() * 2, 
            };
        });
        setConfettiPieces(pieces);
    }, []);

    return (
        <div className="confetti-container">
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: `${piece.x}vw`,
                        top: `0vh`,
                        backgroundColor: piece.color,
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        transform: `rotate(${piece.rotation}deg)`,
                        animationDelay: `${piece.delay}s`,
                    }}
                ></div>
            ))}
        </div>
    );
};

export default Confetti;
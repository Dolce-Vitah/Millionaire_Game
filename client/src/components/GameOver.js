import React from "react";
import "../assets/GameOver.css";
import { useNavigate } from "react-router-dom";

const GameOver = ({ score }) => {
    const navigate = useNavigate();

    return (
        <div className='game-over'>
            {score === 0 ? (
                <h2>К сожалению, Вы проиграли</h2>
            ) : ( score === 3000000 ? (
                <>
                <h2>Поздравляем!</h2>
                <p>Ваш выигрыш составляет: {score}</p>
                </>
            ) : (
                <>
                <h2>Лучше, чем 0!</h2>
                <p>Ваша несгораемая сумма: {score}</p>
                </>                
            ))}
            <button onClick={() => navigate('/')}>Меню</button>
        </div>
    );
};

export default GameOver;
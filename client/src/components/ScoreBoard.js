import React from "react";
import "../assets/ScoreBoard.css";

const prizeValues = [0, 500, 1000, 2000, 3000, 5000, 10000, 15000, 25000, 50000, 100000, 200000, 400000, 800000, 1500000, 3000000];

const ScoreBoard = ({ score }) => {
    return (
        <div className='score-board'>
            <h3>Выигрыш: {score}</h3>
            <ul>
                {prizeValues.slice(1).map((value, index) => (
                    <li key={index} className={score === prizeValues[index] ? 'highlight' : ''}>
                        {value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScoreBoard;
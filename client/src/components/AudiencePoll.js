import React from "react";
import "../assets/AudiencePoll.css"

const AudiencePoll = ({ votes }) => {
    const options = ["A", "B", "C", "D"];

    return (
        <div className="audience-poll">
            <h3>Зрители проголосовали</h3>
            <div className="bar-container">
                {votes.map((vote, index) => (
                    <div key={index} className="bar-label">
                        {options[index]}: {vote.percentage}%
                        <div className="bar" style={{ width: `${vote.percentage}%` }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AudiencePoll;
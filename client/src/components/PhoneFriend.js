import React, { useState, useEffect } from "react";
import "../assets/PhoneFriend.css";

const friends = [
    { name: "Саше", message: ["Легко! Ответ - ", "Я это в первом классе уже знал. Ответ - ", "На 100% уверен, что это "] },
    { name: "Тане", message: ["Наверное, это ", "Не уверена, но вроде это ", "Пытаюсь вспомнить... Кажется, это "] },
    { name: "Васе", message: ["Эники-беники... Пусть будет ", "Пу-пу-пу... Допустим, это ", "Ты переоцениваешь мои познания... Выбираю "] }
];

const PhoneFriend = ({ decision, difficulty }) => {
    const [message, setMessage] = useState("");
    const [friend, setFriend] = useState(null);

    useEffect(() => {
        let chosenFriend;

        if (difficulty === "easy") {
            chosenFriend = friends[0];
        } else if (difficulty === "medium") {
            chosenFriend = friends[1];
        } else {
            chosenFriend = friends[2];
        }
        
        setFriend(chosenFriend);

        setTimeout(() => {
            const response = chosenFriend.message[Math.floor(Math.random() * chosenFriend.message.length)];

            setMessage(`${response}${decision}`);
        }, 1);
        
    }, [decision, difficulty]);

    return (
        <div className="phone-friend-container">
            <div className="phone-header">📞 Звоним {friend ? friend.name : "..."}</div>
            <div className="phone-avatar"></div>
            <div className="phone-message">
                {message}
            </div>
            <div className="phone-footer">Соединение установлено...</div>
            <div className="phone-buttons">
                <div className="phone-button">📴</div> 
                <div className="phone-button">🔊</div> 
            </div>
        </div>
    );
};

export default PhoneFriend;
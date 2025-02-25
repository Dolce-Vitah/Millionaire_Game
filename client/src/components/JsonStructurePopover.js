import React from "react";
import "../assets/JsonStructurePopover.css";

const JsonStructurePopover = ({ onClose }) => {
  const content = `[
  {
    "question": "Какой цвет неба?",
    "options": ["Синий", "Красный", "Зелёный", "Жёлтый"],
    "correct": "Синий",
    "difficulty": "easy"
  },
  {
    "question": "Сколько будет 2+2?",
    "options": ["3", "4", "5", "6"],
    "correct": "4",
    "difficulty": "easy"
  },
  // ...
  {
    "question": "Пример сложного вопроса?",
    "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
    "correct": "Вариант 2",
    "difficulty": "hard"
  }
]`;

  return (
    <div className="popover-overlay">
      <div className="popover-content">
        <h3>Структура файла с вопросами (.json)</h3>
        <pre>{content}</pre>
        <button className="close-popover-button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default JsonStructurePopover;
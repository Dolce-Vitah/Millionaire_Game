import React from "react";
import "../assets/FormatModal.css";

const FormatModal = ({ chooseFormat, closeModal }) => {
  return (
    <div className="format-modal-overlay">
      <div className="format-modal">
        <h3>Выберите формат игры</h3>
        <div className="button-container">
          <button onClick={() => chooseFormat("original")}>Оригинальный</button>
          <button onClick={() => chooseFormat("high-risk")}>Рискованный</button>
        </div>        
        <div className="format-cancel-button">
          <button onClick={closeModal}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default FormatModal;
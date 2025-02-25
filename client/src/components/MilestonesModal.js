import React from "react";
import "../assets/MilestonesModal.css";

const MoneyTreeModal = ({ milestoneOptions, chooseMilestones, closeModal }) => {
  return (
    <div className="modal-overlay">
      <div className="milestones-modal">
        <h3>Выберите гарантированную сумму выигрыша</h3>
        <div className="milestones-timeline">
          {milestoneOptions.map(option => (
            <div 
              key={option} 
              className="milestones-level"
              onClick={() => chooseMilestones(option)}>
              {option.toLocaleString()}
            </div>
          ))}
        </div>
        <div className="milestones-cancel-button">
          <button onClick={closeModal}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default MoneyTreeModal;
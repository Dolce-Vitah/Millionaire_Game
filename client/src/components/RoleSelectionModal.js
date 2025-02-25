import React from "react";
import "../assets/RoleSelectionModal.css";

const RoleSelectionModal = ({ handleRoleSelection, closeModal }) => {
    return (
        <div className="modal-overlay">
            <div className="role-modal">
                <h3>Выберите свою роль</h3>
                <div className="role-buttons">
                    <button onClick={() => handleRoleSelection("host")}>Ведущий</button>
                    <button onClick={() => handleRoleSelection("player")}>Игрок</button>
                </div>                
                <button className="role-cancel-button" onClick={closeModal}>Отмена</button>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
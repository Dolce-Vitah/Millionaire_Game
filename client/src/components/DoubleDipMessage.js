import React from "react";
import "../assets/DoubleDipMessage.css";

const DoubleDipMessage = () => {
    return (
        <div className="double-dip-message">
            <h3>Второй шанс активирован!</h3>
            <p>Если ответите неправильно, есть возможность попробовать еще раз.</p>
        </div>
    );
}

export default DoubleDipMessage;
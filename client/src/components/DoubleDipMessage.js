import React from "react";
import { Message } from "semantic-ui-react";
import "./assets/DoubleDipMessage.css";

const DoubleDipMessage = () => {
    return (
        <Message
            className="double-dip-message"
            header="Второй шанс активирован!"
            content="Если ответите неправильно, есть возможность попробовать еще раз."
        />
    );
}

export default DoubleDipMessage;
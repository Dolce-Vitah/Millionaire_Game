class SocketService {
    constructor() {
        this.socket = null;
        this.callbacks = {};
    }

    connect(onOpenCallback) {
        this.socket = new WebSocket("ws://localhost:8080");
        this.socket.onopen = () => {
            console.log("WebSocket connection established");
            if (onOpenCallback) {
                onOpenCallback();
            }
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received message:", data);
            if (this.callbacks[data.type]) {
                this.callbacks[data.type](data);
                console.log(data.type, data);
            }
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
        };
    }

    on(messageType, callback) {
        this.callbacks[messageType] = callback;
    }

    off(messageType) {
        if (this.callbacks[messageType]) {
            delete this.callbacks[messageType]; 
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export default new SocketService();
const API_URL = 'http://localhost:8080/game';

export const startGame = async (questions) => {
    const gameId = new Date().getTime();
    const response = await fetch(`${API_URL}/start`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ gameId, questions }),
    });
    return response.json();
};

export const getGameState = async (gameId) => {
    const response = await fetch(`${API_URL}/${gameId}`);
    return response.json();
};

export const submitAnswer = async (gameId, answer) => {
    const response = await fetch (`${API_URL}/answer`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ gameId, answer }),
    });
    return response.json();
};
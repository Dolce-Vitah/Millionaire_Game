const API_URL = 'http://localhost:8080/questions';

export const fetchQuestions = async () => {
    const response = await fetch(`${API_URL}`);
    return response.json();
};
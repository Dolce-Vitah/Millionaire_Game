const API_URL = 'http://localhost:8080/lifelines';

export const getLifeline = async (gameId, type) => {
    const response = await fetch(`${API_URL}/${type}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
                  "Access-Control-Allow-Credentials" : true 
        },
        body: JSON.stringify({ gameId }),
    });
    return response.json();
};
const API_URL = 'http://localhost:5000/api';

export const fetchAPI = async (endpoint, options = {}) => {
    const token = localStorage.getItem('jwt_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
    }
    
    return response.json();
};

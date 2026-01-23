// API Helper Functions

const API_BASE = '';

// API request helper (no auth required)
const apiRequest = async (endpoint, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
};

// Go to home page
const goHome = () => {
    window.location.href = '/';
};

// Setup home button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.textContent = '🏠 Home';
        logoutBtn.addEventListener('click', goHome);
    }
});


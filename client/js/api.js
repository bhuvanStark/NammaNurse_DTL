// API Helper Functions

const API_BASE = '';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// Redirect to login if not authenticated
const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = '/caretaker/login.html';
    }
};

// API request helper with auth
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    // Handle unauthorized
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('orgName');
        window.location.href = '/caretaker/login.html';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
};

// Logout
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('orgName');
    window.location.href = '/caretaker/login.html';
};

// Setup logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

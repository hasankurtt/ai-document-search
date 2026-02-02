// API Configuration
const API_CONFIG = {
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8001'                    // Local development
        : 'http://YOUR_EC2_PUBLIC_IP_HERE',          // Production - REPLACE THIS before deploying
    API_PREFIX: '/api/v1',
        // Endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me'
    },
    
    ROOMS: {
        LIST: '/rooms',
        CREATE: '/rooms',
        GET: (id) => `/rooms/${id}`,
        UPDATE: (id) => `/rooms/${id}`,
        DELETE: (id) => `/rooms/${id}`
    },
    
    DOCUMENTS: {
        UPLOAD: (roomId) => `/documents/upload/${roomId}`,
        LIST: (roomId) => `/documents/room/${roomId}`,
        DELETE: (id) => `/documents/${id}`
    },
    
    CHAT: {
        SEND: (roomId) => `/chat/${roomId}`,
        HISTORY: (roomId) => `/chat/history/${roomId}`  // ← EKLENDI
    }
};

// Helper function
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX + endpoint;
}

// Token management
const TokenManager = {
    set(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    },
    
    get() {
        return localStorage.getItem('access_token');
    },
    
    clear() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('chatRooms');
    },
    
    isValid() {
        return !!this.get();
    }
};
// Authentication functions
const Auth = {
    async login(email, password) {
        try {
            const data = await API.post(API_CONFIG.AUTH.LOGIN, {
                email,
                password
            });
            
            // Save tokens
            TokenManager.set(data.access_token, data.refresh_token);
            
            return data;
        } catch (error) {
            throw error;
        }
    },
    
    async register(email, name, password) {
        try {
            const data = await API.post(API_CONFIG.AUTH.REGISTER, {
                email,
                name,
                password
            });
            
            return data;
        } catch (error) {
            throw error;
        }
    },
    
    async getCurrentUser() {
        try {
            return await API.get(API_CONFIG.AUTH.ME);
        } catch (error) {
            throw error;
        }
    },
    
    logout() {
        TokenManager.clear();
        window.location.href = '/login.html';
    },
    
    checkAuth() {
        if (!TokenManager.isValid()) {
            window.location.href = '/login.html';
        }
    }
};

// API Helper - Fetch wrapper with error handling
class API {
    static async request(endpoint, options = {}) {
        const url = getApiUrl(endpoint);
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
        
        // Add auth token if available
        const token = TokenManager.get();
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            // Handle 401 (Unauthorized)
            if (response.status === 401) {
                TokenManager.clear();
                window.location.href = '/login.html';
                throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
            }
            
            // Parse JSON
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Bir hata oluştu');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    
    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }
    
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // File upload (multipart/form-data)
    static async uploadFile(endpoint, file) {
        const url = getApiUrl(endpoint);
        const token = TokenManager.get();
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
        
        return await response.json();
    }
}

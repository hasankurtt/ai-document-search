// API Helper - Fetch wrapper with error handling
class API {
    static async request(endpoint, options = {}) {
        const url = getApiUrl(endpoint);
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

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
                if (token) {
                    TokenManager.clear();
                    window.location.href = '/login.html';
                    throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
                }
                const data = await response.json();
                throw new Error(data.detail || 'Email veya şifre hatalı');
            }

            // Handle 429 (Rate Limit) - BEFORE parsing JSON
            if (response.status === 429) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return { success: true };
            }

            // Parse JSON for other responses
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Bir hata oluştu');
            }

            return data;

        } catch (error) {
            // Always re-throw known custom errors
            if (
                error.message === 'RATE_LIMIT_EXCEEDED' ||
                error.message === 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.' ||
                error.message === 'Email veya şifre hatalı'
            ) {
                throw error;
            }

            // JSON parse errors on empty responses
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                return { success: true };
            }

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

        if (response.status === 429) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        return await response.json();
    }
}
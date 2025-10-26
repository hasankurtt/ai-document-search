// Auth Helper Functions
const AUTH_API_URL = 'http://localhost:5000/api/auth';

// Show error message
function showError(message) {
    alert(message); // Basit alert, daha sonra güzel bir toast yapabiliriz
}

// Check if user is already logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
        // Already logged in, redirect to dashboard
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
        return true;
    }
    return false;
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    checkAuth();
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const loginBtn = e.target.querySelector('.btn-submit');
        const btnText = loginBtn.querySelector('span:first-child');
        
        // Disable button
        loginBtn.disabled = true;
        btnText.innerHTML = '<span class="spinner"></span> Giriş yapılıyor...';
        
        try {
            // TODO: Real API call
            setTimeout(() => {
                const mockUser = {
                    id: 1,
                    name: 'Hasan Kurt',
                    email: email
                };
                const mockToken = 'mock-jwt-token-12345';
                
                // Save to localStorage
                localStorage.setItem('user', JSON.stringify(mockUser));
                localStorage.setItem('token', mockToken);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            showError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            loginBtn.disabled = false;
            btnText.textContent = 'Giriş Yap';
        }
    });
}

// Register Form Handler
if (document.getElementById('registerForm')) {
    checkAuth();
    
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const terms = document.getElementById('termsCheck').checked;
        const kvkk = document.getElementById('kvkkCheck').checked;
        const registerBtn = e.target.querySelector('.btn-submit');
        const btnText = registerBtn.querySelector('span:first-child');
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showError('Lütfen tüm alanları doldurun');
            return;
        }
        
        if (password.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Şifreler eşleşmiyor');
            return;
        }
        
        if (!terms || !kvkk) {
            showError('Kullanım şartlarını ve KVKK\'yı kabul etmelisiniz');
            return;
        }
        
        // Disable button
        registerBtn.disabled = true;
        btnText.innerHTML = '<span class="spinner"></span> Hesap oluşturuluyor...';
        
        try {
            // TODO: Real API call
            setTimeout(() => {
                const mockUser = {
                    id: 1,
                    name: name,
                    email: email
                };
                const mockToken = 'mock-jwt-token-12345';
                
                // Save to localStorage
                localStorage.setItem('user', JSON.stringify(mockUser));
                localStorage.setItem('token', mockToken);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            showError('Kayıt başarısız. Lütfen tekrar deneyin.');
            registerBtn.disabled = false;
            btnText.textContent = 'Kayıt Ol';
        }
    });
}

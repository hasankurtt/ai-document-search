// Check authentication
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Display user info
    const userData = JSON.parse(user);
    document.getElementById('userName').textContent = userData.name;
    
    // Fill profile form
    document.getElementById('profileName').value = userData.name;
    document.getElementById('profileEmail').value = userData.email;
    
    // Mock stats
    document.getElementById('totalDocuments').textContent = '12';
    document.getElementById('totalSearches').textContent = '47';
    document.getElementById('memberSince').textContent = 'Eki 2025';
    
    return true;
}

checkAuth();

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Profile Tabs
const profileTabButtons = document.querySelectorAll('.profile-tab-btn');
const profileTabContents = document.querySelectorAll('.profile-tab-content');

profileTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Remove active class from all
        profileTabButtons.forEach(btn => btn.classList.remove('active'));
        profileTabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked
        button.classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    });
});

// Account Form Submit
document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value;
    
    // TODO: API call to update profile
    
    // Update localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update display
    document.getElementById('userName').textContent = name;
    
    alert('✅ Profil bilgileri güncellendi!');
});

// Password Form Submit
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validation
    if (newPassword.length < 6) {
        alert('❌ Yeni şifre en az 6 karakter olmalıdır');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        alert('❌ Yeni şifreler eşleşmiyor');
        return;
    }
    
    // TODO: API call to update password
    
    alert('✅ Şifreniz başarıyla güncellendi!');
    
    // Clear form
    document.getElementById('passwordForm').reset();
});

// Preferences Form Submit
document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const marketingEmails = document.getElementById('marketingEmails').checked;
    
    // TODO: API call to update preferences
    
    alert('✅ Tercihleriniz kaydedildi!');
});

// Password Toggle Functions
function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    const icon = toggle.querySelector('span');
    
    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = '🙈';
        } else {
            input.type = 'password';
            icon.textContent = '👁️';
        }
    });
}

setupPasswordToggle('currentPasswordToggle', 'currentPassword');
setupPasswordToggle('newPasswordToggle', 'newPassword');
setupPasswordToggle('confirmNewPasswordToggle', 'confirmNewPassword');

// Danger Zone Functions
function confirmDeleteDocuments() {
    const confirmed = confirm('⚠️ Tüm dokümanlarınız kalıcı olarak silinecek. Emin misiniz?');
    if (confirmed) {
        // TODO: API call to delete all documents
        alert('✅ Tüm dokümanlar silindi');
    }
}

function confirmDeleteAccount() {
    const confirmed = confirm('⚠️ UYARI: Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz!\n\nDevam etmek istediğinize emin misiniz?');
    if (confirmed) {
        const doubleCheck = confirm('⚠️ SON UYARI: Hesabınızı gerçekten silmek istiyor musunuz?');
        if (doubleCheck) {
            // TODO: API call to delete account
            localStorage.clear();
            alert('Hesabınız silindi. Görüşmek üzere!');
            window.location.href = 'login.html';
        }
    }
}

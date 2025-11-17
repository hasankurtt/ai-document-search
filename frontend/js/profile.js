console.log('🚀 Profile.js loaded');

// Check auth
Auth.checkAuth();

// Load user info
async function loadUserInfo() {
    try {
        console.log('👤 Loading user info...');
        const user = await Auth.getCurrentUser();
        console.log('✅ User loaded:', user);
        
        document.getElementById('userName').textContent = user.name;
        document.getElementById('profileName').value = user.name;
        document.getElementById('profileEmail').value = user.email;
    } catch (error) {
        console.error('❌ Error loading user:', error);
        Auth.logout();
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    console.log('🚪 Logging out...');
    Auth.logout();
});

// Tab switching
const tabBtns = document.querySelectorAll('.profile-tab-btn');
const tabContents = document.querySelectorAll('.profile-tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

// Load on page load
loadUserInfo();

console.log('✅ Profile initialized');

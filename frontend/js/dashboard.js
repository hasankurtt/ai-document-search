console.log('🚀 Dashboard.js loaded');

// Check auth
console.log('🔐 Checking auth...');
console.log('Token:', TokenManager.get());

if (!TokenManager.isValid()) {
    console.log('❌ No valid token, redirecting to login...');
    window.location.href = 'login.html';
    throw new Error('No auth'); // Stop execution
}

console.log('✅ Token valid, loading dashboard...');

// Load user info from backend
async function loadUserInfo() {
    try {
        console.log('👤 Loading user info...');
        const user = await Auth.getCurrentUser();
        console.log('✅ User loaded:', user);
        document.getElementById('userName').textContent = user.name;
    } catch (error) {
        console.error('❌ Error loading user:', error);
        alert('Kullanıcı bilgileri yüklenemedi: ' + error.message);
        Auth.logout();
    }
}

// Load rooms from backend
async function loadRooms() {
    try {
        console.log('🏠 Loading rooms from backend...');
        const rooms = await API.get(API_CONFIG.ROOMS.LIST);
        console.log('✅ Rooms loaded:', rooms);
        
        const roomsGrid = document.getElementById('roomsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (rooms.length === 0) {
            roomsGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            roomsGrid.innerHTML = rooms.map(room => `
                <div class="room-card" onclick="openRoom(${room.id})">
                    <div class="room-card-header">
                        <div class="room-card-emoji">${room.emoji}</div>
                        <button class="room-menu-btn" onclick="event.stopPropagation(); deleteRoom(${room.id})">
                            🗑️
                        </button>
                    </div>
                    <h3 class="room-card-title">${room.name}</h3>
                    <p class="room-card-description">${room.description || 'Açıklama yok'}</p>
                    <div class="room-card-stats">
                        <div class="room-card-stat">
                            <span>📄</span>
                            <span>${room.document_count || 0} doküman</span>
                        </div>
                        <div class="room-card-stat">
                            <span>💬</span>
                            <span>${room.message_count || 0} mesaj</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('❌ Error loading rooms:', error);
        alert('Odalar yüklenirken hata: ' + error.message);
    }
}

// Create room
const createRoomForm = document.getElementById('createRoomForm');
if (createRoomForm) {
    createRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('roomName').value;
        const description = document.getElementById('roomDescription').value;
        const emoji = document.getElementById('roomEmoji').value;
        
        console.log('📝 Creating room:', { name, description, emoji });
        
        try {
            const room = await API.post(API_CONFIG.ROOMS.CREATE, { name, description, emoji });
            console.log('✅ Room created:', room);
            
            closeCreateRoomModal();
            createRoomForm.reset();
            document.getElementById('roomEmoji').value = '📚';
            const emojiDisplay = document.getElementById('selectedEmojiDisplay');
            if (emojiDisplay) emojiDisplay.textContent = '📚';
            
            loadRooms();
        } catch (error) {
            console.error('❌ Error creating room:', error);
            alert('Oda oluşturulurken hata: ' + error.message);
        }
    });
}

// Delete room
async function deleteRoom(roomId) {
    if (!confirm('Bu odayı silmek istediğinizden emin misiniz?')) return;
    
    try {
        console.log('🗑️ Deleting room:', roomId);
        await API.delete(API_CONFIG.ROOMS.DELETE(roomId));
        console.log('✅ Room deleted');
        loadRooms();
    } catch (error) {
        console.error('❌ Error deleting room:', error);
        alert('Oda silinirken hata: ' + error.message);
    }
}

// Open room
function openRoom(roomId) {
    console.log('🚪 Opening room:', roomId);
    window.location.href = `room.html?id=${roomId}`;
}

// Modal functions
function openCreateRoomModal() {
    document.getElementById('createRoomModal').classList.remove('hidden');
}

function closeCreateRoomModal() {
    document.getElementById('createRoomModal').classList.add('hidden');
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        console.log('🚪 Logging out...');
        Auth.logout();
    });
}

const createRoomBtn = document.getElementById('createRoomBtn');
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', openCreateRoomModal);
}

// Emoji picker
const emojis = ['📚', '💼', '��', '🎨', '🏥', '💡', '🎓', '🏢', '🎯', '📊', '🗂️', '📝', '🔖', '📌', '⭐', '✨', '🚀', '💻', '📱', '🌍'];
const emojiGrid = document.getElementById('emojiGrid');
if (emojiGrid) {
    emojiGrid.innerHTML = emojis.map(emoji => `
        <div class="emoji-item" onclick="selectEmoji('${emoji}')">${emoji}</div>
    `).join('');
}

function selectEmoji(emoji) {
    document.getElementById('roomEmoji').value = emoji;
    const emojiDisplay = document.getElementById('selectedEmojiDisplay');
    if (emojiDisplay) emojiDisplay.textContent = emoji;
    
    const picker = document.getElementById('emojiPickerContainer');
    if (picker) picker.classList.add('hidden');
}

function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPickerContainer');
    if (picker) picker.classList.toggle('hidden');
}

// Load on page load
console.log('🎯 Initializing dashboard...');
loadUserInfo();
loadRooms();

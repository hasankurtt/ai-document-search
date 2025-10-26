// Premium emoji collections - GENİŞLETİLMİŞ
const emojiCollections = {
    education: [
        '📚', '📖', '📝', '✏️', '📕', '📗', '📘', '📙', '📓', '📔',
        '🎓', '🎯', '📊', '📈', '📉', '🗂️', '📋', '📌', '📍', '🔖',
        '🧮', '📐', '📏', '✂️', '🖊️', '🖍️', '🖌️', '🔬', '🔭', '⚗️',
        '📚', '��', '🎒', '✍️', '📑', '📄', '📃', '🗃️', '🗄️', '��'
    ],
    work: [
        '💼', '👔', '💻', '⌨️', '🖥️', '📱', '☎️', '📞', '📠', '🗃️',
        '📂', '📁', '📄', '📃', '📑', '🗒️', '📇', '📊', '📈', '📉',
        '💰', '💵', '💴', '💶', '💷', '💳', '🏢', '🏦', '🏭', '⚖️',
        '🔨', '🔧', '⚙️', '🛠️', '📋', '📌', '📍', '✅', '📝', '🗓️'
    ],
    science: [
        '🔬', '🔭', '⚗️', '🧪', '🧬', '🦠', '💉', '🩺', '🌡️', '🧲',
        '⚛️', '🔆', '💡', '🔋', '🔌', '💻', '🖥️', '⚙️', '🛠️', '🔧',
        '🌍', '🌎', '🌏', '🪐', '🌙', '⭐', '✨', '⚡', '🔥', '💧',
        '🧫', '🦴', '🧠', '🫀', '🫁', '🌋', '🏔️', '🌊', '☄️', '🌠'
    ],
    creative: [
        '🎨', '🖌️', '🖍️', '✏️', '��', '🎬', '🎪', '🎸', '🎹', '🎺',
        '🎻', '��', '🎤', '🎧', '📻', '📷', '📸', '📹', '🎥', '📽️',
        '🎮', '🎯', '🎲', '🎰', '🎳', '♟️', '🧩', '🪀', '🪁', '🎈',
        '🎉', '🎊', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️'
    ],
    health: [
        '🏥', '⚕️', '🩺', '💊', '💉', '��', '🩼', '🦷', '🧬', '🔬',
        '❤️', '🫀', '��', '🧠', '🦴', '👁️', '🦻', '👃', '👄', '🫂',
        '🏃', '🚴', '🏋️', '🤸', '🧘', '🥗', '🥤', '��', '🥦', '🥕',
        '💪', '🧘‍♀️', '🧘‍♂️', '��', '🏃‍♀️', '🏃‍♂️', '🤾', '⛹️', '🏊', '🚵'
    ],
    other: [
        '⭐', '✨', '💫', '🌟', '⚡', '🔥', '💥', '💢', '💬', '💭',
        '🎯', '🎪', '🎭', '🎨', '🎬', '🎮', '🎲', '🎰', '🎳', '🎯',
        '🌈', '☀️', '🌙', '⭐', '💎', '🔮', '🎁', '🎀', '🎊', '🎉',
        '🚀', '🛸', '🌌', '🔱', '♠️', '♥️', '♦️', '♣️', '🃏', '🎴'
    ]
};

// All emojis flattened
const allEmojis = Object.values(emojiCollections).flat();

let selectedEmoji = '📚';
let currentCategory = 'all';

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = 'login.html';
        return false;
    }
    
    const userData = JSON.parse(user);
    document.getElementById('userName').textContent = userData.name;
    
    return true;
}

checkAuth();

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Load rooms from localStorage
function loadRooms() {
    const rooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
    const roomsGrid = document.getElementById('roomsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (rooms.length === 0) {
        roomsGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    roomsGrid.innerHTML = rooms.map(room => `
        <div class="room-card" onclick="openRoom('${room.id}')">
            <div class="room-card-header">
                <div class="room-card-emoji">${room.emoji}</div>
                <button class="room-menu-btn" onclick="event.stopPropagation(); showRoomMenu('${room.id}')">
                    ⋮
                </button>
            </div>
            <h3 class="room-card-title">${room.name}</h3>
            <p class="room-card-description">${room.description || 'Açıklama yok'}</p>
            <div class="room-card-stats">
                <div class="room-card-stat">
                    <span>📄</span>
                    <span>${room.documents?.length || 0} doküman</span>
                </div>
                <div class="room-card-stat">
                    <span>💬</span>
                    <span>${room.messages?.length || 0} mesaj</span>
                </div>
            </div>
            <div class="room-card-date">
                Son güncelleme: ${new Date(room.updatedAt).toLocaleDateString('tr-TR')}
            </div>
        </div>
    `).join('');
}

// Open room
function openRoom(roomId) {
    window.location.href = `room.html?id=${roomId}`;
}

// Create room modal
const createRoomModal = document.getElementById('createRoomModal');
const createRoomBtn = document.getElementById('createRoomBtn');
const createRoomForm = document.getElementById('createRoomForm');

createRoomBtn.addEventListener('click', () => {
    createRoomModal.classList.remove('hidden');
    selectedEmoji = '📚';
    document.getElementById('selectedEmojiDisplay').textContent = selectedEmoji;
    document.getElementById('roomEmoji').value = selectedEmoji;
});

function closeCreateRoomModal() {
    createRoomModal.classList.add('hidden');
    createRoomForm.reset();
    document.getElementById('emojiPickerContainer').classList.add('hidden');
    selectedEmoji = '📚';
}

// Toggle emoji picker
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPickerContainer');
    picker.classList.toggle('hidden');
    
    if (!picker.classList.contains('hidden')) {
        loadEmojiGrid('all');
        setupEmojiSearch();
        setupEmojiTabs();
    }
}

// Setup emoji tabs
function setupEmojiTabs() {
    const tabs = document.querySelectorAll('.emoji-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-category');
            loadEmojiGrid(category);
        });
    });
}

// Setup emoji search
function setupEmojiSearch() {
    const searchInput = document.getElementById('emojiSearch');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query === '') {
            loadEmojiGrid(currentCategory);
        } else {
            filterEmojis(query);
        }
    });
}

// Filter emojis by search
function filterEmojis(query) {
    const grid = document.getElementById('emojiGrid');
    const filtered = allEmojis.filter(emoji => {
        // Simple filter - in real app you'd have emoji names/tags
        return true; // For now show all, you can add emoji names mapping
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Emoji bulunamadı</p>';
    } else {
        renderEmojis(filtered);
    }
}

// Load emoji grid
function loadEmojiGrid(category) {
    currentCategory = category;
    const emojis = category === 'all' ? allEmojis : emojiCollections[category] || allEmojis;
    renderEmojis(emojis);
}

// Render emojis
function renderEmojis(emojis) {
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = emojis.map(emoji => `
        <button type="button" class="emoji-item ${emoji === selectedEmoji ? 'selected' : ''}" data-emoji="${emoji}">
            ${emoji}
        </button>
    `).join('');
    
    // Add click listeners
    grid.querySelectorAll('.emoji-item').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedEmoji = btn.getAttribute('data-emoji');
            document.getElementById('selectedEmojiDisplay').textContent = selectedEmoji;
            document.getElementById('roomEmoji').value = selectedEmoji;
            
            // Update selected state
            grid.querySelectorAll('.emoji-item').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Close picker
            setTimeout(() => {
                document.getElementById('emojiPickerContainer').classList.add('hidden');
            }, 200);
        });
    });
}

// Create room form submit
createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('roomName').value;
    const description = document.getElementById('roomDescription').value;
    const emoji = selectedEmoji;
    
    const rooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
    
    const newRoom = {
        id: Date.now().toString(),
        name,
        description,
        emoji,
        documents: [],
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    rooms.push(newRoom);
    localStorage.setItem('chatRooms', JSON.stringify(rooms));
    
    closeCreateRoomModal();
    loadRooms();
});

// Room menu
function showRoomMenu(roomId) {
    const confirmed = confirm('Bu odayı silmek istiyor musunuz?');
    if (confirmed) {
        deleteRoom(roomId);
    }
}

function deleteRoom(roomId) {
    const rooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
    const filteredRooms = rooms.filter(room => room.id !== roomId);
    localStorage.setItem('chatRooms', JSON.stringify(filteredRooms));
    loadRooms();
}

// Initial load
loadRooms();

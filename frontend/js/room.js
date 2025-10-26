// Premium emoji collections
const emojiCollections = {
    education: [
        '📚', '📖', '📝', '✏️', '📕', '📗', '📘', '📙', '📓', '📔',
        '🎓', '🎯', '📊', '📈', '📉', '🗂️', '📋', '📌', '📍', '🔖',
        '🧮', '📐', '📏', '✂️', '🖊️', '🖍️', '🖌️', '🔬', '🔭', '⚗️',
        '📚', '🏫', '🎒', '✍️', '📑', '📄', '📃', '🗃️', '🗄️', '📇'
    ],
    work: [
        '💼', '👔', '💻', '⌨️', '🖥️', '📱', '☎️', '📞', '📠', '🗃️',
        '📂', '📁', '📄', '📃', '📑', '🗒️', '📇', '📊', '📈', '📉',
        '��', '💵', '💴', '💶', '💷', '💳', '🏢', '🏦', '🏭', '⚖️',
        '🔨', '🔧', '⚙️', '🛠️', '📋', '📌', '📍', '✅', '📝', '🗓️'
    ],
    science: [
        '🔬', '🔭', '⚗️', '🧪', '🧬', '🦠', '💉', '��', '🌡️', '🧲',
        '⚛️', '🔆', '💡', '🔋', '🔌', '💻', '🖥️', '⚙️', '🛠️', '🔧',
        '🌍', '🌎', '🌏', '🪐', '🌙', '⭐', '✨', '⚡', '🔥', '💧',
        '🧫', '🦴', '🧠', '🫀', '🫁', '🌋', '🏔️', '🌊', '☄️', '🌠'
    ],
    creative: [
        '🎨', '🖌️', '🖍️', '✏️', '🎭', '🎬', '🎪', '🎸', '🎹', '🎺',
        '🎻', '🥁', '🎤', '🎧', '📻', '📷', '📸', '📹', '🎥', '📽️',
        '🎮', '🎯', '🎲', '🎰', '🎳', '♟️', '🧩', '🪀', '🪁', '🎈',
        '🎉', '🎊', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️'
    ],
    health: [
        '🏥', '⚕️', '🩺', '💊', '💉', '🩹', '🩼', '🦷', '🧬', '🔬',
        '❤️', '🫀', '🫁', '🧠', '🦴', '👁️', '🦻', '👃', '👄', '🫂',
        '🏃', '🚴', '🏋️', '🤸', '🧘', '🥗', '🥤', '🍎', '🥦', '🥕',
        '💪', '🧘‍♀️', '🧘‍♂️', '🚶', '🏃‍♀️', '🏃‍♂️', '🤾', '⛹️', '🏊', '🚵'
    ],
    other: [
        '⭐', '✨', '💫', '🌟', '⚡', '🔥', '💥', '💢', '💬', '💭',
        '🎯', '🎪', '🎭', '🎨', '🎬', '🎮', '🎲', '🎰', '🎳', '🎯',
        '🌈', '☀️', '🌙', '⭐', '💎', '🔮', '🎁', '🎀', '🎊', '🎉',
        '🚀', '🛸', '🌌', '🔱', '♠️', '♥️', '♦️', '♣️', '🃏', '🎴'
    ]
};

const allEmojis = Object.values(emojiCollections).flat();

let selectedEmojiSettings = '📚';
let currentCategorySettings = 'all';

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

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id');

if (!roomId) {
    window.location.href = 'dashboard.html';
}

// Load room data
let currentRoom = null;

function loadRoom() {
    const rooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
    currentRoom = rooms.find(room => room.id === roomId);
    
    if (!currentRoom) {
        alert('Oda bulunamadı');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Update room info
    document.getElementById('roomEmoji').textContent = currentRoom.emoji;
    document.getElementById('roomName').textContent = currentRoom.name;
    document.getElementById('roomDescription').textContent = currentRoom.description || 'Açıklama yok';
    document.getElementById('docCount').textContent = currentRoom.documents?.length || 0;
    document.getElementById('chatCount').textContent = currentRoom.messages?.length || 0;
    
    // Load documents
    loadDocuments();
    
    // Load messages
    loadMessages();
}

// Load documents
function loadDocuments() {
    const documentsList = document.getElementById('documentsList');
    
    if (!currentRoom.documents || currentRoom.documents.length === 0) {
        documentsList.innerHTML = `
            <div class="empty-docs">
                <p>Henüz doküman yok</p>
                <small>Dosyaları yukarıdaki alana sürükleyin</small>
            </div>
        `;
        return;
    }
    
    documentsList.innerHTML = currentRoom.documents.map(doc => `
        <div class="document-item">
            <div class="doc-icon">📄</div>
            <div class="doc-info">
                <div class="doc-name">${doc.name}</div>
                <div class="doc-size">${doc.size}</div>
            </div>
            <button class="btn-icon-small" onclick="deleteDocument('${doc.id}')" title="Sil">
                🗑️
            </button>
        </div>
    `).join('');
}

// Load messages
function loadMessages() {
    const chatMessages = document.getElementById('chatMessages');
    
    if (!currentRoom.messages || currentRoom.messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">👋</div>
                <h3>Hoş Geldiniz!</h3>
                <p>Bu odaya özel dokümanlar yükleyin ve sorularınızı sorun. AI sizin için dokümanlarınızı analiz edecek ve cevaplar bulacak.</p>
            </div>
        `;
        return;
    }
    
    chatMessages.innerHTML = currentRoom.messages.map(msg => {
        if (msg.type === 'user') {
            return `
                <div class="message user-message">
                    <div class="message-content">${msg.content}</div>
                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        } else {
            return `
                <div class="message ai-message">
                    <div class="message-header">
                        <span class="ai-badge">✨ AI</span>
                    </div>
                    <div class="message-content">${msg.content}</div>
                    ${msg.sources ? `
                        <div class="message-sources">
                            <strong>Kaynaklar:</strong>
                            ${msg.sources.map(src => `
                                <div class="source-tag">📄 ${src.name} (Sayfa ${src.page})</div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        }
    }).join('');
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    sendMessage();
});

// Send message function
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    if (!currentRoom.documents || currentRoom.documents.length === 0) {
        alert('Önce doküman yüklemelisiniz!');
        return;
    }
    
    // Add user message
    currentRoom.messages = currentRoom.messages || [];
    currentRoom.messages.push({
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Update UI
    loadMessages();
    
    // Simulate AI response
    setTimeout(() => {
        currentRoom.messages.push({
            type: 'ai',
            content: 'Bu örnek bir AI yanıtıdır. Backend entegrasyonu yapıldığında gerçek cevaplar gelecek.',
            sources: [
                { name: currentRoom.documents[0].name, page: 5 }
            ],
            timestamp: new Date().toISOString()
        });
        
        saveRoom();
        loadMessages();
    }, 1500);
    
    saveRoom();
}

// Handle Enter key press
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        sendMessage();
    }
    // Shift+Enter will naturally create a new line
});

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// ===== DRAG & DROP =====
const dragDropArea = document.getElementById('dragDropArea');
const fileInputSidebar = document.getElementById('fileInputSidebar');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dragDropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dragDropArea.addEventListener(eventName, () => {
        dragDropArea.classList.add('drag-active');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dragDropArea.addEventListener(eventName, () => {
        dragDropArea.classList.remove('drag-active');
    });
});

dragDropArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInputSidebar.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['pdf', 'doc', 'docx', 'txt'].includes(ext);
    });
    
    if (validFiles.length === 0) {
        alert('Lütfen geçerli dosya formatı seçin (PDF, DOC, DOCX, TXT)');
        return;
    }
    
    validFiles.forEach(file => {
        const newDoc = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            uploadedAt: new Date().toISOString()
        };
        
        currentRoom.documents = currentRoom.documents || [];
        currentRoom.documents.push(newDoc);
    });
    
    saveRoom();
    loadDocuments();
    fileInputSidebar.value = '';
    showNotification(`${validFiles.length} doküman yüklendi!`);
}

document.getElementById('uploadDocBtn').addEventListener('click', () => {
    fileInputSidebar.click();
});

function deleteDocument(docId) {
    if (!confirm('Bu dokümanı silmek istediğinize emin misiniz?')) return;
    
    currentRoom.documents = currentRoom.documents.filter(doc => doc.id !== docId);
    saveRoom();
    loadDocuments();
    showNotification('Doküman silindi');
}

// ===== ROOM SETTINGS =====
const roomSettingsModal = document.getElementById('roomSettingsModal');
const roomSettingsBtn = document.getElementById('roomSettingsBtn');
const roomSettingsForm = document.getElementById('roomSettingsForm');

roomSettingsBtn.addEventListener('click', () => {
    document.getElementById('editRoomName').value = currentRoom.name;
    document.getElementById('editRoomDescription').value = currentRoom.description || '';
    selectedEmojiSettings = currentRoom.emoji;
    document.getElementById('selectedEmojiDisplaySettings').textContent = currentRoom.emoji;
    document.getElementById('editRoomEmoji').value = currentRoom.emoji;
    
    roomSettingsModal.classList.remove('hidden');
});

function closeRoomSettingsModal() {
    roomSettingsModal.classList.add('hidden');
    document.getElementById('emojiPickerContainerSettings').classList.add('hidden');
}

roomSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    currentRoom.name = document.getElementById('editRoomName').value;
    currentRoom.description = document.getElementById('editRoomDescription').value;
    currentRoom.emoji = selectedEmojiSettings;
    
    saveRoom();
    loadRoom();
    closeRoomSettingsModal();
    showNotification('Oda ayarları güncellendi!');
});

// Toggle emoji picker for settings
function toggleEmojiPickerSettings() {
    const picker = document.getElementById('emojiPickerContainerSettings');
    picker.classList.toggle('hidden');
    
    if (!picker.classList.contains('hidden')) {
        loadEmojiGridSettings('all');
        setupEmojiSearchSettings();
        setupEmojiTabsSettings();
    }
}

function setupEmojiTabsSettings() {
    const tabs = document.querySelectorAll('.emoji-tab-settings');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-category');
            loadEmojiGridSettings(category);
        });
    });
}

function setupEmojiSearchSettings() {
    const searchInput = document.getElementById('emojiSearchSettings');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query === '') {
            loadEmojiGridSettings(currentCategorySettings);
        }
    });
}

function loadEmojiGridSettings(category) {
    currentCategorySettings = category;
    const emojis = category === 'all' ? allEmojis : emojiCollections[category] || allEmojis;
    renderEmojisSettings(emojis);
}

function renderEmojisSettings(emojis) {
    const grid = document.getElementById('emojiGridSettings');
    grid.innerHTML = emojis.map(emoji => `
        <button type="button" class="emoji-item ${emoji === selectedEmojiSettings ? 'selected' : ''}" data-emoji="${emoji}">
            ${emoji}
        </button>
    `).join('');
    
    grid.querySelectorAll('.emoji-item').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedEmojiSettings = btn.getAttribute('data-emoji');
            document.getElementById('selectedEmojiDisplaySettings').textContent = selectedEmojiSettings;
            document.getElementById('editRoomEmoji').value = selectedEmojiSettings;
            
            grid.querySelectorAll('.emoji-item').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            setTimeout(() => {
                document.getElementById('emojiPickerContainerSettings').classList.add('hidden');
            }, 200);
        });
    });
}

function saveRoom() {
    const rooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
    const index = rooms.findIndex(room => room.id === roomId);
    
    if (index !== -1) {
        currentRoom.updatedAt = new Date().toISOString();
        rooms[index] = currentRoom;
        localStorage.setItem('chatRooms', JSON.stringify(rooms));
        
        document.getElementById('docCount').textContent = currentRoom.documents?.length || 0;
        document.getElementById('chatCount').textContent = currentRoom.messages?.length || 0;
    }
}

document.getElementById('deleteRoomBtn').addEventListener('click', () => {
    if (!confirm('Bu odayı ve tüm içeriğini silmek istediğinize emin misiniz?')) return;
    if (!confirm('Bu işlem geri alınamaz! Emin misiniz?')) return;
    
    const rooms = JSON.parse(localStorage.getItem('chatRooms') || '[]');
    const filteredRooms = rooms.filter(room => room.id !== roomId);
    localStorage.setItem('chatRooms', JSON.stringify(filteredRooms));
    
    window.location.href = 'dashboard.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification-toast';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 100);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

loadRoom();

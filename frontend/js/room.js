console.log('🚀 Room.js loaded');

// Check auth
Auth.checkAuth();

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id');

console.log('🏠 Room ID:', roomId);

if (!roomId) {
    alert('Oda ID bulunamadı!');
    window.location.href = 'dashboard.html';
}

// Load room info
async function loadRoomInfo() {
    try {
        console.log('📡 Loading room info...');
        const room = await API.get(API_CONFIG.ROOMS.GET(roomId));
        console.log('✅ Room loaded:', room);
        
        document.getElementById('roomEmoji').textContent = room.emoji;
        document.getElementById('roomName').textContent = room.name;
        document.getElementById('roomDescription').textContent = room.description || 'Açıklama yok';
        document.getElementById('docCount').textContent = room.document_count || 0;
        document.getElementById('chatCount').textContent = room.message_count || 0;
    } catch (error) {
        console.error('❌ Error loading room:', error);
        alert('Oda bilgileri yüklenemedi');
        window.location.href = 'dashboard.html';
    }
}

// Load user name
async function loadUserInfo() {
    try {
        const user = await Auth.getCurrentUser();
        document.getElementById('userName').textContent = user.name;
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// Load documents
async function loadDocuments() {
    try {
        console.log('📄 Loading documents...');
        const documents = await API.get(API_CONFIG.DOCUMENTS.LIST(roomId));
        console.log('✅ Documents loaded:', documents);
        
        const docList = document.getElementById('documentsList');
        
        if (documents.length === 0) {
            docList.innerHTML = '<p style="padding: 10px; text-align: center; color: #999;">Henüz doküman yok</p>';
        } else {
            docList.innerHTML = documents.map(doc => `
                <div class="document-item" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                        <div>${doc.processed ? '✅' : '⏳'}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${doc.filename}</div>
                            <div style="font-size: 12px; color: #999;">${doc.processed ? 'İşlendi' : 'İşleniyor...'}</div>
                        </div>
                    </div>
                    <button onclick="deleteDocument(${doc.id})" style="background: none; border: none; cursor: pointer; font-size: 18px;">🗑️</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('❌ Error loading documents:', error);
    }
}

// Upload document
const fileInput = document.getElementById('fileInputSidebar');
if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        
        for (let file of files) {
            try {
                console.log('📤 Uploading:', file.name);
                const response = await API.uploadFile(API_CONFIG.DOCUMENTS.UPLOAD(roomId), file);
                console.log('✅ Uploaded:', file.name, 'Document ID:', response.id);
                
                // Listeyi hemen güncelle
                loadDocuments();
                loadRoomInfo();
                
                // Polling başlat - işlenme durumunu kontrol et
                startDocumentProcessingPoll(response.id);
                
            } catch (error) {
                console.error('❌ Upload error:', error);
                alert(`${file.name} yüklenirken hata: ${error.message}`);
            }
        }
        
        e.target.value = '';
    });
}

// Document processing polling - her 3 saniyede bir kontrol et
let processingPolls = new Map(); // docId -> intervalId

function startDocumentProcessingPoll(docId) {
    // Eğer zaten polling yapılıyorsa, durdur
    if (processingPolls.has(docId)) {
        clearInterval(processingPolls.get(docId));
    }
    
    console.log(`🔄 Starting polling for document ${docId}`);
    
    // Her 3 saniyede bir kontrol et
    const intervalId = setInterval(async () => {
        try {
            const documents = await API.get(API_CONFIG.DOCUMENTS.LIST(roomId));
            const doc = documents.find(d => d.id === docId);
            
            if (doc && doc.processed) {
                console.log(`✅ Document ${docId} processed!`);
                // İşlendi, polling'i durdur
                clearInterval(intervalId);
                processingPolls.delete(docId);
                
                // Listeyi güncelle
                loadDocuments();
                loadRoomInfo();
                
                // Başarı bildirimi (opsiyonel)
                showNotification(`${doc.filename} başarıyla işlendi! ✅`);
            }
        } catch (error) {
            console.error('Polling error:', error);
            // Hata olursa polling'i durdur
            clearInterval(intervalId);
            processingPolls.delete(docId);
        }
    }, 3000); // 3 saniyede bir
    
    processingPolls.set(docId, intervalId);
    
    // 2 dakika sonra otomatik olarak durdur (timeout)
    setTimeout(() => {
        if (processingPolls.has(docId)) {
            console.log(`⏱️ Polling timeout for document ${docId}`);
            clearInterval(processingPolls.get(docId));
            processingPolls.delete(docId);
        }
    }, 120000); // 2 dakika
}

// Bildirim göster (opsiyonel)
function showNotification(message) {
    // Basit bir toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS animasyonları (head'e ekle)
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Sayfa kapatılırken tüm polling'leri temizle
window.addEventListener('beforeunload', () => {
    processingPolls.forEach((intervalId) => clearInterval(intervalId));
    processingPolls.clear();
});

// Upload button
const uploadBtn = document.getElementById('uploadDocBtn');
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
}

// Delete document
async function deleteDocument(docId) {
    if (!confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) return;
    
    try {
        console.log('🗑️ Deleting document:', docId);
        await API.delete(API_CONFIG.DOCUMENTS.DELETE(docId));
        console.log('✅ Document deleted');
        alert('Döküman başarıyla silindi!');
        loadDocuments();
        loadRoomInfo();
    } catch (error) {
        console.error('❌ Error deleting document:', error);
        // Daha detaylı hata mesajı göster
        if (error.message.includes('pattern')) {
            alert('Döküman silindi ancak vektör temizliğinde sorun oluştu. Sayfa yenilenecek.');
        } else {
            alert('Döküman silinirken hata: ' + error.message);
        }
        // Hata olsa bile listeyi yenile
        loadDocuments();
        loadRoomInfo();
    }
}

// Delete room
const deleteRoomBtn = document.getElementById('deleteRoomBtn');
if (deleteRoomBtn) {
    deleteRoomBtn.addEventListener('click', async () => {
        if (!confirm('Bu odayı silmek istediğinizden emin misiniz? Tüm dokümanlar ve mesajlar silinecek!')) return;
        
        try {
            console.log('🗑️ Deleting room:', roomId);
            await API.delete(API_CONFIG.ROOMS.DELETE(roomId));
            console.log('✅ Room deleted');
            alert('Oda silindi!');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('❌ Error deleting room:', error);
            alert('Oda silinirken hata: ' + error.message);
        }
    });
}

// Load chat history from database
async function loadChatHistory() {
    try {
        console.log('📜 Loading chat history from database...');
        const history = await API.get(API_CONFIG.CHAT.HISTORY(roomId));
        console.log('✅ Chat history loaded:', history.length, 'messages');
        
        history.forEach(msg => {
            addMessage(msg.message_type, msg.content, false, msg.sources || []);
        });
    } catch (error) {
        console.error('❌ Error loading chat history:', error);
    }
}

// Send chat message
const chatForm = document.getElementById('chatForm');
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const input = document.getElementById('chatInput');
        const question = input.value.trim();
        
        if (!question) return;
        
        console.log('💬 Sending message:', question);
        
        // Add user message to UI (geçici - backend'den tekrar gelecek)
        addMessage('user', question);
        input.value = '';
        
        // Show loading
        const loadingId = addMessage('ai', 'Düşünüyorum...', true);
        
        try {
            const response = await API.post(API_CONFIG.CHAT.SEND(roomId), { question });
            console.log('✅ AI response:', response);
            
            // Remove loading, add AI response
            document.getElementById(loadingId).remove();
            addMessage('ai', response.answer, false, response.sources);
            
        } catch (error) {
            console.error('❌ Chat error:', error);
            document.getElementById(loadingId).remove();
            const errorMsg = 'Üzgünüm, bir hata oluştu: ' + error.message;
            addMessage('ai', errorMsg);
        }
    });
}

// Add message to chat - DÜZELTİLDİ
let messageIdCounter = 0;
function addMessage(type, content, isLoading = false, sources = []) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageId = `msg-${messageIdCounter++}`;
    
    // Renk değerleri
    const userBg = '#667eea';
    const userColor = '#ffffff';
    const aiBg = '#f5f5f5';
    const aiColor = '#1a202c';  // Daha koyu renk
    
    const messageHtml = `
        <div id="${messageId}" class="chat-message ${type}-message" style="margin-bottom: 15px; padding: 15px; border-radius: 10px; ${type === 'user' ? `background: ${userBg}; color: ${userColor};` : `background: ${aiBg}; color: ${aiColor} !important;`} margin-left: ${type === 'user' ? 'auto' : '0'}; max-width: 70%;">
            <div style="font-weight: 500; margin-bottom: 5px; color: ${type === 'user' ? userColor : '#4a5568'};">${type === 'user' ? 'Siz' : 'AI Asistan'}</div>
            <div style="line-height: 1.5; color: ${type === 'user' ? userColor : aiColor} !important;">${content}</div>
            ${sources && sources.length > 0 ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #718096;">
                    📚 Kaynaklar: ${sources.map(s => s.filename).join(', ')}
                </div>
            ` : ''}
        </div>
    `;
    
    messagesDiv.insertAdjacentHTML('beforeend', messageHtml);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageId;
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Auth.logout();
    });
}

// Load on page load
console.log('🎯 Initializing room...');
loadUserInfo();
loadRoomInfo();
loadDocuments();
loadChatHistory();  // ← Sohbet geçmişini yükle

console.log('✅ Room initialized');
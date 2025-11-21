# 🤖 AI Document Search

AI destekli akıllı doküman arama ve soru-cevap sistemi. GPT-4 ve Pinecone Vector Database teknolojileri ile güçlendirilmiş, RAG (Retrieval-Augmented Generation) tabanlı profesyonel doküman yönetim platformu.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Özellikler

### 🎯 Sohbet Odaları Sistemi
- **Konuya özel odalar**: Her proje/konu için ayrı sohbet odaları
- **Bağımsız doküman havuzları**: Her oda kendi dokümanlarını yönetir
- **Kalıcı sohbet geçmişi**: Tüm konuşmalar veritabanında saklanır
- **Emoji kişiselleştirme**: 240+ emoji ile oda görselleştirme
- **Gerçek zamanlı güncelleme**: Doküman işlenme durumu otomatik takip

### 📄 Gelişmiş Doküman Yönetimi
- **Çoklu format desteği**: PDF, DOCX, DOC, TXT
- **Drag & Drop yükleme**: Kolay dosya yükleme
- **Arka plan işleme**: Dosyalar asenkron olarak işlenir
- **Vektör embedding**: OpenAI text-embedding-3-small modeli
- **Akıllı chunking**: Bağlam korumalı metin bölümleme
- **Pinecone entegrasyonu**: Hızlı ve ölçeklenebilir vektör arama

### 💬 RAG Tabanlı Akıllı Sohbet
- **GPT-4 entegrasyonu**: En gelişmiş dil modeli
- **Kaynak belirtme**: Her cevap ilgili dokümanlarla referanslanır
- **Bağlama duyarlı**: Sadece yüklenen dokümanlardan cevap verir
- **Çoklu doküman desteği**: Birden fazla kaynağı sentezler
- **Türkçe desteği**: Tam Türkçe dil desteği

### 👤 Kullanıcı Yönetimi
- **JWT Authentication**: Güvenli token tabanlı kimlik doğrulama
- **Bcrypt şifreleme**: Güvenli şifre saklama
- **Kullanıcı profilleri**: Kişisel bilgi yönetimi
- **Çoklu oturum desteği**: Farklı cihazlardan erişim

### 🎨 Modern Kullanıcı Arayüzü
- **Responsive tasarım**: Mobil, tablet, desktop uyumlu
- **Dark theme**: Modern, göz yormayan arayüz
- **Smooth animasyonlar**: Akıcı kullanıcı deneyimi
- **Gerçek zamanlı bildirimler**: Toast notifications
- **Scroll optimizasyonu**: Sabit yükseklikli chat alanı

## 🏗️ Teknoloji Altyapısı

### Backend
- **Framework**: FastAPI 0.111.0
- **Veritabanı**: PostgreSQL + SQLAlchemy 2.0
- **Vector DB**: Pinecone
- **AI**: OpenAI GPT-4 & text-embedding-3-small
- **RAG Framework**: LangChain 0.2.6
- **Authentication**: JWT + Bcrypt
- **Server**: Uvicorn (ASGI)

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3 (Grid, Flexbox, Custom Properties)
- **Architecture**: Component-based structure
- **State Management**: LocalStorage + API calls
- **HTTP Server**: Python's built-in HTTP server

### Doküman İşleme
- **PDF**: PyPDF2, pdfplumber
- **DOCX**: python-docx
- **Text Splitting**: LangChain RecursiveCharacterTextSplitter
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Pinecone (serverless)

## 📦 Kurulum

### Gereksinimler
- Python 3.12+
- PostgreSQL 12+
- OpenAI API Key
- Pinecone API Key
- Git

### 1. Projeyi Klonla
```bash
git clone https://github.com/hasankurtt/ai-document-search.git
cd ai-document-search
```

### 2. Virtual Environment Oluştur
```bash
python3.12 -m venv venv
source venv/bin/activate  # Linux/Mac
# veya
venv\Scripts\activate  # Windows
```

### 3. Bağımlılıkları Yükle
```bash
# Ana proje bağımlılıkları (backend + dev tools)
pip install -r requirements.txt

# Sadece backend bağımlılıkları
# pip install -r backend/requirements.txt
```

### 4. PostgreSQL Veritabanı Oluştur
```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur
CREATE DATABASE ai_document_search;

# Kullanıcı oluştur (opsiyonel)
CREATE USER aiuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_document_search TO aiuser;

# PostgreSQL'den çık
\q
```

### 5. Environment Variables Ayarla

**backend/.env** dosyası oluşturun:

```bash
cd backend
nano .env  # veya vim, code, vs.
```

Aşağıdaki içeriği kopyalayıp yapıştırın ve değerleri düzenleyin:

```env
# Database
DATABASE_URL=postgresql://aiuser:your_password@localhost:5432/ai_document_search

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=document-search

# CORS (Frontend URL'leri)
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# App
DEBUG=True
APP_NAME=AI Document Search
APP_VERSION=1.0.0
API_PREFIX=/api/v1

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=pdf,doc,docx,txt

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
```

### 6. Pinecone Index Oluştur

1. [Pinecone Console](https://app.pinecone.io/) adresine gidin
2. **Create Index** butonuna tıklayın
3. Şu ayarları yapın:
   - **Index Name**: `document-search`
   - **Dimensions**: `1536` (text-embedding-3-small için)
   - **Metric**: `cosine`
   - **Cloud Provider**: AWS
   - **Region**: us-east-1
4. **Create Index** butonuna tıklayın

### 7. Veritabanı Tabloları Oluştur

Backend ilk çalıştırıldığında tablolar otomatik oluşturulacak. Eğer manuel oluşturmak isterseniz:

```bash
cd backend
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

## 🚀 Uygulamayı Çalıştırma

### ⚠️ Önemli: İki Ayrı Terminal Gereklidir

Backend (API server) ve Frontend (HTML server) **ayrı ayrı** çalıştırılmalıdır.

---

### 🔧 Terminal 1: Backend'i Başlat

```bash
# Backend dizinine git
cd backend

# Virtual environment'ı aktifleştir
source ../venv/bin/activate  # Linux/Mac
# veya
..\venv\Scripts\activate  # Windows

# Backend'i başlat (Uvicorn ASGI server)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

**Başarılı çıktı:**
```
INFO:     Will watch for changes in these directories: ['/path/to/backend']
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend çalışıyor**: http://127.0.0.1:8001

📚 **API Dokümantasyonu**: http://127.0.0.1:8001/docs

---

### 🌐 Terminal 2: Frontend'i Başlat

**YENİ bir terminal penceresi açın** ve şu komutları çalıştırın:

```bash
# Frontend dizinine git
cd frontend

# HTTP server'ı başlat (Python built-in server)
python3 -m http.server 8080
```

**Başarılı çıktı:**
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

veya

```
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
```

✅ **Frontend çalışıyor**: http://localhost:8080

---

### 🎉 Tarayıcıda Aç

Artık uygulamayı kullanabilirsiniz:

```
http://localhost:8080
```

veya

```
http://127.0.0.1:8080
```

⚠️ **DİKKAT**: `http://127.0.0.1:8001` adresine GİTMEYİN - bu backend API'si, HTML döndürmez!

---

## 📋 Çalıştırma Kontrol Listesi

Başlamadan önce kontrol edin:

- [ ] PostgreSQL çalışıyor mu? (`pg_isready`)
- [ ] `.env` dosyası oluşturuldu mu? (`backend/.env`)
- [ ] OpenAI API key geçerli mi?
- [ ] Pinecone index oluşturuldu mu?
- [ ] Virtual environment aktif mi? (`(venv)` prompt'ta görünmeli)
- [ ] İki terminal açık mı?
  - [ ] **Terminal 1**: Backend → `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`
  - [ ] **Terminal 2**: Frontend → `python3 -m http.server 8080`
- [ ] Tarayıcıda doğru adrese gidildi mi? (`http://localhost:8080`)

## 📁 Proje Yapısı

```
ai-document-search/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings & env vars
│   │   ├── database.py          # Database connection
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── document.py
│   │   │   └── message.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── document.py
│   │   │   └── message.py
│   │   ├── routes/              # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── rooms.py
│   │   │   ├── documents.py
│   │   │   └── chat.py
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── document_processor.py  # Document processing
│   │   │   ├── background_tasks.py    # Async tasks
│   │   │   └── chat_service.py        # RAG implementation
│   │   └── utils/               # Helper functions
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── validators.py
│   ├── uploads/                 # User uploaded files
│   ├── .env                     # Environment variables
│   └── requirements.txt         # Backend dependencies
│
├── frontend/
│   ├── index.html               # Landing/redirect page
│   ├── login.html               # Login/Register page
│   ├── dashboard.html           # Rooms dashboard
│   ├── room.html                # Chat room interface
│   ├── profile.html             # User profile
│   ├── kvkk.html                # Privacy policy
│   ├── terms.html               # Terms of service
│   ├── css/
│   │   └── style.css            # All styles (unified)
│   ├── js/
│   │   ├── config.js            # API configuration
│   │   ├── api.js               # API wrapper
│   │   ├── auth.js              # Authentication logic
│   │   ├── dashboard.js         # Rooms management
│   │   ├── room.js              # Chat functionality
│   │   └── profile.js           # Profile management
│   └── assets/
│       └── images/              # Static images
│
├── venv/                        # Virtual environment
├── .env.example                 # Environment template
├── .gitignore
├── requirements.txt             # Main requirements file
└── README.md
```

## 🎮 Kullanım Rehberi

### 1. Hesap Oluştur
1. `http://localhost:8080` adresine git
2. **"Kayıt Ol"** sekmesine tıkla
3. Ad, email ve şifre gir
4. KVKK ve kullanım şartlarını kabul et
5. **"Kayıt Ol"** butonuna tıkla

### 2. Giriş Yap
1. Email ve şifrenle giriş yap
2. Dashboard'a yönlendirileceksin

### 3. Sohbet Odası Oluştur
1. **"+ Yeni Oda Oluştur"** butonuna tıkla
2. Oda adı gir (örn: "Makine Öğrenmesi Notları")
3. Açıklama ekle (opsiyonel)
4. Emoji seç (📚, 💼, 🔬, vs.)
5. **"Oluştur"** butonuna tıkla

### 4. Doküman Yükle
1. Odaya gir
2. Sol taraftan **"+ Doküman Yükle"** veya Drag & Drop
3. PDF, DOCX, DOC veya TXT dosyası seç
4. Dosya yüklendikten sonra arka planda işlenecek
5. "İşleniyor..." → "İşlendi ✅" (otomatik güncellenir, 3 saniyede bir kontrol eder)

### 5. Soru Sor
1. Chat alanına sorunu yaz
2. **Enter** tuşuna bas (Shift+Enter: yeni satır)
3. AI dokümanları analiz edip cevap verir
4. Cevabın altında kaynak dokümanlar gösterilir

### 6. Sohbet Geçmişi
- Tüm sorular ve cevaplar veritabanında saklanır
- Sayfa yenilendiğinde geçmiş otomatik yüklenir
- Scroll ile eski mesajlara ulaşabilirsin

## 🔧 API Dokümantasyonu

Backend çalışırken otomatik oluşturulan API dokümantasyonuna erişin:

- **Swagger UI**: http://127.0.0.1:8001/docs
- **ReDoc**: http://127.0.0.1:8001/redoc

### Ana Endpoint'ler

#### Authentication
```
POST   /api/v1/auth/register    # Yeni kullanıcı kayıt
POST   /api/v1/auth/login       # Giriş yap
GET    /api/v1/auth/me          # Mevcut kullanıcı bilgisi
```

#### Rooms
```
GET    /api/v1/rooms            # Tüm odaları listele
POST   /api/v1/rooms            # Yeni oda oluştur
GET    /api/v1/rooms/{id}       # Oda detayları
PUT    /api/v1/rooms/{id}       # Oda güncelle
DELETE /api/v1/rooms/{id}       # Oda sil
```

#### Documents
```
POST   /api/v1/documents/upload/{room_id}    # Doküman yükle
GET    /api/v1/documents/room/{room_id}      # Odadaki dokümanlar
DELETE /api/v1/documents/{id}                # Doküman sil
```

#### Chat
```
POST   /api/v1/chat/{room_id}            # Soru sor
GET    /api/v1/chat/history/{room_id}    # Sohbet geçmişi
```

## 🧪 Test

### Backend Testleri
```bash
cd backend
pytest
pytest --cov=app  # Coverage report
```

### Manuel API Test
```bash
# Health check
curl http://127.0.0.1:8001/health

# API version
curl http://127.0.0.1:8001/

# Register test
curl -X POST http://127.0.0.1:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

## 🐛 Troubleshooting

### Backend Başlamıyor

**Problem:** `Port already in use`
```bash
# Port 8001'i kullanan process'i bul
lsof -i :8001  # Mac/Linux
netstat -ano | findstr :8001  # Windows

# Process'i öldür
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Veya farklı port kullan
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

**Problem:** `ModuleNotFoundError`
```bash
# Virtual environment aktif mi kontrol et
which python  # /path/to/venv/bin/python olmalı

# Bağımlılıkları tekrar yükle
pip install -r requirements.txt
```

### Database Bağlantı Hatası

**Problem:** `Connection refused`
```bash
# PostgreSQL çalışıyor mu?
pg_isready

# PostgreSQL'i başlat
# Mac (Homebrew):
brew services start postgresql

# Linux (systemd):
sudo systemctl start postgresql

# Windows: PostgreSQL service'ini başlat
```

**Problem:** `Authentication failed`
```bash
# Database connection string'i kontrol et
cat backend/.env | grep DATABASE_URL

# Kullanıcı şifresini sıfırla
psql -U postgres
ALTER USER aiuser WITH PASSWORD 'new_password';
```

### Frontend Başlamıyor

**Problem:** `Port 8080 already in use`
```bash
# Port 8080'i kullanan process'i bul
lsof -i :8080  # Mac/Linux

# Farklı port kullan
python3 -m http.server 8888

# Frontend API config'de de portu değiştir (frontend/js/config.js)
```

**Problem:** `API calls failing (CORS error)`
```bash
# Backend'in CORS ayarlarını kontrol et
cat backend/.env | grep CORS_ORIGINS

# Frontend URL'inin CORS_ORIGINS'te olduğundan emin ol
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

### Dosya Yükleme Başarısız

**Problem:** `Upload failed`
```bash
# uploads/ klasörü var mı?
ls -la backend/uploads

# Klasör yoksa oluştur
mkdir -p backend/uploads
chmod 755 backend/uploads
```

**Problem:** `File too large`
```bash
# MAX_FILE_SIZE'ı artır (backend/.env)
MAX_FILE_SIZE=104857600  # 100MB
```

### Pinecone Hatası

**Problem:** `Index not found`
```bash
# Index adını kontrol et
cat backend/.env | grep PINECONE_INDEX_NAME

# Pinecone Console'dan index oluşturun
# - Name: document-search
# - Dimensions: 1536
# - Metric: cosine
```

**Problem:** `Invalid API key`
```bash
# API key'i kontrol et
cat backend/.env | grep PINECONE_API_KEY

# Yeni API key oluştur: https://app.pinecone.io/
```

### "No relevant chunks found" Hatası

**Problem:** AI dokümanlardan cevap veremiyor

```bash
# 1. Doküman gerçekten işlendi mi kontrol et
# Backend loglarında "Document processed successfully" görünmeli

# 2. Pinecone'a yüklendi mi kontrol et
# Backend loglarında "Uploaded X chunks to Pinecone" görünmeli

# 3. Similarity threshold'u düşür
# backend/app/services/chat_service.py:
# if match['score'] > 0.3:  # 0.5'ten 0.3'e düşürüldü
```

## 🔐 Güvenlik

### Mevcut Güvenlik Önlemleri
- ✅ **JWT Authentication**: Token tabanlı güvenli kimlik doğrulama
- ✅ **Bcrypt**: Şifre hash'leme (salt + bcrypt)
- ✅ **CORS**: Cross-origin resource sharing koruması
- ✅ **SQL Injection**: SQLAlchemy ORM koruması
- ✅ **XSS**: Input sanitization
- ✅ **File Validation**: Dosya türü ve boyut kontrolü
- ✅ **Rate Limiting**: API aşırı kullanım koruması (60 req/min)
- ✅ **Environment Variables**: Hassas bilgiler .env'de

### Production Önerileri
- [ ] HTTPS kullan (SSL/TLS sertifikası)
- [ ] Environment variables'ı güvenli sakla (AWS Secrets Manager, HashiCorp Vault)
- [ ] Database bağlantılarını şifrele (SSL mode)
- [ ] API rate limiting güçlendir
- [ ] Monitoring ve logging ekle (Sentry, DataDog, ELK Stack)
- [ ] Regular security audits
- [ ] GDPR/KVKK compliance kontrolü
- [ ] Backup stratejisi oluştur

## 🚀 Production Deployment

### Backend (Örnek: Railway/Render/Heroku)

**Gunicorn ile production server:**
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

**Docker ile:**
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Örnek: Vercel/Netlify/GitHub Pages)

Frontend statik dosyalardan oluştuğu için direkt deploy edilebilir:

```bash
cd frontend
# Direkt deploy (no build step needed)
```

**Netlify örneği:**
```toml
# netlify.toml
[build]
  publish = "frontend"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables (Production)

```env
DEBUG=False
DATABASE_URL=postgresql://user:pass@prod-db-host.example.com:5432/dbname
JWT_SECRET_KEY=very-long-secure-random-string-min-64-chars-generated-securely
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
PINECONE_ENVIRONMENT=us-east-1-aws
LOG_LEVEL=WARNING
```

## 📈 Performance Optimizasyonu

### Backend
- **Database Indexing**: Sık sorgulanan kolonlara index ekle
- **Connection Pooling**: SQLAlchemy pool ayarları
- **Caching**: Redis ekle (gelecek özellik)
- **Async Operations**: Background tasks için Celery
- **Query Optimization**: N+1 problem'ini önle

### Frontend
- **CDN**: Static files için Cloudflare/AWS CloudFront
- **Compression**: Gzip/Brotli aktif et
- **Lazy Loading**: Resimler için lazy loading
- **Minification**: JS/CSS minify et (production)
- **Service Worker**: Offline support (PWA)

### Pinecone
- **Namespace Stratejisi**: Her oda için ayrı namespace (mevcut)
- **Batch Operations**: Toplu insert/delete
- **Query Optimization**: top_k ve filter parametrelerini optimize et

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Şu adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add: Amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

### Kod Standartları
- **Python**: PEP 8
- **JavaScript**: ES6+ modern syntax
- **Commits**: Conventional Commits format
- **Documentation**: Docstrings ve comments

### Development Setup
```bash
# Pre-commit hooks (opsiyonel)
pip install pre-commit
pre-commit install

# Code formatting (opsiyonel)
pip install black flake8
black backend/
flake8 backend/
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Hasan Kurt**
- GitHub: [@hasankurtt](https://github.com/hasankurtt)
- Email: hasankurt051@gmail.com
- LinkedIn: [@hsnkurt](https://linkedin.com/in/hsnkurt)

## 🙏 Teşekkürler

- [OpenAI](https://openai.com/) - GPT-4 & Embeddings API
- [Pinecone](https://www.pinecone.io/) - Vector Database
- [LangChain](https://www.langchain.com/) - RAG Framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python Framework
- [PostgreSQL](https://www.postgresql.org/) - Güvenilir veritabanı
- Tüm açık kaynak katkıda bulunanlara ❤️

## 📊 Proje İstatistikleri

- **Toplam Kod**: ~4,500 satır
- **Backend**: ~2,500 satır Python
- **Frontend**: ~2,000 satır JavaScript + HTML/CSS
- **API Endpoints**: 15+
- **Desteklenen Formatlar**: 4 (PDF, DOCX, DOC, TXT)
- **Vector Dimensions**: 1536
- **Max Dosya Boyutu**: 50MB (varsayılan)
- **Embedding Model**: text-embedding-3-small
- **LLM Model**: GPT-4

## 🔮 Roadmap

### v1.1 (Yakında)
- [ ] WebSocket desteği (gerçek zamanlı sohbet)
- [ ] Doküman önizleme (PDF viewer)
- [ ] Excel (XLSX) format desteği
- [ ] Bulk document upload (çoklu dosya yükleme)
- [ ] Advanced search filters (tarih, dosya türü, etc.)

### v1.2 (Planlanan)
- [ ] Multi-language support (İngilizce arayüz)
- [ ] Voice input/output (konuşma tanıma)
- [ ] Document summarization (otomatik özet)
- [ ] Collaborative rooms (paylaşımlı odalar)
- [ ] Export chat history (PDF, TXT)

### v2.0 (Uzun Vadeli)
- [ ] Custom AI model fine-tuning
- [ ] Advanced analytics dashboard
- [ ] Integration marketplace (Slack, Teams, etc.)
- [ ] Enterprise features (SSO, LDAP)
- [ ] Mobile app (React Native)
- [ ] On-premise deployment option
- [ ] Multi-tenant architecture

## 📸 Ekran Görüntüleri

### Login & Register
![Login](screenshots/login.png)

### Dashboard - Sohbet Odaları
![Dashboard](screenshots/dashboard.png)

### Chat Room - Doküman Yönetimi
![Room](screenshots/room.png)

### AI Cevapları - Kaynak Gösterimi
![Chat](screenshots/chat.png)

### User Profile
![Profile](screenshots/profile.png)

---

<div align="center">

⭐ **Projeyi beğendiyseniz star vermeyi unutmayın!**

🐛 **Bug bulursanız issue açın!**

💡 **Öneriniz varsa pull request gönderin!**

Made with ❤️ by [Hasan Kurt](https://github.com/hasankurtt)

</div>

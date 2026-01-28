# 🤖 AI Document Search

AI-powered intelligent document search and Q&A system. Enhanced with GPT-4 and Pinecone Vector Database technologies, a professional RAG (Retrieval-Augmented Generation) based document management platform.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

### 🎯 Chat Rooms System
- **Topic-specific rooms**: Separate chat rooms for each project/topic
- **Independent document pools**: Each room manages its own documents
- **Persistent chat history**: All conversations stored in database
- **Emoji customization**: 240+ emojis for room visualization
- **Real-time updates**: Document processing status auto-tracked

### 📄 Advanced Document Management
- **Multi-format support**: PDF, DOCX, DOC, TXT
- **Drag & Drop upload**: Easy file upload
- **Background processing**: Files processed asynchronously
- **Vector embedding**: OpenAI text-embedding-3-small model
- **Smart chunking**: Context-preserving text segmentation
- **Pinecone integration**: Fast and scalable vector search

### 💬 RAG-Based Intelligent Chat
- **GPT-4 integration**: Most advanced language model
- **Source citation**: Every answer referenced with relevant documents
- **Context-aware**: Answers only from uploaded documents
- **Multi-document support**: Synthesizes multiple sources
- **Full language support**: Works with any language

### 👤 User Management
- **JWT Authentication**: Secure token-based authentication
- **Bcrypt encryption**: Secure password storage
- **User profiles**: Personal information management
- **Multi-session support**: Access from different devices

### 🎨 Modern User Interface
- **Responsive design**: Mobile, tablet, desktop compatible
- **Dark theme**: Modern, eye-friendly interface
- **Smooth animations**: Fluid user experience
- **Real-time notifications**: Toast notifications
- **Scroll optimization**: Fixed-height chat area

### 🛡️ Resource Limits & Cost Control
- **Rate limiting**: IP-based request throttling
  - Register: 2/day per IP
  - Chat: 5/day per user
  - Upload: 3/day per user
- **Resource constraints** (Demo Mode):
  - Max 2 rooms per user
  - Max 3 documents per user
  - Max 2MB file size
  - Min 50 characters per document
- **Cost optimization**: Designed for demo purposes with tight limits

## 🏗️ Technology Stack

### Backend
- **Framework**: FastAPI 0.111.0 (Async)
- **Database**: PostgreSQL + SQLAlchemy 2.0
- **Vector DB**: Pinecone
- **AI**: OpenAI GPT-4 & text-embedding-3-small
- **RAG Framework**: LangChain 0.2.6
- **Authentication**: JWT + Bcrypt
- **Rate Limiting**: slowapi (in-memory)
- **Server**: Uvicorn (ASGI)

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS3 (Grid, Flexbox, Custom Properties)
- **Architecture**: Component-based structure
- **State Management**: LocalStorage + API calls
- **HTTP Server**: Python's built-in HTTP server

### Document Processing
- **PDF**: PyPDF2, pdfplumber
- **DOCX**: python-docx
- **Text Splitting**: LangChain RecursiveCharacterTextSplitter
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Pinecone (serverless)

### Future Deployment
- **Reverse Proxy**: Nginx (planned)
- **Backend Security**: Private subnet with Nginx gateway
- **Cloud Platform**: AWS (EC2, RDS, S3)

## 📦 Installation

### Requirements
- Python 3.12+
- PostgreSQL 12+
- OpenAI API Key
- Pinecone API Key
- Git

### 1. Clone Repository
```bash
git clone https://github.com/hasankurtt/ai-document-search.git
cd ai-document-search
```

### 2. Create Virtual Environment
```bash
python3.12 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

### 3. Install Dependencies
```bash
# Main project dependencies (backend + dev tools)
pip install -r requirements.txt

# Backend only
# pip install -r backend/requirements.txt
```

### 4. Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_document_search;

# Create user (optional)
CREATE USER aiuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_document_search TO aiuser;

# Exit PostgreSQL
\q
```

### 5. Configure Environment Variables

Create **backend/.env** file:

```bash
cd backend
nano .env  # or vim, code, etc.
```

Copy and edit the following:

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

# CORS (Frontend URLs)
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# App
DEBUG=True
APP_NAME=AI Document Search
APP_VERSION=1.0.0
API_PREFIX=/api/v1

# Upload (Demo Mode)
UPLOAD_DIR=uploads
MAX_FILE_SIZE=2097152
ALLOWED_EXTENSIONS=pdf,doc,docx,txt

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
```

### 6. Create Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Click **Create Index**
3. Configure:
   - **Index Name**: `document-search`
   - **Dimensions**: `1536` (for text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud Provider**: AWS
   - **Region**: us-east-1
4. Click **Create Index**

### 7. Initialize Database Tables

Tables will be auto-created on first run. For manual creation:

```bash
cd backend
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

## 🚀 Running the Application

### ⚠️ Important: Two Separate Terminals Required

Backend (API server) and Frontend (HTML server) must run **separately**.

---

### 🔧 Terminal 1: Start Backend

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source ../venv/bin/activate  # Linux/Mac
# or
..\venv\Scripts\activate  # Windows

# Start backend (Uvicorn ASGI server)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

**Successful output:**
```
INFO:     Will watch for changes in these directories: ['/path/to/backend']
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend running**: http://127.0.0.1:8001

📚 **API Documentation**: http://127.0.0.1:8001/docs

---

### 🌐 Terminal 2: Start Frontend

**Open a NEW terminal window** and run:

```bash
# Navigate to frontend directory
cd frontend

# Start HTTP server (Python built-in server)
python3 -m http.server 8080
```

**Successful output:**
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

or

```
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
```

✅ **Frontend running**: http://localhost:8080

---

### 🎉 Open in Browser

Application is ready:

```
http://localhost:8080
```

or

```
http://127.0.0.1:8080
```

⚠️ **WARNING**: DO NOT go to `http://127.0.0.1:8001` - that's the backend API, it doesn't serve HTML!

---

## 📋 Pre-flight Checklist

Before starting, verify:

- [ ] PostgreSQL running? (`pg_isready`)
- [ ] `.env` file created? (`backend/.env`)
- [ ] OpenAI API key valid?
- [ ] Pinecone index created?
- [ ] Virtual environment active? (`(venv)` in prompt)
- [ ] Two terminals open?
  - [ ] **Terminal 1**: Backend → `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`
  - [ ] **Terminal 2**: Frontend → `python3 -m http.server 8080`
- [ ] Correct URL in browser? (`http://localhost:8080`)

## 📁 Project Structure

```
ai-document-search/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings & env vars
│   │   ├── database.py          # Database connection
│   │   ├── limiter.py           # Rate limiting config
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
│   │   │   ├── auth.py          # Rate: 2/day
│   │   │   ├── rooms.py
│   │   │   ├── documents.py     # Rate: 3/day
│   │   │   └── chat.py          # Rate: 5/day
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── document_processor.py  # Document processing
│   │   │   ├── background_tasks.py    # Async tasks
│   │   │   └── chat_service.py        # RAG implementation (async)
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

## 🎮 Usage Guide

### 1. Create Account
1. Go to `http://localhost:8080`
2. Click **"Register"** tab
3. Enter name, email, and password
4. Accept privacy policy and terms
5. Click **"Register"** button

### 2. Login
1. Login with your email and password
2. You'll be redirected to dashboard

### 3. Create Chat Room
1. Click **"+ Create New Room"** button
2. Enter room name (e.g., "Machine Learning Notes")
3. Add description (optional)
4. Select emoji (📚, 💼, 🔬, etc.)
5. Click **"Create"** button

### 4. Upload Document
1. Enter the room
2. Click **"+ Upload Document"** from left sidebar or use Drag & Drop
3. Select PDF, DOCX, DOC, or TXT file (max 2MB)
4. File will be uploaded and processed in background
5. "Processing..." → "Processed ✅" (auto-updates every 3 seconds)

### 5. Ask Questions
1. Type your question in chat area
2. Press **Enter** (Shift+Enter for new line)
3. AI analyzes documents and responds
4. Source documents shown below answer

### 6. Chat History
- All questions and answers stored in database
- History auto-loads on page refresh
- Scroll to access old messages

## 🔧 API Documentation

Auto-generated API documentation (when backend is running):

- **Swagger UI**: http://127.0.0.1:8001/docs
- **ReDoc**: http://127.0.0.1:8001/redoc

### Main Endpoints

#### Authentication
```
POST   /api/v1/auth/register    # Register new user (2/day)
POST   /api/v1/auth/login       # Login
GET    /api/v1/auth/me          # Current user info
```

#### Rooms
```
GET    /api/v1/rooms            # List all rooms
POST   /api/v1/rooms            # Create new room (max 2 per user)
GET    /api/v1/rooms/{id}       # Room details
PUT    /api/v1/rooms/{id}       # Update room
DELETE /api/v1/rooms/{id}       # Delete room
```

#### Documents
```
POST   /api/v1/documents/upload/{room_id}    # Upload document (3/day, max 3 per user)
GET    /api/v1/documents/room/{room_id}      # Documents in room
DELETE /api/v1/documents/{id}                # Delete document
```

#### Chat
```
POST   /api/v1/chat/{room_id}            # Ask question (5/day)
GET    /api/v1/chat/history/{room_id}    # Chat history
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app  # Coverage report
```

### Manual API Testing
```bash
# Health check
curl http://127.0.0.1:8001/health

# API version
curl http://127.0.0.1:8001/

# Register test
curl -X POST http://127.0.0.1:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** `Port already in use`
```bash
# Find process using port 8001
lsof -i :8001  # Mac/Linux
netstat -ano | findstr :8001  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

**Problem:** `ModuleNotFoundError`
```bash
# Check if virtual environment is active
which python  # Should show /path/to/venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Connection Error

**Problem:** `Connection refused`
```bash
# Is PostgreSQL running?
pg_isready

# Start PostgreSQL
# Mac (Homebrew):
brew services start postgresql

# Linux (systemd):
sudo systemctl start postgresql

# Windows: Start PostgreSQL service
```

**Problem:** `Authentication failed`
```bash
# Check database connection string
cat backend/.env | grep DATABASE_URL

# Reset user password
psql -U postgres
ALTER USER aiuser WITH PASSWORD 'new_password';
```

### Frontend Won't Start

**Problem:** `Port 8080 already in use`
```bash
# Find process using port 8080
lsof -i :8080  # Mac/Linux

# Use different port
python3 -m http.server 8888

# Update API config (frontend/js/config.js)
```

**Problem:** `API calls failing (CORS error)`
```bash
# Check backend CORS settings
cat backend/.env | grep CORS_ORIGINS

# Ensure frontend URL is in CORS_ORIGINS
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

### File Upload Failed

**Problem:** `Upload failed`
```bash
# Does uploads/ folder exist?
ls -la backend/uploads

# Create folder if missing
mkdir -p backend/uploads
chmod 755 backend/uploads
```

**Problem:** `File too large` (Demo: max 2MB)
```bash
# Increase MAX_FILE_SIZE (backend/.env)
MAX_FILE_SIZE=10485760  # 10MB (use cautiously)
```

### Rate Limit Hit

**Problem:** `429 Too Many Requests`
- **Register**: Wait until tomorrow (2/day limit)
- **Chat**: Wait until tomorrow (5/day limit)
- **Upload**: Wait until tomorrow (3/day limit)

**Note:** Rate limits are IP-based and reset in-memory (backend restart resets counters).

### Pinecone Error

**Problem:** `Index not found`
```bash
# Check index name
cat backend/.env | grep PINECONE_INDEX_NAME

# Create index in Pinecone Console
# - Name: document-search
# - Dimensions: 1536
# - Metric: cosine
```

**Problem:** `Invalid API key`
```bash
# Check API key
cat backend/.env | grep PINECONE_API_KEY

# Generate new key: https://app.pinecone.io/
```

### "No relevant chunks found" Error

**Problem:** AI can't answer from documents

```bash
# 1. Check if document was processed
# Backend logs should show "Document processed successfully"

# 2. Check if uploaded to Pinecone
# Backend logs should show "Uploaded X chunks to Pinecone"

# 3. Lower similarity threshold
# backend/app/services/chat_service.py:
# if match['score'] > 0.3:  # lowered from 0.5 to 0.3
```

## 🔐 Security

### Current Security Measures
- ✅ **JWT Authentication**: Token-based secure authentication
- ✅ **Bcrypt**: Password hashing (salt + bcrypt)
- ✅ **CORS**: Cross-origin resource sharing protection
- ✅ **SQL Injection**: SQLAlchemy ORM protection
- ✅ **XSS**: Input sanitization
- ✅ **File Validation**: File type and size checks
- ✅ **Rate Limiting**: API abuse protection (IP-based)
- ✅ **Environment Variables**: Sensitive data in .env
- ✅ **Early Validation**: File content checked before processing

### Production Recommendations
- [ ] Use HTTPS (SSL/TLS certificate)
- [ ] Secure environment variables (AWS Secrets Manager, HashiCorp Vault)
- [ ] Encrypt database connections (SSL mode)
- [ ] Strengthen rate limiting
- [ ] Add monitoring and logging (Sentry, DataDog, ELK Stack)
- [ ] Regular security audits
- [ ] GDPR/privacy compliance
- [ ] Backup strategy
- [ ] Nginx reverse proxy (private backend, public gateway)

## 🚀 Future Deployment Architecture

### Planned Setup

```
Internet
  ↓
Nginx (Public EC2, Port 80)
  ↓ (Private network)
Backend (Private Subnet, Port 8001)
  ↓
PostgreSQL RDS (Private Subnet)
```

**Benefits:**
- Backend not exposed to internet
- Single entry point (Port 80)
- Request filtering & rate limiting at Nginx level
- DDoS protection
- SSL/TLS termination at Nginx

**Current Demo Setup:**
- Backend directly accessible (Port 8001)
- Rate limiting at application level
- Suitable for demonstration purposes

## 📈 Performance Optimization

### Backend
- **Database Indexing**: Index frequently queried columns
- **Connection Pooling**: SQLAlchemy pool settings
- **Caching**: Redis (future feature)
- **Async Operations**: Celery for background tasks
- **Query Optimization**: Prevent N+1 problems

### Frontend
- **CDN**: Cloudflare/AWS CloudFront for static files
- **Compression**: Enable Gzip/Brotli
- **Lazy Loading**: Images lazy loading
- **Minification**: Minify JS/CSS (production)
- **Service Worker**: Offline support (PWA)

### Pinecone
- **Namespace Strategy**: Separate namespace per room (current)
- **Batch Operations**: Bulk insert/delete
- **Query Optimization**: Optimize top_k and filter parameters

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add: Amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- **Python**: PEP 8
- **JavaScript**: ES6+ modern syntax
- **Commits**: Conventional Commits format
- **Documentation**: Docstrings and comments

### Development Setup
```bash
# Pre-commit hooks (optional)
pip install pre-commit
pre-commit install

# Code formatting (optional)
pip install black flake8
black backend/
flake8 backend/
```

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Hasan Kurt**
- GitHub: [@hasankurtt](https://github.com/hasankurtt)
- Email: hasankurt051@gmail.com
- LinkedIn: [@hsnkurt](https://linkedin.com/in/hsnkurt)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) - GPT-4 & Embeddings API
- [Pinecone](https://www.pinecone.io/) - Vector Database
- [LangChain](https://www.langchain.com/) - RAG Framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python Framework
- [PostgreSQL](https://www.postgresql.org/) - Reliable database
- All open source contributors ❤️

## 📊 Project Statistics

- **Total Code**: ~4,500 lines
- **Backend**: ~2,500 lines Python
- **Frontend**: ~2,000 lines JavaScript + HTML/CSS
- **API Endpoints**: 15+
- **Supported Formats**: 4 (PDF, DOCX, DOC, TXT)
- **Vector Dimensions**: 1536
- **Max File Size**: 2MB (demo mode)
- **Min File Content**: 50 characters
- **Embedding Model**: text-embedding-3-small
- **LLM Model**: GPT-4
- **Resource Limits**: 2 rooms, 3 documents per user

## 🔮 Roadmap

### v1.0 ✅ (Completed)
- [x] RAG-based Q&A system
- [x] Multi-room document management
- [x] JWT authentication
- [x] Rate limiting & cost controls
- [x] Async backend architecture

### v1.1 (In Progress)
- [ ] AWS deployment (EC2 + RDS)
- [ ] Nginx reverse proxy
- [ ] Production security hardening
- [ ] Cost monitoring & alarms

### Future Considerations
- Document preview (PDF viewer)
- Export chat history
- WebSocket for real-time updates
- Multi-language UI support

**Status:** v1.0 is a fully functional demo. v1.1 focuses on production-ready deployment.

---

<div align="center">

⭐ **If you like this project, please give it a star!**

🐛 **Found a bug? Open an issue!**

💡 **Have an idea? Send a pull request!**

Made with ❤️ by [Hasan Kurt](https://github.com/hasankurtt)

</div>
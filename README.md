# 🤖 AI Document Search

An AI-powered intelligent document search and Q&A system. Built with GPT-4 and Pinecone vector database, this is a RAG (Retrieval-Augmented Generation) based document management platform that lets users upload documents, ask questions, and get AI-generated answers with source references.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT4-412391.svg)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-blue.svg)](https://www.pinecone.io/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20S3-FF9900.svg)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Architecture](#-architecture)
3. [Technology Stack](#-technology-stack)
4. [Resource Limits & Cost Control](#-resource-limits--cost-control)
5. [Prerequisites](#-prerequisites)
6. [Local Development Setup](#-local-development-setup)
7. [Production Deployment (AWS)](#-production-deployment-aws)
8. [Environment Variables](#-environment-variables)
9. [Project Structure](#-project-structure)
10. [API Endpoints](#-api-endpoints)
11. [How RAG Works](#-how-rag-works)
12. [Troubleshooting](#-troubleshooting)
13. [Potential Improvements](#-potential-improvements)

---

## ✨ Features

- **Document Upload & Processing** — Upload PDF/TXT files, automatically extracted, chunked, and embedded into a vector database
- **AI-Powered Q&A** — Ask questions about your documents and get GPT-4 generated answers with source references
- **Room-Based Organization** — Create separate rooms to organize documents and conversations by topic
- **Real-Time Processing Status** — Frontend polls every 3 seconds to track document processing progress
- **User Authentication** — Secure JWT-based registration and login system
- **Rate Limiting** — IP and user-based throttling to control costs and prevent abuse
- **Demo Mode** — Tight resource constraints designed for low-cost demo deployments

---

## 🏗️ Architecture

### Production Architecture (AWS)

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
│                    (Browser)                            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────┐
│         AWS S3                   │
│   Static Website Hosting         │
│   (Frontend: React + TypeScript) │
│   <YOUR_S3_BUCKET>.s3-...    │
└──────────────────────┬───────────┘
                       │ API calls (CORS)
                       ▼
┌──────────────────────────────────┐
│         AWS EC2 (t2.micro)       │
│  ┌────────────────────────────┐  │
│  │       Nginx (Port 80)      │  │
│  │   Reverse Proxy → :8001    │  │
│  └───────────────┬────────────┘  │
│                  ▼               │
│  ┌────────────────────────────┐  │
│  │   FastAPI + Uvicorn        │  │
│  │   (Port 8001)              │  │
│  │   Backend Application      │  │
│  └───────────────┬────────────┘  │
└──────────────────┼───────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ AWS RDS  │ │ OpenAI   │ │ Pinecone │
│PostgreSQL│ │  GPT-4   │ │  Vector  │
│          │ │Embeddings│ │    DB    │
└──────────┘ └──────────┘ └──────────┘
```

**Key design decisions:**
- **Frontend on S3** — Static files served globally via S3 Static Website Hosting. No server needed for the frontend.
- **Backend on EC2** — FastAPI runs behind Nginx as a reverse proxy on a single EC2 instance.
- **Nginx as reverse proxy** — Handles routing (`/api/` → FastAPI), CORS is managed at the FastAPI level via `CORSMiddleware`.
- **CORS configuration** — The S3 website URL is added to the backend's `CORS_ORIGINS` environment variable. Nginx does NOT handle CORS; FastAPI does.

### Local Development Architecture

```
┌───────────┐     ┌───────────────┐     ┌──────────────┐
│  Browser  │────▶│  Vite Dev     │     │   FastAPI    │
│ :5173     │     │  Server       │     │   Uvicorn    │
│           │     │  (Frontend)   │────▶│   :8001      │
└───────────┘     └───────────────┘     └──────┬───────┘
                                               │
                                    ┌──────────┼──────────┐
                                    ▼          ▼          ▼
                             ┌──────────┐ ┌────────┐ ┌────────┐
                             │PostgreSQL│ │ OpenAI │ │Pinecone│
                             │ (local)  │ │        │ │        │
                             └──────────┘ └────────┘ └────────┘
```

For detailed architecture diagrams including data flow and sequence diagrams, see: **[Architecture Diagrams](docs/architecture.md)**

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, React Router v6, Axios |
| **Backend Framework** | FastAPI 0.111.0 (Async) |
| **Database** | PostgreSQL 16 + SQLAlchemy 2.0 |
| **Vector Database** | Pinecone (Serverless) |
| **AI/LLM** | OpenAI GPT-4 + text-embedding-3-small |
| **RAG Framework** | LangChain 0.2.6 |
| **Authentication** | JWT + Bcrypt |
| **Rate Limiting** | slowapi (in-memory, IP-based) |
| **ASGI Server** | Uvicorn |
| **Reverse Proxy** | Nginx (production only) |
| **Cloud** | AWS EC2, RDS, S3 |

---

## 🛡️ Resource Limits & Cost Control

This project runs in **Demo Mode** — resource constraints are intentionally tight to minimize cloud costs. Designed for portfolio demonstration with minimal spend.

### Rate Limits

| Endpoint | Limit | Scope |
|----------|-------|-------|
| `/auth/register` | 2 requests/day | Per IP address |
| `/chat/{room_id}` | 5 requests/day | Per user |
| `/documents/upload/{room_id}` | 3 requests/day | Per user |

### Resource Constraints

| Resource | Limit |
|----------|-------|
| Rooms per user | Max 2 |
| Documents per user | Max 3 |
| File size | Max 2 MB |
| Min document length | 50 characters |

### Cost Estimation (Demo)

With 10 demo users at maximum usage:
- Each user: 2 rooms × 3 documents (2MB) = 6 documents
- Embedding cost per document: ~$0.001–0.002
- **Total per user: ~$0.01–0.02**
- **10 users: ~$0.20 (20 cents)**

AWS infrastructure (EC2 t2.micro + RDS db.t3.micro): ~$17/month, covered by the AWS Free Tier credits.

---

## 📦 Prerequisites

Before you begin, make sure you have the following:

- **Python 3.12+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/) (for frontend development)
- **PostgreSQL 16** — [Download](https://www.postgresql.org/download/) (for local development)
- **AWS CLI** — [Install](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (for production deployment)
- **API Keys:**
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Pinecone API Key + Index](https://www.pinecone.io/) — Create an index named `ai-doc-search` with dimension `1536` and metric `cosine`

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hasankurtt/ai-document-search.git
cd ai-document-search
```

### 2. Create and Activate Virtual Environment

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL (Local)

Make sure PostgreSQL is running:

```bash
pg_isready
```

Create the database:

```sql
CREATE DATABASE ai_document_search;
```

### 5. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example backend/.env
```

Open `backend/.env` and set all required values (see [Environment Variables](#-environment-variables) section below).

### 6. Start the Backend

Open **Terminal 1**:

```bash
cd backend
source ../venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

### 7. Start the Frontend

Open **Terminal 2**:

```bash
cd frontend
npm install
npm run dev
```

### 8. Open in Browser

```
http://localhost:5173
```

### Local Pre-flight Checklist

- [ ] PostgreSQL is running (`pg_isready` returns success)
- [ ] `backend/.env` is created with all required variables
- [ ] OpenAI API key is valid
- [ ] Pinecone index `ai-doc-search` exists (dim: 1536, metric: cosine)
- [ ] Virtual environment is activated (`(venv)` visible in terminal prompt)
- [ ] Backend is running on port 8001
- [ ] Frontend dev server is running on port 5173
- [ ] Browser is open at `http://localhost:5173`

### How constants.ts Handles Local vs Production

The frontend uses `constants.ts` to configure the API URL:

```typescript
// frontend/constants.ts
export const API_BASE_URL = 'http://YOUR_EC2_IP/api/v1';
```

Before running locally, update `API_BASE_URL` to point to your local backend:
```typescript
export const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';
```

Before deploying to production, set it back to your EC2 IP. The placeholder `YOUR_EC2_IP` is committed to the repository — never commit the real IP.

---

## ☁️ Production Deployment (AWS)

This section documents the full production deployment as it currently exists.

### Architecture Overview

| Component | Service | Details |
|-----------|---------|---------|
| Frontend | AWS S3 | Static Website Hosting (React build output) |
| Backend | AWS EC2 | Ubuntu 24.04, t2.micro |
| Database | AWS RDS | PostgreSQL 16, db.t3.micro |
| Reverse Proxy | Nginx | On EC2, proxies `/api/` → FastAPI |
| Vector DB | Pinecone | Serverless (external) |
| AI | OpenAI | GPT-4 + embeddings (external) |

### Step 1: IAM Setup

1. Go to **AWS Console → IAM**
2. Create a new user (e.g., `admin-user`)
3. Attach the **AdministratorAccess** policy
4. Enable **Console access** with a password
5. Create **Access Keys** (Access Key ID + Secret Access Key)
6. Configure AWS CLI locally:

```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
```

### Step 2: Billing Alarms

Set up CloudWatch alarms to avoid surprise charges:

1. **AWS Console → CloudWatch → Alarms → Create Alarm**
2. Set up three alarms at thresholds: **$2**, **$5**, **$7**
3. Configure email notifications for each

### Step 3: EC2 Instance

1. **AWS Console → EC2 → Launch Instance**
2. Settings:
   - **Name:** `ai-doc-search-server`
   - **AMI:** Ubuntu 24.04 LTS
   - **Instance type:** `t2.micro` (Free Tier eligible)
   - **Key pair:** Create or select an existing SSH key pair (save `.pem` file securely)
3. **Security Group** — Create a new one with these inbound rules:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | My IP | Admin access only |
| HTTP | TCP | 80 | 0.0.0.0/0 | Public (Nginx) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Public (future SSL) |

> **Note:** The EC2 public IP changes on every stop/start (unless you allocate an Elastic IP). Update your SSH Security Group rule with **My IP** after each restart.

4. Launch the instance.

### Step 4: Connect via SSH

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 5: Install Server Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install -y python3 python3-pip python3-venv nginx

# Clone the project
git clone https://github.com/hasankurtt/ai-document-search.git
cd ai-document-search

# Create venv and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create uploads directory
mkdir -p backend/uploads
```

### Step 6: Configure Backend (.env)

```bash
nano backend/.env
```

Fill in all environment variables (see [Environment Variables](#-environment-variables)). The database URL should point to your RDS instance:

```
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/ai_document_search
```

Secure the file:

```bash
chmod 600 backend/.env
```

### Step 7: Set Up RDS PostgreSQL

1. **AWS Console → RDS → Create Database**
2. Settings:
   - **Engine:** PostgreSQL 16
   - **Template:** Dev/Test
   - **Instance class:** `db.t3.micro`
   - **DB instance identifier:** `ai-doc-search-db`
   - **Username:** Choose a username
   - **Password:** Choose a strong password
   - **VPC:** Same VPC as your EC2 instance
3. **Security Group** — Create or use an existing group. Add an inbound rule:
   - **Type:** PostgreSQL (5432)
   - **Source:** EC2 instance's Security Group
4. Launch the database and wait for it to become **Available**
5. Note the **Endpoint** (e.g., `ai-doc-search-db.xxxxx.us-east-1.rds.amazonaws.com`)

#### Create Tables

The project includes a dedicated script for table creation. From your EC2 instance:

```bash
cd ~/ai-document-search/backend
source ../venv/bin/activate
python create_tables.py
```

This script handles all model imports and table creation in one place. To verify the tables were created:

```bash
psql -h <RDS_ENDPOINT> -U <USERNAME> -d ai_document_search -c "\dt"
```

### Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-enabled/default
```

Replace the entire file with:

```nginx
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8001;
    }
}
```

> **Important:** CORS is handled by FastAPI's `CORSMiddleware`, **not** by Nginx. Do not add `Access-Control-Allow-Origin` headers in Nginx — it causes conflicts (browsers reject responses with duplicate or multiple CORS headers).

Test and apply:

```bash
sudo nginx -t
sudo systemctl restart nginx
```
> **Note:**  
> The exact Nginx configuration used in production is versioned in this repository:
>
> ```
> nginx/nginx.conf
> ```
>
> This file can be copied directly to `/etc/nginx/sites-enabled/default` on the EC2 instance.


### Step 9: Start Backend as Background Process

```bash
cd ~/ai-document-search/backend
source ../venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
```

Verify it's running:

```bash
tail -5 backend.log
# Should see: Uvicorn running on http://0.0.0.0:8001
```

Test the backend through Nginx:

```bash
curl http://localhost/health
```

### Step 10: Deploy Frontend to S3

1. **Build the React app locally:**

```bash
cd frontend
npm install
npm run build
```

2. **AWS Console → S3 → Create Bucket**
   - **Bucket name:** `<YOUR_S3_BUCKET>` (must be globally unique)
   - **Region:** `us-east-1`
   - **Uncheck** "Block all public access"
3. **Properties tab → Static website hosting → Enable**
   - Index document: `index.html`
   - Error document: `index.html`
4. **Permissions tab → Bucket Policy** — Add this policy (replace `<YOUR_S3_BUCKET>` with your bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<YOUR_S3_BUCKET>/*"
        }
    ]
}
```

5. Upload the build output using AWS CLI:

```bash
aws s3 sync ./frontend/dist/ s3://<YOUR_S3_BUCKET>/ --delete
```

6. Your frontend is now live at:
```
http://<YOUR_S3_BUCKET>.s3-website-us-east-1.amazonaws.com
```

### Step 11: Configure CORS for S3

The backend needs to know that the S3 frontend is allowed to make API requests. On EC2, the `.env` only needs the S3 origin — localhost entries are irrelevant in production:

```bash
nano ~/ai-document-search/backend/.env
```

Set `CORS_ORIGINS` to:

```
CORS_ORIGINS=http://<YOUR_S3_BUCKET>.s3-website-us-east-1.amazonaws.com
```

Restart the backend:

```bash
pkill -f uvicorn
cd ~/ai-document-search/backend
source ../venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
```

### Deployment Verification

Test the full stack end-to-end:

```bash
# 1. Test Nginx → Backend health check
curl http://<EC2_PUBLIC_IP>/health

# 2. Test registration endpoint
curl -X POST http://<EC2_PUBLIC_IP>/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'

# 3. Test login
curl -X POST http://<EC2_PUBLIC_IP>/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# 4. Open frontend in browser
# http://<YOUR_S3_BUCKET>.s3-website-us-east-1.amazonaws.com
```

---

## 🔧 Environment Variables

### Full `.env` Template

Create `backend/.env` and fill in your values:

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
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

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

> **Note:** The template above is for **local development**. On EC2 (production), update `DATABASE_URL` to your RDS endpoint and set `CORS_ORIGINS` to only the S3 URL. See [Step 6](#step-6-configure-backend-env) and [Step 11](#step-11-configure-cors-for-s3) for details.

### CORS_ORIGINS — Local vs Production

Each environment's `.env` only needs the origins relevant to that environment. Don't mix them.

**Local (`backend/.env` on your machine):**
```
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Production (`backend/.env` on EC2):**
```
CORS_ORIGINS=http://<YOUR_S3_BUCKET>.s3-website-us-east-1.amazonaws.com
```

> **Important:** FastAPI's `CORSMiddleware` sends only one origin per response. Do not add CORS headers in Nginx — duplicate headers cause browsers to reject the response.

> **Security:** Never commit `.env` to GitHub. It is listed in `.gitignore`. Always create it manually on each environment.

---

## 📁 Project Structure

```
ai-document-search/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point, CORS middleware
│   │   ├── config.py                  # Settings loaded from .env
│   │   ├── database.py                # SQLAlchemy engine & session
│   │   ├── limiter.py                 # Rate limiting config (slowapi)
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── document.py
│   │   │   └── message.py
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   │   ├── user.py
│   │   │   ├── room.py
│   │   │   ├── document.py
│   │   │   └── message.py
│   │   ├── routes/                    # API route handlers
│   │   │   ├── auth.py                # Register, Login (rate: 2/day register)
│   │   │   ├── rooms.py               # Room CRUD
│   │   │   ├── documents.py           # Upload, List, Delete (rate: 3/day upload)
│   │   │   └── chat.py                # Chat Q&A (rate: 5/day)
│   │   ├── services/                  # Core business logic
│   │   │   ├── document_processor.py  # Text extraction & chunking
│   │   │   ├── background_tasks.py    # Async embedding generation
│   │   │   └── chat_service.py        # RAG pipeline (async)
│   │   └── utils/                     # Shared utilities
│   │       ├── auth.py                # JWT helpers
│   │       └── validators.py          # Input validation
│   ├── create_tables.py               # Database table creation script
│   ├── uploads/                       # Temporary file storage (gitignored)
│   ├── .env                           # Environment variables (gitignored)
│   └── requirements.txt               # Python dependencies
│
├── frontend/
│   ├── index.html                     # App entry point
│   ├── index.tsx                      # React root
│   ├── App.tsx                        # Router & route definitions
│   ├── constants.ts                   # API URL & app-wide constants
│   ├── types.ts                       # TypeScript type definitions
│   ├── package.json                   # Node dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── vite.config.ts                 # Vite build config
│   ├── pages/
│   │   ├── Login.tsx                  # Login & Register page
│   │   ├── Dashboard.tsx              # Room list dashboard
│   │   └── Room.tsx                   # Chat room (upload docs, ask questions)
│   ├── components/
│   │   └── UI.tsx                     # Shared UI components
│   ├── context/
│   │   └── AuthContext.tsx            # Auth state & JWT management
│   └── services/
│       └── api.ts                     # Axios instance & API call helpers
│
├── nginx/
│   └── nginx.conf                     # Nginx reverse proxy config (EC2 production)
│
├── docs/
│   └── architecture.md               # Mermaid architecture diagrams
│
├── venv/                              # Python virtual environment (gitignored)
├── .env.example                       # Environment variable template
├── .gitignore                         # Ignored files & directories
├── requirements.txt                   # Top-level requirements (mirrors backend/)
├── LICENSE
└── README.md                          # This file
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/auth/register` | Create a new account | 2/day per IP |
| POST | `/auth/login` | Login and get JWT token | — |
| GET | `/auth/me` | Get current user info | — |

### Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | List all rooms for current user |
| POST | `/rooms` | Create a new room |
| GET | `/rooms/{room_id}` | Get room details |
| PUT | `/rooms/{room_id}` | Update room |
| DELETE | `/rooms/{room_id}` | Delete room and all its documents |

### Documents

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/documents/upload/{room_id}` | Upload a document | 3/day per user |
| GET | `/documents/room/{room_id}` | List documents in a room | — |
| DELETE | `/documents/{doc_id}` | Delete a document | — |

### Chat

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/chat/{room_id}` | Send a question, get AI answer | 5/day per user |
| GET | `/chat/history/{room_id}` | Get chat history for a room | — |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## 🧠 How RAG Works

RAG (Retrieval-Augmented Generation) is the core of this application. Here's the flow:

### Document Upload Flow

1. User uploads a file (PDF or TXT, max 2MB)
2. Backend validates the file and saves it to disk
3. A **background task** starts processing:
   - Text is extracted from the file
   - Text is split into chunks (~1000 characters each)
   - Each chunk is sent to OpenAI's `text-embedding-3-small` model to generate a 1536-dimensional vector
   - Vectors + metadata (chunk text, document ID, room ID) are upserted into Pinecone
4. Document status is updated to `processed`
5. Frontend polls `/documents/room/{room_id}` every 3 seconds until status changes

### Chat (Q&A) Flow

1. User asks a question in a room
2. Backend generates an embedding for the question using OpenAI
3. Pinecone is queried for the **top 5 most similar** chunks (by cosine similarity)
4. The retrieved chunks are passed as context to GPT-4 along with the user's question
5. GPT-4 generates an answer grounded in the retrieved context
6. The response includes the AI answer and source references
7. Both the question and answer are saved to the database

---

## 🔍 Troubleshooting

### Rate Limit Errors (429)

If you receive a `429 Too Many Requests` error:
- **Register:** Limited to 2 registrations per day per IP. Wait 24 hours or use a different IP.
- **Chat:** Limited to 5 questions per day per user. Wait until the next day.
- **Upload:** Limited to 3 uploads per day per user.

The rate limiter resets every 24 hours. In development, you can temporarily increase limits in the route files (e.g., `backend/app/routes/auth.py`).

### CORS Errors

If you see `Access-Control-Allow-Origin` errors in the browser console:

1. **Check `CORS_ORIGINS` in `backend/.env`** — The frontend's origin must be in the list.
   - Local: `http://localhost:5173`
   - Production: The full S3 website URL
2. **Do NOT add CORS headers in Nginx.** FastAPI handles CORS via `CORSMiddleware`. Adding headers in Nginx causes duplicate headers, which browsers reject.
3. **Restart the backend** after changing `.env`:
   ```bash
   pkill -f uvicorn
   nohup uvicorn app.main:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
   ```

### EC2 Public IP Changed

The EC2 public IP changes every time the instance is stopped and started (unless you have an Elastic IP). After a restart:

1. Get the new IP from the EC2 console
2. Update your SSH Security Group rule: **Edit inbound rules → SSH → Source → My IP**
3. Use the new IP for SSH connections

### Backend Not Starting

Check the log file:

```bash
tail -20 backend.log
```

Common issues:
- **Database connection error** — Verify `DATABASE_URL` in `.env` and that RDS is running
- **Import error** — Make sure the virtual environment is activated before starting Uvicorn
- **Port already in use** — Kill any existing process: `pkill -f uvicorn`

### Document Processing Stuck

If a document stays in "processing" status:
1. Check backend logs for errors during the background task
2. Verify OpenAI and Pinecone API keys are valid
3. Check if the document content is at least 50 characters after extraction

---

## 💡 Potential Improvements

This is a v1.0 demo project. Ideas for future enhancements:

- **SSL/TLS** — Add HTTPS via Let's Encrypt + Certbot on EC2
- **Custom Domain** — Point a domain name to the S3 frontend and EC2 backend
- **WebSocket** — Real-time chat instead of polling for document status
- **Document Preview** — In-browser PDF/TXT preview before upload
- **Multi-language UI** — Internationalization support
- **Voice Input** — Speech-to-text for asking questions
- **Elastic IP** — Stable IP address for EC2 (avoids updating Security Groups)
- **Auto-scaling** — Move to ECS or Lambda for automatic scaling
- **CI/CD** — GitHub Actions pipeline for automated deployment

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

🐛 **Found a bug? Open an issue!**

💡 **Have an idea? Send a pull request!**

Made with ❤️ by [Hasan Kurt](https://github.com/hasankurtt)

</div>
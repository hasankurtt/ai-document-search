# 🤖 AI Document Search

An AI-powered intelligent document search and Q&A system. Built with GPT-4 and Pinecone vector database, this is a RAG (Retrieval-Augmented Generation) based document management platform that lets users upload documents, ask questions, and get AI-generated answers with source references.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](https://www.docker.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT4-412391.svg)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-blue.svg)](https://www.pinecone.io/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20Route53-FF9900.svg)](https://aws.amazon.com/)
![CI](https://github.com/hasankurtt/ai-document-search/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/hasankurtt/ai-document-search/actions/workflows/cd.yml/badge.svg)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

🌐 **Live Demo:** [https://aidocs.hasankurt.com](https://aidocs.hasankurt.com)

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Current Architecture (v2 — Docker + CI/CD + HTTPS)](#-current-architecture-v2--docker--cicd--https)
3. [Technology Stack](#-technology-stack)
4. [Resource Limits & Cost Control](#-resource-limits--cost-control)
5. [Local Development Setup](#-local-development-setup)
6. [Docker Setup](#-docker-setup)
7. [CI/CD Pipeline](#-cicd-pipeline)
8. [Environment Variables](#-environment-variables)
9. [Project Structure](#-project-structure)
10. [API Endpoints](#-api-endpoints)
11. [How RAG Works](#-how-rag-works)
12. [Troubleshooting](#-troubleshooting)
13. [Previous Architecture (v1)](#-previous-architecture-v1)

---

## ✨ Features

- **Document Upload & Processing** — Upload PDF/TXT files, automatically extracted, chunked, and embedded into a vector database
- **AI-Powered Q&A** — Ask questions about your documents and get GPT-4 generated answers with source references
- **Room-Based Organization** — Create separate rooms to organize documents and conversations by topic
- **Real-Time Processing Status** — Frontend polls every 3 seconds to track document processing progress
- **User Authentication** — Secure JWT-based registration and login system
- **Rate Limiting** — IP and user-based throttling to control costs and prevent abuse
- **HTTPS** — SSL/TLS via Let's Encrypt + Certbot
- **CI/CD** — Automated testing and deployment via GitHub Actions

---

## 🏗️ Current Architecture (v2 — Docker + CI/CD + HTTPS)

> This is the current production architecture as of v2. For the original v1 architecture, see [Previous Architecture (v1)](#-previous-architecture-v1).

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
│                    (Browser)                            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (443)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  AWS EC2 (t2.micro)                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Docker Compose                             │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │   Nginx Container (Port 80 → 443)            │  │  │
│  │  │   - Serves React frontend (static files)     │  │  │
│  │  │   - Reverse proxy /api/ → backend:8001       │  │  │
│  │  │   - SSL termination (Let's Encrypt)          │  │  │
│  │  └──────────────────┬───────────────────────────┘  │  │
│  │                     │ proxy_pass                    │  │
│  │  ┌──────────────────▼───────────────────────────┐  │  │
│  │  │   Backend Container (Port 8001)              │  │  │
│  │  │   FastAPI + Uvicorn                          │  │  │
│  │  └──────────────────┬───────────────────────────┘  │  │
│  │                     │                               │  │
│  │  ┌──────────────────▼───────────────────────────┐  │  │
│  │  │   PostgreSQL Container (Port 5432)           │  │  │
│  │  │   Volume: postgres_data (persistent)         │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  /etc/letsencrypt → mounted into Nginx container (ro)   │
└──────────────────────────────────────────────────────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Route 53 │ │  OpenAI  │ │ Pinecone │
       │  DNS     │ │  GPT-4   │ │  Vector  │
       │          │ │Embeddings│ │    DB    │
       └──────────┘ └──────────┘ └──────────┘
```

**Key design decisions (v2):**
- **Full containerization** — All services (frontend, backend, database) run as Docker containers via Docker Compose. No system-level dependencies needed on EC2.
- **PostgreSQL in Docker** — Replaced AWS RDS with a PostgreSQL container. Data persists via a named Docker volume (`postgres_data`). Eliminates ~$15/month RDS cost.
- **Nginx serves everything** — The Nginx container serves the React static build AND proxies `/api/` requests to the backend container. No S3 needed.
- **HTTPS via Let's Encrypt** — Certbot issues a free SSL certificate for `aidocs.hasankurt.com`. The certificate directory (`/etc/letsencrypt`) is mounted read-only into the Nginx container.
- **HTTP → HTTPS redirect** — Nginx listens on port 80 and issues a 301 redirect to HTTPS.
- **CI/CD via GitHub Actions** — Two workflows: `ci.yml` (runs on every push, builds and health-checks all containers) and `cd.yml` (runs on `main` branch, SSHes into EC2 and deploys).

### CI/CD Pipeline

```
Developer Push
     │
     ├──▶ feature/* branch
     │         │
     │         ▼
     │    CI Workflow (ci.yml)
     │    - Checkout code
     │    - Create .env files from GitHub Secrets
     │    - docker-compose build
     │    - docker-compose up -d
     │    - Health check: curl /health
     │         │
     │         ▼
     │    ✅ CI passes → open PR to main
     │
     └──▶ main branch (after merge)
               │
               ▼
          CI + CD Workflows
          CD (cd.yml):
          - Add runner IP to EC2 security group
          - SSH into EC2
          - git pull origin main
          - docker-compose down
          - docker-compose up --build -d
          - Remove runner IP from security group
               │
               ▼
          ✅ Live at https://aidocs.hasankurt.com
```

### Local Development Architecture

```
┌───────────┐     ┌───────────────┐     ┌──────────────┐
│  Browser  │────▶│  Vite Dev     │     │   FastAPI    │
│ :5173     │     │  Server       │────▶│   Uvicorn    │
│           │     │  (Frontend)   │     │   :8001      │
└───────────┘     └───────────────┘     └──────┬───────┘
                                               │
                                    ┌──────────┼──────────┐
                                    ▼          ▼          ▼
                             ┌──────────┐ ┌────────┐ ┌────────┐
                             │PostgreSQL│ │ OpenAI │ │Pinecone│
                             │ (local)  │ │        │ │        │
                             └──────────┘ └────────┘ └────────┘
```

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, React Router v7, Axios |
| **Backend Framework** | FastAPI 0.111.0 (Async) |
| **Database** | PostgreSQL 15 + SQLAlchemy 2.0 |
| **Vector Database** | Pinecone (Serverless) |
| **AI/LLM** | OpenAI GPT-4 + text-embedding-3-small |
| **RAG Framework** | LangChain 0.2.6 |
| **Authentication** | JWT + Bcrypt |
| **Rate Limiting** | slowapi (in-memory, IP-based) |
| **Containerization** | Docker + Docker Compose |
| **Reverse Proxy** | Nginx (Docker container) |
| **SSL** | Let's Encrypt + Certbot |
| **CI/CD** | GitHub Actions |
| **DNS** | AWS Route 53 |
| **Cloud** | AWS EC2 |

---

## 🛡️ Resource Limits & Cost Control

This project runs in **Demo Mode** — resource constraints are intentionally tight to minimize cloud costs.

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

### Monthly Cost Estimation (v2)

| Service | Cost |
|---------|------|
| EC2 t2.micro | ~$10/month |
| Route 53 hosted zone | ~$0.50/month |
| hasankurt.com domain | ~$1.25/month (billed annually) |
| PostgreSQL (Docker) | $0 (runs on EC2) |
| SSL Certificate | $0 (Let's Encrypt) |
| **Total** | **~$12/month** |

> v1 cost was ~$25-30/month due to RDS (~$15) + S3.

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

### 4. Configure Environment Variables

```bash
cp .env.example backend/.env
```

Fill in your values — see [Environment Variables](#-environment-variables).

### 5. Start Backend

```bash
cd backend
source ../venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### 6. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

---

## 🐳 Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Run Locally with Docker

Create a root `.env` file:

```env
POSTGRES_DB=ai_document_search
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
VITE_API_BASE_URL=http://localhost/api/v1
```

Create `backend/.env` with all backend variables (see [Environment Variables](#-environment-variables)).

Then:

```bash
docker-compose up --build
```

Open: `http://localhost`

### Docker Compose Services

| Service | Image | Port |
|---------|-------|------|
| `frontend` | nginx:alpine (custom) | 80, 443 |
| `backend` | python:3.12-slim (custom) | 8001 |
| `db` | postgres:15 | 5432 (internal only) |

---

## ⚙️ CI/CD Pipeline

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_ENVIRONMENT` | Pinecone environment |
| `PINECONE_INDEX_NAME` | Pinecone index name |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `AWS_ACCESS_KEY_ID` | IAM user for security group management |
| `AWS_SECRET_ACCESS_KEY` | IAM secret |
| `AWS_REGION` | AWS region (e.g. us-east-1) |
| `EC2_SECURITY_GROUP_ID` | EC2 security group ID |
| `EC2_HOST` | EC2 public IP |
| `EC2_USER` | EC2 SSH user (ubuntu) |
| `EC2_SSH_KEY` | EC2 SSH private key (.pem contents) |

### Workflows

**CI (`ci.yml`)** — Runs on every push to any branch:
1. Creates `.env` files from GitHub Secrets
2. Builds Docker images
3. Starts all containers
4. Runs health check: `curl http://localhost:8001/health`

**CD (`cd.yml`)** — Runs on push to `main` only:
1. Adds GitHub Actions runner IP to EC2 security group (SSH port 22)
2. SSHes into EC2 and runs `git pull && docker-compose up --build -d`
3. Removes runner IP from security group (always, even on failure)

---

## 🔧 Environment Variables

### Root `.env` (Docker Compose — not committed)

```env
POSTGRES_DB=ai_document_search
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_strong_password
VITE_API_BASE_URL=https://aidocs.hasankurt.com/api/v1
```

### `backend/.env` (not committed)

```env
# Database
DATABASE_URL=postgresql://your_db_user:your_db_password@db:5432/ai_document_search

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=ai-document-search

# CORS
CORS_ORIGINS=https://aidocs.hasankurt.com,http://localhost

# App
DEBUG=True
APP_NAME=AI Document Search
APP_VERSION=1.0.0
API_PREFIX=/api/v1

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=2097152
ALLOWED_EXTENSIONS=pdf,doc,docx,txt

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
```

---

## 📁 Project Structure

```
ai-document-search/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # CI: build + health check on every push
│       └── cd.yml                     # CD: deploy to EC2 on main branch
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point, startup event
│   │   ├── config.py                  # Settings from .env
│   │   ├── database.py                # SQLAlchemy engine & session
│   │   ├── limiter.py                 # Rate limiting (slowapi)
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   ├── schemas/                   # Pydantic schemas
│   │   ├── routes/                    # API route handlers
│   │   └── services/                  # Business logic (RAG, processing)
│   ├── Dockerfile
│   ├── .env                           # Not committed — create manually
│   └── requirements.txt
│
├── frontend/
│   ├── App.tsx
│   ├── constants.ts                   # API_BASE_URL from VITE_API_BASE_URL env var
│   ├── vite-env.d.ts                  # Vite type declarations
│   ├── Dockerfile                     # Multi-stage: node build → nginx serve
│   ├── nginx.conf                     # Nginx config: HTTPS + API proxy
│   ├── pages/
│   ├── components/
│   ├── context/
│   └── services/
│
├── nginx/
│   └── nginx.conf                     # Reference copy of nginx config
│
├── docs/
│   └── architecture.md
│
├── docker-compose.yml                 # Orchestrates all 3 containers
├── .env                               # Root .env — not committed
├── .env.example
├── .gitignore
└── README.md
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
| GET | `/rooms` | List all rooms |
| POST | `/rooms` | Create a new room |
| GET | `/rooms/{room_id}` | Get room details |
| PUT | `/rooms/{room_id}` | Update room |
| DELETE | `/rooms/{room_id}` | Delete room |

### Documents

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/documents/upload/{room_id}` | Upload a document | 3/day per user |
| GET | `/documents/room/{room_id}` | List documents in room | — |
| DELETE | `/documents/{doc_id}` | Delete a document | — |

### Chat

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/chat/{room_id}` | Ask a question | 5/day per user |
| GET | `/chat/history/{room_id}` | Get chat history | — |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## 🧠 How RAG Works

### Document Upload Flow

1. User uploads a file (PDF or TXT, max 2MB)
2. Backend validates and saves the file
3. Background task starts:
   - Text extracted from file
   - Text split into ~1000 character chunks
   - Each chunk embedded via OpenAI `text-embedding-3-small` (1536 dimensions)
   - Vectors upserted into Pinecone with metadata (chunk text, document ID, room ID)
4. Document status updated to `processed`
5. Frontend polls every 3 seconds until status changes

### Chat (Q&A) Flow

1. User asks a question
2. Backend embeds the question via OpenAI
3. Pinecone queried for top 5 most similar chunks (cosine similarity)
4. Retrieved chunks + question sent to GPT-4
5. GPT-4 generates a grounded answer with source references
6. Question and answer saved to database

---

## 🔍 Troubleshooting

### Rate Limit Errors (429)

- Register: 2/day per IP. Wait 24 hours or use a different IP.
- Chat: 5/day per user.
- Upload: 3/day per user.

### CORS Errors

1. Check `CORS_ORIGINS` in `backend/.env` — the frontend origin must be listed.
2. Restart the backend container: `docker-compose restart backend`
3. Do NOT add CORS headers in Nginx — FastAPI handles CORS.

### SSL Certificate Renewal

Certbot auto-renews. To manually renew:

```bash
docker-compose stop frontend
sudo certbot renew
docker-compose start frontend
```

### EC2 Public IP Changed

If the EC2 IP changes (after stop/start without Elastic IP):
1. Update the `A` record in Route 53
2. Update `EC2_HOST` in GitHub Secrets
3. Update `VITE_API_BASE_URL` in EC2 root `.env` and rebuild

---

## 🗂️ Previous Architecture (v1)

> The following documents the original architecture before Docker containerization. Preserved for reference.

### v1 Production Architecture

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
└──────────────────────┬───────────┘
                       │ API calls (CORS)
                       ▼
┌──────────────────────────────────┐
│         AWS EC2 (t2.micro)       │
│  ┌────────────────────────────┐  │
│  │    Nginx (Port 80)         │  │
│  │  Reverse Proxy → :8001     │  │
│  └───────────────┬────────────┘  │
│                  ▼               │
│  ┌────────────────────────────┐  │
│  │  FastAPI + Uvicorn         │  │
│  │  (Port 8001, nohup)        │  │
│  └───────────────┬────────────┘  │
└──────────────────┼───────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ AWS RDS  │ │  OpenAI  │ │ Pinecone │
│PostgreSQL│ │  GPT-4   │ │  Vector  │
│(db.t3)   │ │Embeddings│ │    DB    │
└──────────┘ └──────────┘ └──────────┘
```

**v1 components:**
- **Frontend on S3** — React build output uploaded via `aws s3 sync`. No server needed.
- **Backend on EC2** — FastAPI running via `nohup uvicorn` behind system Nginx.
- **AWS RDS** — Managed PostgreSQL (db.t3.micro). ~$15/month.
- **No CI/CD** — Manual deployment (SSH → git pull → restart uvicorn).
- **No HTTPS** — HTTP only in v1.

### v1 → v2 Migration Summary

| Aspect | v1 | v2 |
|--------|----|----|
| Frontend hosting | AWS S3 | Nginx Docker container on EC2 |
| Backend process | nohup uvicorn | Docker container |
| Database | AWS RDS (~$15/mo) | PostgreSQL Docker container ($0) |
| Nginx | System service | Docker container |
| HTTPS | ❌ | ✅ Let's Encrypt |
| Custom domain | ❌ | ✅ aidocs.hasankurt.com |
| CI/CD | ❌ | ✅ GitHub Actions |
| Monthly cost | ~$25-30 | ~$12 |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

🐛 **Found a bug? Open an issue!**

💡 **Have an idea? Send a pull request!**

Made with ❤️ by [Hasan Kurt](https://github.com/hasankurtt)

</div>
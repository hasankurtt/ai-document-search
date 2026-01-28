# Architecture Diagrams

## Current Architecture (v1.0 - Local Development)

```mermaid
flowchart TB
    User[👤 User<br/>Browser]
    
    subgraph Local["💻 Local Development"]
        Frontend[🌐 Frontend<br/>localhost:8080<br/>Static HTML/CSS/JS]
        Backend[⚙️ Backend<br/>localhost:8001<br/>FastAPI + Uvicorn]
        DB[(🗄️ PostgreSQL<br/>localhost:5432)]
        Uploads[📁 Uploads Folder<br/>Local Storage]
    end
    
    subgraph External["☁️ External Services"]
        OpenAI[🤖 OpenAI API<br/>GPT-4<br/>text-embedding-3-small]
        Pinecone[🔍 Pinecone<br/>Vector Database<br/>Serverless]
    end
    
    User -->|HTTP| Frontend
    Frontend -->|REST API<br/>Port 8001| Backend
    Backend -->|SQLAlchemy| DB
    Backend -->|Store Files| Uploads
    Backend -->|Generate Embeddings<br/>Chat Completion| OpenAI
    Backend -->|Upsert/Query<br/>Vectors| Pinecone
    
    style User fill:#4A90E2
    style Frontend fill:#7B68EE
    style Backend fill:#50C878
    style DB fill:#FF6B6B
    style OpenAI fill:#FFD700
    style Pinecone fill:#FF69B4
    style Uploads fill:#DDA0DD
```

---

## Future Architecture (v1.1 - AWS Deployment with Nginx)

```mermaid
flowchart TB
    User[👤 User<br/>Browser]
    
    subgraph AWS["☁️ AWS Cloud"]
        subgraph PublicSubnet["🌐 Public Subnet"]
            Nginx[🔒 Nginx<br/>Reverse Proxy<br/>Port 80/443<br/>SSL/TLS]
        end
        
        subgraph PrivateSubnet["🔐 Private Subnet"]
            Backend[⚙️ Backend<br/>EC2 Instance<br/>FastAPI<br/>Port 8001<br/>localhost only]
            RDS[(🗄️ PostgreSQL RDS<br/>Private IP)]
        end
        
        S3[📦 S3 Bucket<br/>File Storage<br/>Optional]
    end
    
    subgraph External["🌍 External Services"]
        OpenAI[🤖 OpenAI API<br/>GPT-4<br/>Embeddings]
        Pinecone[🔍 Pinecone<br/>Vector DB]
    end
    
    User -->|HTTPS| Nginx
    Nginx -->|Proxy Pass<br/>Internal Network| Backend
    Backend -->|Private Connection| RDS
    Backend -->|Upload Files| S3
    Backend -->|API Calls| OpenAI
    Backend -->|Vector Operations| Pinecone
    
    style User fill:#4A90E2
    style Nginx fill:#FF6B6B
    style Backend fill:#50C878
    style RDS fill:#FF6B6B
    style S3 fill:#FF9900
    style OpenAI fill:#FFD700
    style Pinecone fill:#FF69B4
    style PublicSubnet fill:#E8F4F8,stroke:#4A90E2,stroke-width:2px
    style PrivateSubnet fill:#FFE8E8,stroke:#FF6B6B,stroke-width:2px
```

---

## Key Architecture Differences

### v1.0 (Current - Local)
- ✅ **Frontend**: Served via Python HTTP server (localhost:8080)
- ✅ **Backend**: Directly accessible (localhost:8001)
- ✅ **Database**: Local PostgreSQL
- ✅ **Storage**: Local file system
- ⚠️ **Security**: Development mode, all ports exposed locally

### v1.1 (Future - AWS)
- ✅ **Frontend**: Could be on S3 + CloudFront (or served by Nginx)
- ✅ **Nginx**: Acts as reverse proxy and security gateway
- ✅ **Backend**: Hidden in private subnet, only accessible via Nginx
- ✅ **Database**: Managed RDS in private subnet
- ✅ **Storage**: S3 bucket (scalable, durable)
- ✅ **Security**: 
  - Backend not exposed to internet
  - Single entry point (Port 80/443)
  - SSL/TLS encryption
  - Security groups & network ACLs

---

## Security Flow (v1.1)

```mermaid
flowchart LR
    Internet((🌐 Internet))
    
    subgraph SecurityLayer["🛡️ Security Layer"]
        SG1[Security Group<br/>Port 80/443 OPEN<br/>Port 8001 CLOSED]
        Nginx[Nginx<br/>Request Filtering<br/>Rate Limiting<br/>SSL Termination]
    end
    
    subgraph Application["⚙️ Application Layer"]
        Backend[Backend<br/>JWT Auth<br/>Input Validation<br/>Business Logic]
    end
    
    subgraph Data["💾 Data Layer"]
        RDS[(RDS<br/>Private Subnet)]
        Pinecone[Pinecone<br/>Vector DB]
    end
    
    Internet -->|HTTPS Request| SG1
    SG1 -->|Allowed| Nginx
    Nginx -->|Filtered & Proxied| Backend
    Backend --> RDS
    Backend --> Pinecone
    
    style Internet fill:#4A90E2
    style SG1 fill:#FF6B6B
    style Nginx fill:#FF6B6B
    style Backend fill:#50C878
    style RDS fill:#FF6B6B
    style Pinecone fill:#FF69B4
```

---

## Rate Limiting Architecture

```mermaid
flowchart TB
    User[👤 User Request]
    
    subgraph RateLimiter["⏱️ Rate Limiter slowapi"]
        Limiter[In-Memory Counter<br/>IP-based]
        
        Register[Register: 2/day]
        Chat[Chat: 5/day]
        Upload[Upload: 3/day]
    end
    
    subgraph ResourceLimits["📊 Resource Limits"]
        Rooms[Max 2 Rooms<br/>per User]
        Docs[Max 3 Documents<br/>per User]
        Size[Max 2MB<br/>File Size]
    end
    
    Backend[⚙️ Backend Endpoints]
    
    User --> Limiter
    Limiter --> Register
    Limiter --> Chat
    Limiter --> Upload
    
    Register -->|Pass| Backend
    Chat -->|Pass| Backend
    Upload -->|Pass| Backend
    
    Backend --> Rooms
    Backend --> Docs
    Backend --> Size
    
    Limiter -.->|429 Too Many<br/>Requests| User
    Backend -.->|400 Bad<br/>Request| User
    
    style User fill:#4A90E2
    style Limiter fill:#FFD700
    style Backend fill:#50C878
    style Rooms fill:#FF6B6B
    style Docs fill:#FF6B6B
    style Size fill:#FF6B6B
```

---

## Data Flow: Document Upload & RAG

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🌐 Frontend
    participant B as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL
    participant OAI as 🤖 OpenAI
    participant PC as 🔍 Pinecone

    Note over U,PC: Document Upload Flow
    
    U->>F: Upload Document (PDF/DOCX)
    F->>B: POST /api/v1/documents/upload/{room_id}
    
    rect rgb(255, 235, 205)
        Note over B: Rate Limit Check (3/day)
        Note over B: Resource Limit (Max 3 docs)
        Note over B: File Validation (2MB, 50 chars)
    end
    
    B->>DB: Save Document Record
    B->>F: 201 Created (Processing...)
    
    rect rgb(230, 230, 250)
        Note over B: Background Task
        B->>B: Extract Text from File
        B->>B: Split into Chunks (1000 chars)
        B->>OAI: Generate Embeddings
        OAI-->>B: Return Vectors (1536 dim)
        B->>PC: Upsert Vectors + Metadata
        B->>DB: Update: processed=True
    end
    
    F->>B: Poll Status (every 3s)
    B-->>F: Processing → Processed ✅

    Note over U,PC: Chat/RAG Flow
    
    U->>F: Ask Question
    F->>B: POST /api/v1/chat/{room_id}
    
    rect rgb(255, 235, 205)
        Note over B: Rate Limit Check (5/day)
    end
    
    B->>OAI: Generate Question Embedding
    OAI-->>B: Question Vector
    B->>PC: Query Similar Vectors (top_k=5)
    PC-->>B: Return Relevant Chunks
    B->>OAI: GPT-4 Completion (Question + Context)
    OAI-->>B: AI Answer
    B->>DB: Save Message (User + AI)
    B-->>F: Response + Sources
    F->>U: Display Answer with Sources
```

---

## Technology Stack Overview

```mermaid
mindmap
  root((AI Document<br/>Search))
    Frontend
      HTML5/CSS3
      Vanilla JavaScript
      LocalStorage
      Fetch API
    Backend
      FastAPI
        Async/Await
        Pydantic
        Background Tasks
      SQLAlchemy 2.0
        PostgreSQL
        Async Engine
      Authentication
        JWT
        Bcrypt
      Rate Limiting
        slowapi
        In-Memory
    AI/ML
      OpenAI
        GPT-4
        text-embedding-3-small
      LangChain
        RAG Implementation
        Text Splitting
      Pinecone
        Vector Database
        Serverless
    Infrastructure
      Current
        Local Dev
        Python HTTP Server
        PostgreSQL Local
      Future v1.1
        AWS EC2
        AWS RDS
        Nginx
        S3 Optional
```

---

## Notes

- **Mermaid diagrams** render automatically on GitHub
- Save this file as `docs/architecture.md`
- Reference in main README: `[Architecture Diagrams](docs/architecture.md)`
- For PNG/SVG exports, use [Mermaid Live Editor](https://mermaid.live/)

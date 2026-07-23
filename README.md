# AIOS (Artificial Intelligence Operating System)

> **"The Enterprise Multi-Agent AI Platform"**

[![CI](https://github.com/harshchavan009/AI-Chatbot/actions/workflows/ci.yml/badge.svg)](https://github.com/harshchavan009/AI-Chatbot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/Python-3.14-green.svg)](https://python.org)
[![React Version](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)

AIOS is a commercial-grade, enterprise multi-agent platform designed to orchestrate complex reasoning, hybrid vector/graph retrieval (Graph RAG), automated workflow execution, and semantic memory across enterprise datasets.

---

## 🏛️ Platform Architecture & Tech Stack

AIOS follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles:

### Frontend Layer
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Glassmorphism + Dynamic Dark/Light Theme Design System
- **State & Data**: Zustand + React Query (TanStack)
- **UI Components**: shadcn/ui + Framer Motion + Lucide React + Recharts + Monaco Editor

### Backend Layer
- **Framework**: FastAPI (Async / Python 3.14)
- **Persistence**: PostgreSQL 16 (Async SQLAlchemy 2.0) + Redis 7 Caching
- **Graph & Vector DB**: Neo4j (Knowledge Graph) + Qdrant (Vector Embeddings)
- **Object Storage**: MinIO
- **Background Jobs**: Celery + Redis

### Multi-Agent Core
- **LangGraph / LangChain / LlamaIndex**: Orchestration engine for Planner, Retriever, Reasoning, Critic, Tool, and Response agents.
- **Model Gateway**: Multi-provider LLM abstraction layer supporting OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5, and Llama 3.

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.14+
- Node.js 20+

### 1. Run via Docker Compose
```bash
# Clone the repository
git clone https://github.com/harshchavan009/AI-Chatbot.git
cd AIOS

# Start all enterprise services (PostgreSQL, Redis, Qdrant, Neo4j, MinIO, Backend, Frontend)
docker-compose up --build -d
```

Access the applications:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Verification**: [http://localhost:8000/healthz](http://localhost:8000/healthz)

---

## 🧪 Testing

```bash
# Backend Test Suite
cd backend
PYTHONPATH=. pytest tests/ -v --cov=app

# Frontend Build & Type Check
cd frontend
npm run build
```

---

## 📜 License
Released under the MIT License.

# AIOS — Production Deployment Guide

This guide details how to deploy the **AIOS (Artificial Intelligence Operating System)** platform to production with:
- **Frontend** on **Vercel**
- **Backend API & Orchestration** on **Render**
- **Managed Databases & Caches** on **PostgreSQL**, **Redis**, **Neo4j Aura**, and **Qdrant Cloud**
- **Single Canonical User-Facing URL** via Vercel proxy rewrites (`/api/*` ➔ Render)

---

## 1. System Architecture

```
                             USERS
                               │
                               ▼
                    CANONICAL VERCEL DOMAIN
                 (https://your-app.vercel.app)
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
      STATIC SPA ASSETS                         /api/*
   (Vite React 18 / Tailwind)                     │
            │                         (Vercel Rewrite Proxy)
            │                                     │
            ▼                                     ▼
     BROWSER RUNTIME                        RENDER BACKEND
  (Zustand / EventSource / SSE)         (FastAPI / Python 3.12)
                                                  │
                       ┌──────────────────────────┼──────────────────────────┐
                       │                          │                          │
                       ▼                          ▼                          ▼
               MANAGED POSTGRES             MANAGED REDIS              OBJECT STORAGE
             (Users / RBAC / Keys)       (Cache / Rate Limiter)      (Local / S3 / MinIO)
                                                  │
                                       ┌──────────┴──────────┐
                                       │                     │
                                       ▼                     ▼
                                  VECTOR STORE        KNOWLEDGE GRAPH
                                 (Qdrant Cloud)        (Neo4j Aura)
                                       │                     │
                                       └──────────┬──────────┘
                                                  ▼
                                            LLM GATEWAY
                                  (OpenAI / Anthropic / Gemini /
                                   Groq / Together / OpenRouter)
```

---

## 2. Prerequisites

1. **GitHub Repository**: [https://github.com/harshchavan009/AIOS.git](https://github.com/harshchavan009/AIOS.git)
2. **Render Account**: [https://render.com](https://render.com)
3. **Vercel Account**: [https://vercel.com](https://vercel.com)
4. **AI Provider API Keys**: At least one key (OpenAI, Anthropic, or Google Gemini).
5. Optional Managed Services:
   - **Qdrant Cloud**: Free 1GB managed vector cluster ([cloud.qdrant.io](https://cloud.qdrant.io))
   - **Neo4j AuraDB**: Free managed knowledge graph instance ([neo4j.com/cloud/platform/aura-graph-database](https://neo4j.com/cloud/platform/aura-graph-database))

---

## 3. Render Backend Deployment

### Method A: Blueprint Deployment (Recommended)
The repository includes a ready-to-use `render.yaml` infrastructure-as-code specification.

1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** ➔ **Blueprint**.
3. Connect your repository: `https://github.com/harshchavan009/AIOS.git`.
4. Render will automatically detect `render.yaml` and configure:
   - **`aios-backend`** (Web Service, Python 3.12)
   - **`aios-db`** (Managed PostgreSQL database)
   - **`aios-redis`** (Managed Redis cache)
5. Fill in the prompted secret variables:
   - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` (if available)
6. Click **Apply**.
7. Note down your backend URL once deployed (e.g., `https://aios-backend.onrender.com`).

---

### Method B: Manual Web Service Setup
If deploying without Blueprints:

1. **Create PostgreSQL Database**:
   - Click **New +** ➔ **PostgreSQL**.
   - Name: `aios-db`, Database: `aios_db`, User: `aios_user`.
   - Copy the **Internal Database URL**.
2. **Create Redis Instance**:
   - Click **New +** ➔ **Redis**.
   - Name: `aios-redis`.
   - Copy the **Internal Redis URL**.
3. **Create Web Service**:
   - Click **New +** ➔ **Web Service**.
   - Connect the repository `harshchavan009/AIOS`.
   - **Name**: `aios-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/healthz`
4. **Environment Variables**:
   ```ini
   PYTHON_VERSION=3.12.8
   ENVIRONMENT=production
   DEBUG=false
   SECRET_KEY=<generate via openssl rand -hex 32>
   DATABASE_URL=<Paste Postgres connection string>
   REDIS_URL=<Paste Redis connection string>
   FRONTEND_URL=https://<your-vercel-domain>.vercel.app
   BACKEND_CORS_ORIGINS=https://<your-vercel-domain>.vercel.app,http://localhost:5173
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GEMINI_API_KEY=AIza...
   ```
   *(Note: Any `postgres://` URL is automatically normalized to `postgresql+asyncpg://` by the backend configuration)*.

---

## 4. Vercel Frontend Deployment

1. Log in to [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** ➔ **Project**.
3. Import `harshchavan009/AIOS`.
4. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(Click Edit and select the `frontend` folder)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Update Proxy Destination**:
   - Open `frontend/vercel.json` in your repository.
   - Replace `https://YOUR-AIOS-BACKEND.onrender.com` with your real Render URL (e.g. `https://aios-backend.onrender.com`).
   - Push to GitHub (or configure directly).
6. **Environment Variables on Vercel**:
   - Leave `VITE_API_URL` **blank**! Vercel's rewrite rule routes all `/api/*` calls from the same canonical domain directly to Render.
   - If you want direct WebSocket streaming bypassing Vercel:
     `VITE_WS_URL=wss://aios-backend.onrender.com`
7. Click **Deploy**.

---

## 5. Single Canonical URL Architecture

When users visit `https://your-app.vercel.app`:
1. Page routes (`/`, `/dashboard`, `/playground`, `/graph-rag`, etc.) are served from the Vercel CDN.
2. Direct page reloads or deep links rewrite to `/index.html` with **0 404 errors**.
3. Any API request (`/api/v1/auth/me`, `/api/v1/llm/generate`, `/api/v1/rag/query`) is proxied transparently by Vercel to `https://aios-backend.onrender.com/api/v1/...`.
4. Server-Sent Events (SSE) at `/api/v1/observability/stream` stream live telemetry with no buffering (`X-Accel-Buffering: no`).

---

## 6. Custom Domain Configuration

To link custom domains (e.g. `app.aios.dev` or `aios.yourcompany.com`):

1. **Vercel**:
   - Go to **Project Settings** ➔ **Domains**.
   - Add your domain: `app.aios.dev`.
   - Add the requested `CNAME` or `A` record in your DNS provider (Cloudflare, Route53, Namecheap).
2. **Render**:
   - Update `FRONTEND_URL` on Render: `https://app.aios.dev`.
   - Update `BACKEND_CORS_ORIGINS`: `https://app.aios.dev,https://your-app.vercel.app`.
   - Save and redeploy.

---

## 7. Post-Deployment Smoke Test Checklist

- [ ] **Liveness Probe**:
  `curl -i https://your-backend.onrender.com/healthz`
  ➔ Expect `200 OK`, `{"status": "healthy", "platform": "AIOS", ...}`
- [ ] **Readiness Probe**:
  `curl -i https://your-backend.onrender.com/readyz`
  ➔ Expect `200 OK`, `{"status": "ready", "database": "healthy", ...}`
- [ ] **Frontend Single Origin**:
  Open `https://your-app.vercel.app` in your browser.
  ➔ Landing page loads with dark mode, Geist typography, and hairline borders.
- [ ] **User Registration**:
  Navigate to `/register` and create an account.
  ➔ Successfully creates user in PostgreSQL and receives JWT tokens.
- [ ] **User Authentication**:
  Log out and log in at `/login` with seeded admin account:
  - **Email**: `admin@aios.dev`
  - **Password**: `Admin@12345`
  ➔ Enters `/dashboard` smoothly.
- [ ] **Live Telemetry Stream**:
  Check the status bar in `/dashboard`.
  ➔ Live telemetry updates continuously via SSE `/api/v1/observability/stream`.
- [ ] **Deep Linking**:
  Hard refresh (`Cmd+Shift+R`) on `/graph-rag`.
  ➔ Page reloads correctly with zero 404 errors.
- [ ] **Graph RAG Upload & Query**:
  Upload a document (PDF, TXT, or MD) in `/graph-rag`.
  ➔ Stream executes 9 stages, persists state to disk/storage, and answers queries with citations.
- [ ] **Rate Limiting Protection**:
  Send 20 rapid requests to `/api/v1/auth/login`.
  ➔ Returns `429 Too Many Requests` with `Retry-After` header.

---

## 8. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **`404 Not Found` on page refresh** | SPA rewrite rule missing | Verify `vercel.json` has `"source": "/(.*)", "destination": "/index.html"` |
| **`502 Bad Gateway` on `/api/*`** | Wrong Render domain in `vercel.json` | Ensure `destination` points to the exact Render URL without trailing slash |
| **`CORS Error` on API call** | Origin mismatch | Add the exact Vercel origin to `BACKEND_CORS_ORIGINS` on Render |
| **`asyncpg` connection failure** | Driver prefix is `postgres://` | The backend auto-translates `postgres://` to `postgresql+asyncpg://`. Verify credentials. |
| **Worker tasks not processing** | Redis broker offline | Verify `REDIS_URL` points to Render's internal Redis hostname |
| **Rate Limit 429 triggered** | Too many rapid requests | Wait for the `Retry-After` seconds or adjust thresholds in `rate_limiter.py` |

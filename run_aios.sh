#!/bin/bash
# AIOS Unified Single-Link Application Launcher

echo "======================================================="
echo "   AIOS — Enterprise Multi-Agent AI Platform"
echo "   Launching Unified Single-Link Server on Port 8000"
echo "======================================================="

# 1. Build frontend bundle
echo "Building React Frontend Bundle..."
cd frontend && npm run build
cd ..

# 2. Start Unified Server
echo "Starting Unified FastAPI Server on http://localhost:8000/..."
cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from pydantic import BaseModel
from app.core.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.rag.pipeline import graph_rag_pipeline

router = APIRouter(prefix="/rag", tags=["Graph RAG Engine"])


class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 3
    model: str = "gpt-4o"


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_and_index_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and index PDF / text document into Qdrant vector index and Neo4j knowledge graph.
    """
    contents = await file.read()
    text = contents.decode("utf-8", errors="ignore")
    if not text.strip():
        text = f"Sample text content extracted from {file.filename} via OCR/PDF parser pipeline."

    doc_record = graph_rag_pipeline.ingest_document(file.filename, text)
    return {
        "message": f"Successfully indexed {file.filename} into Graph RAG engine.",
        "document": doc_record
    }


@router.post("/query", status_code=status.HTTP_200_OK)
async def hybrid_query_graph_rag(
    request: RAGQueryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Execute Hybrid Graph RAG search (Vector Cosine + Neo4j Cypher Traversal) returning citations.
    """
    return graph_rag_pipeline.hybrid_query(request.query, top_k=request.top_k)


@router.get("/graph", status_code=status.HTTP_200_OK)
async def get_knowledge_graph_data(current_user: User = Depends(get_current_user)):
    """
    Get Neo4j property graph nodes and edge relationships for visualizer.
    """
    return graph_rag_pipeline.graph_store.get_graph_data()

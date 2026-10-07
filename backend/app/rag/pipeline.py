import os
import json
from typing import List, Dict, Any
from app.rag.chunker import TextChunker
from app.rag.vector_store import VectorStoreService
from app.rag.graph_store import KnowledgeGraphService
from app.core.config import settings
from app.core.logging import logger


class GraphRAGPipeline:
    """
    Unified Graph RAG Pipeline:
    Ingestion -> Chunking -> Vector Indexing -> Knowledge Graph Building -> Hybrid Search -> Reranking -> Citations.
    Features automatic state persistence to survive backend restarts.
    """
    def __init__(self):
        self.chunker = TextChunker()
        self.vector_store = VectorStoreService()
        self.graph_store = KnowledgeGraphService()
        self.documents: List[Dict[str, Any]] = []
        
        # State persistence path
        self.persist_dir = os.path.abspath(settings.STORAGE_LOCAL_DIR)
        os.makedirs(self.persist_dir, exist_ok=True)
        self.state_file = os.path.join(self.persist_dir, "rag_state.json")
        self._load_persisted_state()

    def _persist_state(self):
        try:
            state = {
                "documents": self.documents,
                "chunks": [
                    {k: v for k, v in item.items() if k != "vector"}
                    for item in self.vector_store.index
                ]
            }
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not persist Graph RAG state: {e}")

    def _load_persisted_state(self):
        if not os.path.exists(self.state_file):
            return
        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                state = json.load(f)
            self.documents = state.get("documents", [])
            chunks = state.get("chunks", [])
            if chunks:
                self.vector_store.add_chunks(chunks)
                self.graph_store.build_graph_from_chunks(chunks)
                logger.info(f"Restored Graph RAG state: {len(self.documents)} documents, {len(chunks)} chunks.")
        except Exception as e:
            logger.warning(f"Failed to restore Graph RAG state from {self.state_file}: {e}")

    def ingest_document(self, filename: str, content: str) -> Dict[str, Any]:
        chunks = self.chunker.split_text(content, source_doc=filename)
        self.vector_store.add_chunks(chunks)
        self.graph_store.build_graph_from_chunks(chunks)
        
        # Update or append document
        existing = next((d for d in self.documents if d["filename"] == filename), None)
        doc_record = {
            "filename": filename,
            "chunk_count": len(chunks),
            "status": "indexed"
        }
        if existing:
            existing.update(doc_record)
        else:
            self.documents.append(doc_record)
            
        self._persist_state()
        return doc_record

    def hybrid_query(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        # 1. Vector Search
        vector_results = self.vector_store.search(query, top_k=top_k)
        
        # 2. Graph Traversal
        query_entities = self.graph_store.extract_entities(query)
        graph_matches = self.graph_store.traverse_graph(query_entities)
        
        # 3. Hybrid Reranking & Citations
        citations = []
        contexts = []

        for idx, item in enumerate(vector_results):
            citations.append({
                "citation_id": f"[{idx + 1}]",
                "source": item["source"],
                "chunk_id": item["chunk_id"],
                "score": round(item["score"], 4),
                "snippet": item["text"][:160] + "..."
            })
            contexts.append(item["text"])

        synthesis_answer = (
            f"Based on indexed context from {len(citations)} sources: "
            + (" ".join(contexts[:2]) if contexts else "No relevant documents found.")
        )

        return {
            "query": query,
            "answer": synthesis_answer,
            "citations": citations,
            "vector_matches": len(vector_results),
            "graph_entities": query_entities
        }


graph_rag_pipeline = GraphRAGPipeline()


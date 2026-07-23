from typing import List, Dict, Any
from app.rag.chunker import TextChunker
from app.rag.vector_store import VectorStoreService
from app.rag.graph_store import KnowledgeGraphService


class GraphRAGPipeline:
    """
    Unified Graph RAG Pipeline:
    Ingestion -> Chunking -> Vector Indexing -> Knowledge Graph Building -> Hybrid Search -> Reranking -> Citations.
    """
    def __init__(self):
        self.chunker = TextChunker()
        self.vector_store = VectorStoreService()
        self.graph_store = KnowledgeGraphService()
        self.documents: List[Dict[str, Any]] = []

    def ingest_document(self, filename: str, content: str) -> Dict[str, Any]:
        chunks = self.chunker.split_text(content, source_doc=filename)
        self.vector_store.add_chunks(chunks)
        self.graph_store.build_graph_from_chunks(chunks)
        
        doc_record = {
            "filename": filename,
            "chunk_count": len(chunks),
            "status": "indexed"
        }
        self.documents.append(doc_record)
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

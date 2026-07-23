from typing import List, Dict, Any
from app.rag.embeddings import EmbeddingService


class VectorStoreService:
    """
    Qdrant vector store service abstraction with HNSW cosine similarity search.
    """
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.index: List[Dict[str, Any]] = []

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        for chunk in chunks:
            vector = self.embedding_service.get_embedding(chunk["text"])
            self.index.append({
                **chunk,
                "vector": vector
            })

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        query_vector = self.embedding_service.get_embedding(query)
        
        scored_results = []
        for item in self.index:
            sim = sum(a * b for a, b in zip(query_vector, item["vector"]))
            scored_results.append((sim, item))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        
        results = []
        for score, item in scored_results[:top_k]:
            res_item = {k: v for k, v in item.items() if k != "vector"}
            res_item["score"] = float(score)
            results.append(res_item)
            
        return results

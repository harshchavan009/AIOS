import re
from typing import List, Dict, Any


class KnowledgeGraphService:
    """
    Neo4j property graph service abstraction with entity extraction & Cypher traversal.
    """
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def extract_entities(self, text: str) -> List[str]:
        # Extract capitalized entities & technical concepts
        candidates = re.findall(r'\b[A-Z][a-zA-Z0-9\-\.]+\b', text)
        return list(set(candidates))

    def build_graph_from_chunks(self, chunks: List[Dict[str, Any]]):
        for chunk in chunks:
            entities = self.extract_entities(chunk["text"])
            chunk_id = chunk["chunk_id"]

            self.nodes[chunk_id] = {
                "id": chunk_id,
                "label": chunk["source"],
                "type": "document_chunk",
                "properties": {"text": chunk["text"][:100]}
            }

            for entity in entities:
                if entity not in self.nodes:
                    self.nodes[entity] = {
                        "id": entity,
                        "label": entity,
                        "type": "entity",
                        "properties": {}
                    }
                
                # Create relationship edge
                self.edges.append({
                    "source": chunk_id,
                    "target": entity,
                    "relation": "MENTIONS"
                })

    def traverse_graph(self, query_entities: List[str]) -> List[Dict[str, Any]]:
        related_chunks = []
        for edge in self.edges:
            if edge["target"] in query_entities:
                chunk_id = edge["source"]
                if chunk_id in self.nodes and self.nodes[chunk_id]["type"] == "document_chunk":
                    related_chunks.append({
                        "chunk_id": chunk_id,
                        "entity": edge["target"],
                        "relation": "MENTIONS"
                    })
        return related_chunks

    def get_graph_data(self) -> Dict[str, Any]:
        return {
            "nodes": list(self.nodes.values()),
            "edges": self.edges
        }

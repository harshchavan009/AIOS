import re
from typing import List, Dict, Any


class TextChunker:
    """
    Semantic text chunker with sentence-boundary preservation and configurable token overlap.
    """
    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 64):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str, source_doc: str = "document.pdf") -> List[Dict[str, Any]]:
        sentences = re.split(r'(?<=[.?!])\s+', text.strip())
        chunks = []
        current_chunk = []
        current_length = 0
        chunk_index = 0

        for sentence in sentences:
            sentence_len = len(sentence.split())
            if current_length + sentence_len > self.chunk_size and current_chunk:
                chunk_text = " ".join(current_chunk)
                chunks.append({
                    "chunk_id": f"{source_doc}_chunk_{chunk_index}",
                    "text": chunk_text,
                    "source": source_doc,
                    "token_count": current_length,
                    "chunk_index": chunk_index
                })
                chunk_index += 1
                
                # Overlap logic
                overlap_words = chunk_text.split()[-self.chunk_overlap:]
                current_chunk = [" ".join(overlap_words), sentence] if overlap_words else [sentence]
                current_length = len(" ".join(current_chunk).split())
            else:
                current_chunk.append(sentence)
                current_length += sentence_len

        if current_chunk:
            chunk_text = " ".join(current_chunk)
            chunks.append({
                "chunk_id": f"{source_doc}_chunk_{chunk_index}",
                "text": chunk_text,
                "source": source_doc,
                "token_count": current_length,
                "chunk_index": chunk_index
            })

        return chunks

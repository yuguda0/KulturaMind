"""
Vector Database Manager for Cultural Knowledge
Stores and retrieves cultural items for RAG pipeline
Semantic search handled by ASI:One LLM
"""

import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class VectorDatabase:
    """
    Simple vector database for storing cultural knowledge
    Semantic search is handled by ASI:One LLM (not embeddings)
    """

    def __init__(self, api_key: Optional[str] = None):
        """Initialize vector database"""
        self.api_key = api_key or os.getenv('ASI_API_KEY')
        if not self.api_key:
            raise ValueError("ASI_API_KEY not found in environment variables")

        self.embeddings_store = {}  # Simple dict storage
        logger.info(f"✓ Vector database initialized")

    def add_documents(self, documents: List[Dict[str, Any]]) -> int:
        """Add documents to vector database"""
        if not documents:
            return 0

        added_count = 0
        for i, doc in enumerate(documents):
            text = doc.get('text', '')
            if not text:
                continue
            
            # Store document (no embeddings - LLM handles semantic search)
            doc_id = doc.get('id', f'doc_{i}')
            self.embeddings_store[doc_id] = {
                'text': text,
                'metadata': doc.get('metadata', {}),
                'type': doc.get('type', 'unknown')
            }
            added_count += 1
        
        logger.info(f"✓ Added {added_count} documents to vector database")
        return added_count

    def search(self, query: str, top_k: int = 5, score_threshold: float = 0.3) -> List[Dict[str, Any]]:
        """
        Return all documents (semantic search handled by LLM in RAG pipeline)
        
        Args:
            query: Search query (used by LLM for semantic understanding)
            top_k: Number of results
            score_threshold: Minimum score (not used - LLM handles filtering)

        Returns:
            List of documents
        """
        # Return all documents - LLM will do semantic filtering
        results = []
        for doc_id, doc_data in self.embeddings_store.items():
            results.append({
                'id': doc_id,
                'text': doc_data['text'],
                'metadata': doc_data['metadata'],
                'type': doc_data['type'],
                'score': 1.0  # All documents have equal score - LLM decides relevance
            })
        
        # Return top_k
        return results[:top_k]

    def clear(self):
        """Clear all documents"""
        self.embeddings_store.clear()
        logger.info("✓ Cleared all documents")


def load_cultural_data_to_vectors(kb_path: str = None) -> VectorDatabase:
    """
    Load cultural knowledge base into vector database
    
    Args:
        kb_path: Path to cultural_data.json
        
    Returns:
        Initialized VectorDatabase with cultural data
    """
    kb_path = kb_path or Path(__file__).parent / "cultural_data.json"
    
    # Load knowledge base
    with open(kb_path, 'r') as f:
        data = json.load(f)
    
    # Initialize vector database
    vdb = VectorDatabase()
    
    # Extract all cultural items
    documents = []
    for category, items in data.items():
        for item in items:
            documents.append({
                'id': item.get('id', f'{category}_{len(documents)}'),
                'text': item.get('description', item.get('name', '')),
                'type': category,
                'metadata': {
                    'name': item.get('name', ''),
                    'culture': item.get('culture', ''),
                    'category': category
                }
            })
    
    # Add to vector database
    vdb.add_documents(documents)
    
    return vdb

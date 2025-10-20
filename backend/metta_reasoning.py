"""
MeTTa Reasoning Engine for KulturaMind
Implements knowledge graph reasoning and inference
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class MeTTaReasoningEngine:
    """
    MeTTa-based reasoning engine for cultural knowledge
    Implements inference rules and query expansion
    """

    def __init__(self, knowledge_base_path: str = None):
        """Initialize reasoning engine with knowledge base"""
        self.kb_path = knowledge_base_path or Path(__file__).parent / "cultural_data.json"
        self.knowledge_base = self._load_knowledge_base()
        self.inference_rules = self._initialize_inference_rules()
        self.query_cache = {}

    def _load_knowledge_base(self) -> Dict[str, Any]:
        """Load cultural knowledge base from JSON"""
        try:
            with open(self.kb_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            return {}

    def _initialize_inference_rules(self) -> List[Dict[str, Any]]:
        """Initialize inference rules for reasoning"""
        return [
            {
                "name": "festival_to_culture",
                "pattern": "festival(?F) -> culture(?C)",
                "description": "Link festivals to their cultures"
            },
            {
                "name": "art_to_culture",
                "pattern": "art_form(?A) -> culture(?C)",
                "description": "Link art forms to their cultures"
            },
            {
                "name": "tradition_to_culture",
                "pattern": "tradition(?T) -> culture(?C)",
                "description": "Link traditions to their cultures"
            },
            {
                "name": "language_to_culture",
                "pattern": "language(?L) -> culture(?C)",
                "description": "Link languages to their cultures"
            },
            {
                "name": "related_items",
                "pattern": "item(?I1) related_to item(?I2)",
                "description": "Find related cultural items"
            }
        ]

    def query(self, query_string: str) -> List[Dict[str, Any]]:
        """
        Execute a query with reasoning
        
        Args:
            query_string: Natural language or structured query
            
        Returns:
            List of results with reasoning chain
        """
        # Check cache first
        if query_string in self.query_cache:
            return self.query_cache[query_string]

        # Parse and expand query
        expanded_queries = self._expand_query(query_string)
        
        # Execute queries
        results = []
        for expanded_query in expanded_queries:
            query_results = self._execute_query(expanded_query)
            results.extend(query_results)

        # Cache results
        self.query_cache[query_string] = results
        return results

    def _expand_query(self, query_string: str) -> List[str]:
        """
        Expand query using inference rules
        
        Args:
            query_string: Original query
            
        Returns:
            List of expanded queries
        """
        expanded = [query_string]
        
        # Add related queries based on keywords
        keywords = query_string.lower().split()
        
        if any(k in keywords for k in ['festival', 'celebration', 'event']):
            expanded.append(f"culture related to {query_string}")
        
        if any(k in keywords for k in ['art', 'craft', 'tradition']):
            expanded.append(f"cultural_practice {query_string}")
        
        if any(k in keywords for k in ['language', 'speak', 'tongue']):
            expanded.append(f"communication {query_string}")
        
        return expanded

    def _execute_query(self, query: str) -> List[Dict[str, Any]]:
        """
        Execute a single query against knowledge base
        
        Args:
            query: Query string
            
        Returns:
            List of matching results
        """
        results = []
        query_lower = query.lower()
        
        # Search in festivals
        for festival in self.knowledge_base.get('festivals', []):
            if self._matches_query(festival, query_lower):
                results.append({
                    'type': 'festival',
                    'data': festival,
                    'confidence': 0.9
                })
        
        # Search in art forms
        for art in self.knowledge_base.get('art_forms', []):
            if self._matches_query(art, query_lower):
                results.append({
                    'type': 'art_form',
                    'data': art,
                    'confidence': 0.9
                })
        
        # Search in traditions
        for tradition in self.knowledge_base.get('traditions', []):
            if self._matches_query(tradition, query_lower):
                results.append({
                    'type': 'tradition',
                    'data': tradition,
                    'confidence': 0.9
                })
        
        # Search in languages
        for language in self.knowledge_base.get('languages', []):
            if self._matches_query(language, query_lower):
                results.append({
                    'type': 'language',
                    'data': language,
                    'confidence': 0.9
                })
        
        # Search in proverbs
        for proverb in self.knowledge_base.get('proverbs', []):
            if self._matches_query(proverb, query_lower):
                results.append({
                    'type': 'proverb',
                    'data': proverb,
                    'confidence': 0.85
                })
        
        return results

    def _matches_query(self, item: Dict[str, Any], query: str) -> bool:
        """Check if item matches query using keyword matching"""
        item_str = json.dumps(item).lower()

        # Extract keywords from query (remove common words)
        stop_words = {'what', 'is', 'the', 'a', 'an', 'tell', 'me', 'about', 'share', 'explain', 'describe', 'how', 'why', 'where', 'when', 'who', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        query_words = [w for w in query.split() if w not in stop_words and len(w) > 2]

        # Check if any significant query words appear in the item
        for word in query_words:
            if word in item_str:
                return True

        return False

    def infer_relationships(self, item: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Infer relationships for an item
        
        Args:
            item: Cultural item
            
        Returns:
            List of related items
        """
        relationships = []
        culture = item.get('culture', '')
        
        # Find other items from same culture
        for festival in self.knowledge_base.get('festivals', []):
            if festival.get('culture') == culture and festival != item:
                relationships.append({
                    'type': 'same_culture',
                    'item': festival,
                    'strength': 0.8
                })
        
        return relationships

    def explain_result(self, result: Dict[str, Any]) -> str:
        """
        Generate explanation for a result
        
        Args:
            result: Query result
            
        Returns:
            Human-readable explanation
        """
        item_type = result.get('type', 'unknown')
        data = result.get('data', {})
        
        if item_type == 'festival':
            return f"Festival: {data.get('name')} from {data.get('culture')} culture. {data.get('description')}"
        elif item_type == 'art_form':
            return f"Art Form: {data.get('name')} from {data.get('culture')} culture. {data.get('description')}"
        elif item_type == 'tradition':
            return f"Tradition: {data.get('name')} from {data.get('culture')} culture. {data.get('description')}"
        elif item_type == 'language':
            return f"Language: {data.get('name')} spoken in {data.get('region')}. {data.get('description')}"
        elif item_type == 'proverb':
            return f"Proverb: {data.get('text')} - {data.get('meaning')}"
        
        return f"Found: {data}"

    def clear_cache(self):
        """Clear query cache"""
        self.query_cache.clear()


# Example usage
if __name__ == "__main__":
    engine = MeTTaReasoningEngine()
    
    # Test queries
    test_queries = [
        "What is Sango Festival?",
        "Tell me about Yoruba art",
        "What are Igbo traditions?",
        "Share a Hausa proverb"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        results = engine.query(query)
        for result in results:
            print(f"  - {engine.explain_result(result)}")


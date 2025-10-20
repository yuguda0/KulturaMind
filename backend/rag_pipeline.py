"""
RAG Pipeline - Retrieval-Augmented Generation
Combines vector search, knowledge graph reasoning, and LLM generation
"""

import logging
from typing import List, Dict, Any, Optional
from vector_db import VectorDatabase, load_cultural_data_to_vectors
from llm_engine import ASIOneLLM
from metta_reasoning import MeTTaReasoningEngine

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Complete RAG pipeline for cultural heritage
    Retrieves relevant context and generates intelligent responses
    """

    def __init__(self, vector_db: Optional[VectorDatabase] = None, llm: Optional[ASIOneLLM] = None):
        """
        Initialize RAG pipeline
        
        Args:
            vector_db: Vector database instance (creates if None)
            llm: LLM instance (creates if None)
        """
        # Initialize vector database
        if vector_db is None:
            logger.info("Initializing vector database...")
            self.vector_db = load_cultural_data_to_vectors()
        else:
            self.vector_db = vector_db
        
        # Initialize LLM
        if llm is None:
            logger.info("Initializing LLM...")
            try:
                self.llm = ASIOneLLM()
            except ValueError as e:
                logger.warning(f"LLM initialization failed: {e}")
                self.llm = None
        else:
            self.llm = llm
        
        # Initialize MeTTa reasoning
        logger.info("Initializing MeTTa reasoning...")
        self.reasoning_engine = MeTTaReasoningEngine()
        
        logger.info("✓ RAG Pipeline initialized")

    def query(
        self,
        query: str,
        top_k: int = 5,
        use_reasoning: bool = True,
        use_llm: bool = True,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute RAG query with optional web-enriched context

        Args:
            query: User query
            top_k: Number of documents to retrieve
            use_reasoning: Use MeTTa reasoning
            use_llm: Use LLM for generation
            additional_context: Optional web-enriched context (artifacts, Wikipedia data)

        Returns:
            Response with retrieved context and generated answer
        """
        logger.info(f"Processing query: {query}")

        # Log if web enrichment is available
        if additional_context:
            logger.info(f"  Web enrichment available: {additional_context.get('artifact_count', 0)} artifacts enriched")

        # Step 1: Get all documents (LLM will do semantic filtering)
        logger.info("Step 1: Retrieving documents...")
        all_docs = self.vector_db.search(query, top_k=1000)  # Get all
        logger.info(f"  Retrieved {len(all_docs)} documents")

        # Add web-enriched artifacts to documents if available
        if additional_context and additional_context.get('enriched_artifacts'):
            logger.info(f"  Adding {len(additional_context['enriched_artifacts'])} web-enriched artifacts")
            for artifact in additional_context['enriched_artifacts']:
                artifact_doc = {
                    'type': 'artifact',  # Add type at top level for LLM formatter
                    'text': self._format_artifact_for_context(artifact),
                    'metadata': {
                        'name': artifact.get('name', ''),
                        'type': 'artifact',
                        'culture': artifact.get('culture', ''),
                        'web_enriched': True
                    }
                }
                all_docs.insert(0, artifact_doc)  # Prioritize enriched artifacts

        # Step 2: Use LLM to filter semantically relevant documents
        logger.info("Step 2: Semantic filtering with LLM...")
        retrieved_docs = self._filter_documents_with_llm(query, all_docs, top_k)
        logger.info(f"  Filtered to {len(retrieved_docs)} relevant documents")

        # Step 3: MeTTa reasoning (knowledge graph inference)
        reasoning_results = []
        if use_reasoning:
            logger.info("Step 3: Knowledge graph reasoning...")
            reasoning_results = self.reasoning_engine.query(query)
            logger.info(f"  Found {len(reasoning_results)} inferences")

        # Step 4: Combine and rank results
        logger.info("Step 4: Combining results...")
        combined_context = self._combine_results(retrieved_docs, reasoning_results)

        # Add web context to combined context if available
        if additional_context and additional_context.get('web_context'):
            web_ctx = additional_context['web_context']
            if web_ctx.get('summary'):
                combined_context.insert(0, {
                    'text': f"Wikipedia Context: {web_ctx.get('summary', '')}",
                    'metadata': {'source': 'Wikipedia', 'type': 'web_context'}
                })

        # Step 5: Generate response with LLM
        response_text = ""
        if use_llm and self.llm:
            logger.info("Step 5: Generating response with LLM...")
            response_text = self.llm.generate_response(query, combined_context)
        else:
            logger.info("Step 5: Generating response from context...")
            response_text = self._generate_fallback_response(query, combined_context)

        return {
            'query': query,
            'response': response_text,
            'retrieved_documents': retrieved_docs,
            'reasoning_results': reasoning_results,
            'context_count': len(combined_context),
            'used_llm': use_llm and self.llm is not None,
            'web_enriched': additional_context is not None
        }

    def _filter_documents_with_llm(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Use LLM to filter semantically relevant documents

        Args:
            query: User query
            documents: All available documents
            top_k: Number of documents to return

        Returns:
            Top k semantically relevant documents
        """
        if not self.llm or not documents:
            return documents[:top_k]

        try:
            # Ask LLM to identify relevant documents
            doc_list = "\n".join([f"- {d['metadata'].get('name', d['text'][:50])}: {d['text'][:100]}" for d in documents])

            filter_prompt = f"""Given this query: "{query}"

Which of these cultural items are most relevant? Return only the names/IDs of the top {top_k} most relevant items, one per line.

Items:
{doc_list}"""

            # Get LLM response
            response = self.llm.generate_response(query, [{'text': filter_prompt}])

            # Parse response to get relevant document names
            relevant_names = set()
            for line in response.split('\n'):
                line = line.strip().lower()
                if line and not line.startswith('-'):
                    relevant_names.add(line)

            # Filter documents based on LLM response
            filtered = []
            for doc in documents:
                name = doc['metadata'].get('name', '').lower()
                if name in relevant_names or len(filtered) < top_k:
                    filtered.append(doc)
                    if len(filtered) >= top_k:
                        break

            return filtered if filtered else documents[:top_k]
        except Exception as e:
            logger.warning(f"LLM filtering failed: {e}, returning top_k documents")
            return documents[:top_k]

    def _combine_results(
        self,
        retrieved_docs: List[Dict[str, Any]],
        reasoning_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Combine and rank retrieved documents and reasoning results
        
        Args:
            retrieved_docs: Documents from vector search
            reasoning_results: Results from MeTTa reasoning
            
        Returns:
            Combined and ranked context
        """
        combined = []
        
        # Add retrieved documents (highest priority - semantic relevance)
        for doc in retrieved_docs:
            combined.append({
                'type': doc.get('type'),
                'text': doc.get('text'),
                'metadata': doc.get('metadata', {}),
                'score': doc.get('score', 0),
                'source': 'semantic_search'
            })
        
        # Add reasoning results (knowledge graph inferences)
        for result in reasoning_results:
            data = result.get('data', {})
            combined.append({
                'type': result.get('type'),
                'text': f"{data.get('name', '')} - {data.get('description', '')}",
                'metadata': data,
                'score': result.get('confidence', 0.8),
                'source': 'knowledge_graph'
            })
        
        # Remove duplicates and sort by score
        seen = set()
        unique_combined = []
        for item in combined:
            key = (item['type'], item['metadata'].get('id', item['text']))
            if key not in seen:
                seen.add(key)
                unique_combined.append(item)
        
        # Sort by score (descending)
        unique_combined.sort(key=lambda x: x['score'], reverse=True)
        
        return unique_combined

    def _format_artifact_for_context(self, artifact: Dict[str, Any]) -> str:
        """
        Format artifact data for inclusion in context

        Args:
            artifact: Artifact dictionary

        Returns:
            Formatted artifact text
        """
        parts = []

        # Basic info
        if artifact.get('name'):
            parts.append(f"Artifact: {artifact['name']}")
        if artifact.get('culture'):
            parts.append(f"Culture: {artifact['culture']}")
        if artifact.get('era'):
            parts.append(f"Era: {artifact['era']}")
        if artifact.get('year'):
            parts.append(f"Period: {artifact['year']}")

        # Description
        if artifact.get('description'):
            parts.append(f"Description: {artifact['description']}")

        # Significance
        if artifact.get('significance'):
            parts.append(f"Significance: {artifact['significance']}")

        # Cultural context
        if artifact.get('culturalContext'):
            parts.append(f"Cultural Context: {artifact['culturalContext']}")

        # Web enrichment
        if artifact.get('web_context'):
            web_ctx = artifact['web_context']
            if web_ctx.get('artifact', {}).get('summary'):
                parts.append(f"Wikipedia Info: {web_ctx['artifact']['summary'][:200]}")

        return "\n".join(parts)

    def _generate_fallback_response(
        self,
        query: str,
        context: List[Dict[str, Any]]
    ) -> str:
        """
        Generate response without LLM (fallback)
        
        Args:
            query: User query
            context: Retrieved context
            
        Returns:
            Generated response
        """
        if not context:
            return "I don't have information about that in the cultural knowledge base."
        
        # Use top result
        primary = context[0]
        metadata = primary.get('metadata', {})
        
        response = f"**{metadata.get('name', 'Cultural Item')}**\n\n"
        response += f"Culture: {metadata.get('culture', 'Unknown')}\n"
        response += f"Type: {primary.get('type', 'Unknown').replace('_', ' ').title()}\n\n"
        response += f"{primary.get('text', 'Information available in knowledge base.')}\n\n"
        
        if len(context) > 1:
            response += f"*Related items: {', '.join([c['metadata'].get('name', 'Unknown') for c in context[1:3]])}*"
        
        return response

    def get_stats(self) -> Dict[str, Any]:
        """Get pipeline statistics"""
        return {
            'documents_stored': len(self.vector_db.embeddings_store),
            'llm_available': self.llm is not None,
            'reasoning_engine': 'MeTTa'
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Initialize pipeline
    pipeline = RAGPipeline()
    
    # Test queries
    test_queries = [
        "Tell me about Sango Festival",
        "What is Adire textile?",
        "Explain Yoruba culture",
        "Share a Hausa proverb"
    ]
    
    print("\n" + "="*70)
    print("RAG PIPELINE TEST")
    print("="*70)
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 70)
        
        result = pipeline.query(query, use_llm=False)  # Test without LLM first
        
        print(f"Response:\n{result['response']}")
        print(f"\nContext: {result['context_count']} items | LLM: {result['used_llm']}")
    
    print("\n" + "="*70)
    print(f"Pipeline Stats: {pipeline.get_stats()}")
    print("="*70)


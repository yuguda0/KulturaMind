"""
Heritage Keeper Agent
Specialized agent for cultural knowledge base queries and MeTTa reasoning
"""

from uagents import Context
from typing import Dict, Any
import logging
from .base_agent import BaseKulturaAgent, AgentMessage, AgentResponse
from rag_pipeline import RAGPipeline

logger = logging.getLogger(__name__)


class HeritageKeeperAgent(BaseKulturaAgent):
    """
    Heritage Keeper Agent - Main cultural knowledge specialist
    Handles queries about African cultural heritage using RAG pipeline
    """
    
    def __init__(self):
        super().__init__(
            name="heritage-keeper",
            port=8001,
            seed="kulturamind-heritage-keeper-seed"
        )
        
        # Initialize RAG pipeline
        logger.info("Initializing RAG pipeline for Heritage Keeper...")
        self.rag_pipeline = RAGPipeline()
        logger.info("✓ Heritage Keeper ready with RAG pipeline")
    
    def _register_handlers(self):
        """Register message handlers"""
        
        @self.agent.on_message(model=AgentMessage)
        async def handle_message(ctx: Context, sender: str, msg: AgentMessage):
            """Handle incoming cultural knowledge queries"""
            ctx.logger.info(f"Heritage Keeper received: {msg.message}")
            
            response = await self.process_message(ctx, sender, msg)
            await ctx.send(sender, response)
        
        @self.agent.on_interval(period=60.0)
        async def heartbeat(ctx: Context):
            """Periodic heartbeat"""
            ctx.logger.info("Heritage Keeper is active...")
    
    async def process_message(self, ctx: Context, sender: str, msg: AgentMessage) -> AgentResponse:
        """
        Process cultural knowledge query
        
        Args:
            ctx: Agent context
            sender: Sender address
            msg: Query message
            
        Returns:
            Cultural knowledge response
        """
        try:
            # Extract query and context
            query = msg.message
            additional_context = msg.context or {}
            
            # Execute RAG pipeline
            result = self.rag_pipeline.query(
                query=query,
                top_k=10,
                use_reasoning=True,
                use_llm=True,
                additional_context=additional_context
            )
            
            # Calculate confidence based on retrieved documents
            confidence = self._calculate_confidence(result)
            
            # Format sources
            sources = [
                {
                    'type': doc.get('type'),
                    'name': doc.get('metadata', {}).get('name', 'Unknown'),
                    'culture': doc.get('metadata', {}).get('culture', 'Unknown'),
                    'score': doc.get('score', 0)
                }
                for doc in result['retrieved_documents'][:5]
            ]
            
            return AgentResponse(
                response=result['response'],
                agent_name=self.name,
                confidence=confidence,
                sources=sources,
                metadata={
                    'retrieved_docs': len(result['retrieved_documents']),
                    'reasoning_inferences': len(result['reasoning_results']),
                    'used_llm': result['used_llm'],
                    'web_enriched': result.get('web_enriched', False)
                }
            )
            
        except Exception as e:
            logger.error(f"Heritage Keeper error: {e}")
            return AgentResponse(
                response=f"I encountered an error processing your cultural query: {str(e)}",
                agent_name=self.name,
                confidence=0.0,
                sources=[],
                metadata={'error': str(e)}
            )
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """
        Calculate confidence score based on RAG results
        
        Args:
            result: RAG pipeline result
            
        Returns:
            Confidence score (0-1)
        """
        # Base confidence
        confidence = 0.5
        
        # Boost for retrieved documents
        if result['retrieved_documents']:
            confidence += 0.2
        
        # Boost for reasoning results
        if result['reasoning_results']:
            confidence += 0.15
        
        # Boost for LLM usage
        if result['used_llm']:
            confidence += 0.1
        
        # Boost for web enrichment
        if result.get('web_enriched'):
            confidence += 0.05
        
        return min(confidence, 1.0)


if __name__ == "__main__":
    # Test Heritage Keeper agent
    logging.basicConfig(level=logging.INFO)
    agent = HeritageKeeperAgent()
    agent.run()


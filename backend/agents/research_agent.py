"""
Research Agent
Specialized agent for web enrichment and external data gathering
"""

from uagents import Context
from typing import Dict, Any, List
import logging
from .base_agent import BaseKulturaAgent, AgentMessage, AgentResponse
from web_agent import WebFetchingAgent

logger = logging.getLogger(__name__)


class ResearchAgent(BaseKulturaAgent):
    """
    Research Agent - Web enrichment specialist
    Gathers additional context from Wikipedia and web sources
    """

    def __init__(self):
        super().__init__(
            name="research-agent",
            port=8002,
            seed="kulturamind-research-agent-seed"
        )

        # Initialize web fetching agent
        logger.info("Initializing web fetching for Research Agent...")
        self.web_agent = WebFetchingAgent()
        logger.info("✓ Research Agent ready with web fetching")
    
    def _register_handlers(self):
        """Register message handlers"""
        
        @self.agent.on_message(model=AgentMessage)
        async def handle_message(ctx: Context, sender: str, msg: AgentMessage):
            """Handle incoming research requests"""
            ctx.logger.info(f"Research Agent received: {msg.message}")
            
            response = await self.process_message(ctx, sender, msg)
            await ctx.send(sender, response)
        
        @self.agent.on_interval(period=60.0)
        async def heartbeat(ctx: Context):
            """Periodic heartbeat"""
            ctx.logger.info("Research Agent is active...")
    
    async def process_message(self, ctx: Context, sender: str, msg: AgentMessage) -> AgentResponse:
        """
        Process research request
        
        Args:
            ctx: Agent context
            sender: Sender address
            msg: Research request message
            
        Returns:
            Research results with web-enriched data
        """
        try:
            # Initialize web agent session if needed
            if not self.web_agent.session:
                await self.web_agent.initialize()

            query = msg.message
            context = msg.context or {}

            # Determine research type
            task_type = msg.task_type
            
            if task_type == "artifact_enrichment":
                # Enrich artifact data
                artifact = context.get('artifact', {})
                enriched = await self.web_agent.enrich_artifact_data(artifact)
                
                response_text = self._format_artifact_enrichment(enriched)
                confidence = 0.8 if enriched.get('web_context') else 0.5
                sources = self._extract_sources(enriched)
                
            elif task_type == "cultural_context":
                # Fetch cultural context
                artifact_name = context.get('artifact_name', query)
                culture = context.get('culture', '')
                
                cultural_context = await self.web_agent.fetch_cultural_context(
                    artifact_name, culture
                )
                
                response_text = self._format_cultural_context(cultural_context)
                confidence = 0.75 if cultural_context.get('enriched') else 0.4
                sources = self._extract_cultural_sources(cultural_context)
                
            elif task_type == "wikipedia_search":
                # Search Wikipedia
                summary = await self.web_agent.fetch_wikipedia_summary(query)
                
                if summary:
                    response_text = f"Wikipedia: {summary}"
                    confidence = 0.85
                    sources = [{'source': 'Wikipedia', 'query': query}]
                else:
                    response_text = "No Wikipedia information found."
                    confidence = 0.3
                    sources = []
            
            else:
                # General web search
                related = await self.web_agent.search_related_artifacts(query, limit=5)
                
                response_text = self._format_related_items(related)
                confidence = 0.7 if related else 0.4
                sources = [{'source': 'Web Search', 'count': len(related)}]
            
            return AgentResponse(
                response=response_text,
                agent_name=self.name,
                confidence=confidence,
                sources=sources,
                metadata={
                    'task_type': task_type,
                    'enriched': True
                }
            )
            
        except Exception as e:
            logger.error(f"Research Agent error: {e}")
            return AgentResponse(
                response=f"Research error: {str(e)}",
                agent_name=self.name,
                confidence=0.0,
                sources=[],
                metadata={'error': str(e)}
            )
    
    def _format_artifact_enrichment(self, enriched: Dict[str, Any]) -> str:
        """Format enriched artifact data"""
        parts = []
        
        if enriched.get('web_context'):
            web_ctx = enriched['web_context']
            
            if web_ctx.get('artifact', {}).get('summary'):
                parts.append(f"**Artifact Context**: {web_ctx['artifact']['summary']}")
            
            if web_ctx.get('culture', {}).get('summary'):
                parts.append(f"**Cultural Context**: {web_ctx['culture']['summary']}")
        
        if enriched.get('related_items'):
            related_names = [item.get('title', 'Unknown') for item in enriched['related_items'][:3]]
            parts.append(f"**Related Items**: {', '.join(related_names)}")
        
        return "\n\n".join(parts) if parts else "Enrichment data gathered."
    
    def _format_cultural_context(self, context: Dict[str, Any]) -> str:
        """Format cultural context"""
        parts = []
        
        if context.get('artifact', {}).get('summary'):
            parts.append(f"**Artifact**: {context['artifact']['summary']}")
        
        if context.get('culture', {}).get('summary'):
            parts.append(f"**Culture**: {context['culture']['summary']}")
        
        return "\n\n".join(parts) if parts else "Cultural context gathered."
    
    def _format_related_items(self, items: List[Dict[str, Any]]) -> str:
        """Format related items"""
        if not items:
            return "No related items found."
        
        formatted = ["**Related Cultural Items**:"]
        for i, item in enumerate(items[:5], 1):
            title = item.get('title', 'Unknown')
            snippet = item.get('snippet', '')[:100]
            formatted.append(f"{i}. {title}: {snippet}...")
        
        return "\n".join(formatted)
    
    def _extract_sources(self, enriched: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract sources from enriched data"""
        sources = []
        
        if enriched.get('web_context', {}).get('artifact'):
            sources.append({'source': 'Wikipedia', 'type': 'artifact'})
        
        if enriched.get('web_context', {}).get('culture'):
            sources.append({'source': 'Wikipedia', 'type': 'culture'})
        
        if enriched.get('related_items'):
            sources.append({'source': 'Web Search', 'count': len(enriched['related_items'])})
        
        return sources
    
    def _extract_cultural_sources(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract sources from cultural context"""
        sources = []
        
        if context.get('artifact'):
            sources.append({'source': 'Wikipedia', 'type': 'artifact'})
        
        if context.get('culture'):
            sources.append({'source': 'Wikipedia', 'type': 'culture'})
        
        return sources


if __name__ == "__main__":
    # Test Research agent
    logging.basicConfig(level=logging.INFO)
    agent = ResearchAgent()
    agent.run()


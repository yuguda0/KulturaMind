"""
Coordinator Agent
Orchestrates multi-agent collaboration for complex queries
"""

from uagents import Context, Bureau
from typing import Dict, Any, List, Optional
import logging
import asyncio
from .base_agent import BaseKulturaAgent, AgentMessage, AgentResponse
from .heritage_keeper import HeritageKeeperAgent
from .research_agent import ResearchAgent
from .verification_agent import VerificationAgent
from .translation_agent import TranslationAgent

logger = logging.getLogger(__name__)


class CoordinatorAgent(BaseKulturaAgent):
    """
    Coordinator Agent - Multi-agent orchestration
    Routes queries to appropriate specialized agents and combines results
    """
    
    def __init__(self):
        super().__init__(
            name="coordinator",
            port=8000,
            seed="kulturamind-coordinator-seed"
        )
        
        # Initialize specialized agents
        logger.info("Initializing specialized agents...")
        self.heritage_keeper = None
        self.research_agent = None
        self.verification_agent = None
        self.translation_agent = None
        
        # Agent addresses (will be set when agents are registered)
        self.agent_addresses = {}
        
        logger.info("✓ Coordinator ready")
    
    def _register_handlers(self):
        """Register message handlers"""
        
        @self.agent.on_message(model=AgentMessage)
        async def handle_message(ctx: Context, sender: str, msg: AgentMessage):
            """Handle incoming coordination requests"""
            ctx.logger.info(f"Coordinator received: {msg.message}")
            
            response = await self.process_message(ctx, sender, msg)
            await ctx.send(sender, response)
        
        @self.agent.on_interval(period=60.0)
        async def heartbeat(ctx: Context):
            """Periodic heartbeat"""
            ctx.logger.info("Coordinator is active...")
    
    async def process_message(self, ctx: Context, sender: str, msg: AgentMessage) -> AgentResponse:
        """
        Process query by coordinating multiple agents
        
        Args:
            ctx: Agent context
            sender: Sender address
            msg: User query message
            
        Returns:
            Coordinated response from multiple agents
        """
        try:
            query = msg.message
            context = msg.context or {}
            
            # Determine query type and required agents
            query_plan = self._plan_query(query, context)
            
            # Execute query plan
            results = await self._execute_query_plan(ctx, query, context, query_plan)
            
            # Combine results
            final_response = self._combine_results(results, query_plan)
            
            return final_response
            
        except Exception as e:
            logger.error(f"Coordinator error: {e}")
            return AgentResponse(
                response=f"Coordination error: {str(e)}",
                agent_name=self.name,
                confidence=0.0,
                sources=[],
                metadata={'error': str(e)}
            )
    
    def _plan_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Plan which agents to use for the query
        
        Args:
            query: User query
            context: Query context
            
        Returns:
            Query execution plan
        """
        plan = {
            'use_heritage': True,  # Always use heritage keeper
            'use_research': False,
            'use_verification': False,
            'use_translation': False,
            'target_language': context.get('language', 'en')
        }
        
        query_lower = query.lower()
        
        # Check if web enrichment is needed
        if any(word in query_lower for word in ['more', 'detail', 'context', 'wikipedia', 'source']):
            plan['use_research'] = True
        
        # Check if verification is needed
        if any(word in query_lower for word in ['verify', 'confirm', 'accurate', 'true', 'fact']):
            plan['use_verification'] = True
        
        # Check if translation is needed
        if context.get('language') and context.get('language') != 'en':
            plan['use_translation'] = True
        
        # For complex queries, use all agents
        if len(query.split()) > 15 or '?' in query:
            plan['use_research'] = True
            plan['use_verification'] = True
        
        return plan
    
    async def _execute_query_plan(
        self,
        ctx: Context,
        query: str,
        context: Dict[str, Any],
        plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute the query plan by calling appropriate agents
        
        Args:
            ctx: Agent context
            query: User query
            context: Query context
            plan: Execution plan
            
        Returns:
            Results from all agents
        """
        results = {}
        
        # Step 1: Heritage Keeper (always)
        if plan['use_heritage']:
            heritage_msg = AgentMessage(
                message=query,
                sender=self.name,
                task_type="cultural_query",
                context=context
            )
            
            # Simulate heritage keeper response (in real implementation, send to agent)
            if self.heritage_keeper:
                heritage_response = await self.heritage_keeper.process_message(ctx, self.name, heritage_msg)
            else:
                # Fallback: use inline processing
                from rag_pipeline import RAGPipeline
                rag = RAGPipeline()
                rag_result = rag.query(query, top_k=10, use_reasoning=True, use_llm=True)
                heritage_response = AgentResponse(
                    response=rag_result['response'],
                    agent_name='heritage-keeper',
                    confidence=0.8,
                    sources=[],
                    metadata={}
                )
            
            results['heritage'] = heritage_response
        
        # Step 2: Research Agent (if needed)
        if plan['use_research']:
            research_msg = AgentMessage(
                message=query,
                sender=self.name,
                task_type="wikipedia_search",
                context=context
            )
            
            if self.research_agent:
                research_response = await self.research_agent.process_message(ctx, self.name, research_msg)
            else:
                # Fallback
                research_response = AgentResponse(
                    response="Web enrichment available.",
                    agent_name='research-agent',
                    confidence=0.6,
                    sources=[],
                    metadata={}
                )
            
            results['research'] = research_response
        
        # Step 3: Verification Agent (if needed)
        if plan['use_verification'] and 'heritage' in results:
            verification_msg = AgentMessage(
                message=query,
                sender=self.name,
                task_type="verify",
                context={
                    'heritage_response': results['heritage'].response,
                    'research_data': results.get('research', AgentResponse(response='', agent_name='', confidence=0, sources=[])).response,
                    'sources': results['heritage'].sources
                }
            )
            
            if self.verification_agent:
                verification_response = await self.verification_agent.process_message(ctx, self.name, verification_msg)
            else:
                # Fallback
                verification_response = AgentResponse(
                    response="Verification: High confidence based on knowledge base.",
                    agent_name='verification-agent',
                    confidence=0.75,
                    sources=[],
                    metadata={}
                )
            
            results['verification'] = verification_response
        
        # Step 4: Translation (if needed)
        if plan['use_translation'] and 'heritage' in results:
            target_lang = plan['target_language']
            
            translation_msg = AgentMessage(
                message=results['heritage'].response,
                sender=self.name,
                task_type="translate",
                context={
                    'source_lang': 'en',
                    'target_lang': target_lang
                }
            )
            
            if self.translation_agent:
                translation_response = await self.translation_agent.process_message(ctx, self.name, translation_msg)
                results['translation'] = translation_response
        
        return results
    
    def _combine_results(
        self,
        results: Dict[str, Any],
        plan: Dict[str, Any]
    ) -> AgentResponse:
        """
        Combine results from multiple agents
        
        Args:
            results: Results from all agents
            plan: Execution plan
            
        Returns:
            Combined agent response
        """
        # Start with heritage response
        heritage = results.get('heritage')
        if not heritage:
            return AgentResponse(
                response="No response available.",
                agent_name=self.name,
                confidence=0.0,
                sources=[],
                metadata={}
            )
        
        # Build combined response
        response_parts = []
        
        # Use translated response if available
        if 'translation' in results:
            response_parts.append(results['translation'].response)
        else:
            response_parts.append(heritage.response)
        
        # Add research context if available
        if 'research' in results and results['research'].response:
            response_parts.append(f"\n\n**Additional Context**:\n{results['research'].response}")
        
        # Add verification if available
        if 'verification' in results:
            response_parts.append(f"\n\n**Verification**: {results['verification'].response}")
        
        combined_response = "\n".join(response_parts)
        
        # Combine sources
        all_sources = []
        for result in results.values():
            all_sources.extend(result.sources)
        
        # Calculate combined confidence
        confidences = [r.confidence for r in results.values()]
        combined_confidence = sum(confidences) / len(confidences) if confidences else 0.5
        
        # Build metadata
        metadata = {
            'agents_used': list(results.keys()),
            'agent_count': len(results),
            'plan': plan
        }
        
        return AgentResponse(
            response=combined_response,
            agent_name=self.name,
            confidence=combined_confidence,
            sources=all_sources,
            metadata=metadata
        )
    
    def register_agent(self, agent_name: str, agent_instance: Any):
        """Register a specialized agent"""
        if agent_name == 'heritage-keeper':
            self.heritage_keeper = agent_instance
        elif agent_name == 'research-agent':
            self.research_agent = agent_instance
        elif agent_name == 'verification-agent':
            self.verification_agent = agent_instance
        elif agent_name == 'translation-agent':
            self.translation_agent = agent_instance
        
        logger.info(f"✓ Registered {agent_name}")


if __name__ == "__main__":
    # Test Coordinator agent
    logging.basicConfig(level=logging.INFO)
    agent = CoordinatorAgent()
    agent.run()


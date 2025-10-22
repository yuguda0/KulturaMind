"""
Multi-Agent System for KulturaMind
Orchestrates multiple specialized agents for decentralized AGI
"""

import logging
import asyncio
from typing import Dict, Any, Optional
from agents.coordinator import CoordinatorAgent
from agents.heritage_keeper import HeritageKeeperAgent
from agents.research_agent import ResearchAgent
from agents.verification_agent import VerificationAgent
from agents.translation_agent import TranslationAgent
from agents.base_agent import AgentMessage, AgentResponse

logger = logging.getLogger(__name__)


class MultiAgentSystem:
    """
    Multi-Agent System for KulturaMind
    Manages and coordinates multiple specialized agents
    """
    
    def __init__(self):
        """Initialize multi-agent system"""
        logger.info("Initializing Multi-Agent System...")
        
        # Initialize coordinator
        self.coordinator = CoordinatorAgent()
        
        # Initialize specialized agents
        self.heritage_keeper = HeritageKeeperAgent()
        self.research_agent = ResearchAgent()
        self.verification_agent = VerificationAgent()
        self.translation_agent = TranslationAgent()
        
        # Register agents with coordinator
        self.coordinator.register_agent('heritage-keeper', self.heritage_keeper)
        self.coordinator.register_agent('research-agent', self.research_agent)
        self.coordinator.register_agent('verification-agent', self.verification_agent)
        self.coordinator.register_agent('translation-agent', self.translation_agent)
        
        logger.info("✓ Multi-Agent System initialized with 5 agents")
    
    async def process_query(
        self,
        query: str,
        language: str = 'en',
        use_research: bool = True,
        use_verification: bool = False,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process query through multi-agent system
        
        Args:
            query: User query
            language: Target language for response
            use_research: Whether to use research agent
            use_verification: Whether to use verification agent
            additional_context: Additional context (artifacts, etc.)
            
        Returns:
            Combined response from agents
        """
        try:
            # Build context
            context = additional_context or {}
            context['language'] = language
            
            # Override plan if specified
            if use_research:
                context['force_research'] = True
            if use_verification:
                context['force_verification'] = True
            
            # Create message for coordinator
            msg = AgentMessage(
                message=query,
                sender="api",
                task_type="user_query",
                context=context
            )
            
            # Process through coordinator
            # Note: In production, this would use actual agent messaging
            # For now, we'll call the coordinator's process_message directly
            response = await self.coordinator.process_message(
                ctx=None,  # Context not needed for direct call
                sender="api",
                msg=msg
            )
            
            return {
                'response': response.response,
                'confidence': response.confidence,
                'sources': response.sources,
                'metadata': response.metadata,
                'agents_used': response.metadata.get('agents_used', []),
                'agent_count': response.metadata.get('agent_count', 1)
            }
            
        except Exception as e:
            logger.error(f"Multi-agent system error: {e}")
            return {
                'response': f"Error processing query: {str(e)}",
                'confidence': 0.0,
                'sources': [],
                'metadata': {'error': str(e)},
                'agents_used': [],
                'agent_count': 0
            }
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get information about the multi-agent system"""
        return {
            'system': 'KulturaMind Multi-Agent System',
            'agents': {
                'coordinator': {
                    'name': 'Coordinator Agent',
                    'role': 'Multi-agent orchestration',
                    'port': 8000
                },
                'heritage_keeper': {
                    'name': 'Heritage Keeper Agent',
                    'role': 'Cultural knowledge base queries',
                    'port': 8001
                },
                'research': {
                    'name': 'Research Agent',
                    'role': 'Web enrichment and external data',
                    'port': 8002
                },
                'verification': {
                    'name': 'Verification Agent',
                    'role': 'Fact-checking and validation',
                    'port': 8003
                },
                'translation': {
                    'name': 'Translation Agent',
                    'role': 'Multilingual support',
                    'port': 8004,
                    'languages': self.translation_agent.get_supported_languages()
                }
            },
            'total_agents': 5,
            'architecture': 'Decentralized AGI with specialized agents'
        }
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages"""
        return self.translation_agent.get_supported_languages()


# Global instance
_multi_agent_system = None


def get_multi_agent_system() -> MultiAgentSystem:
    """Get or create multi-agent system instance"""
    global _multi_agent_system
    
    if _multi_agent_system is None:
        _multi_agent_system = MultiAgentSystem()
    
    return _multi_agent_system


if __name__ == "__main__":
    # Test multi-agent system
    logging.basicConfig(level=logging.INFO)
    
    async def test():
        system = MultiAgentSystem()
        
        # Test query
        result = await system.process_query(
            query="Tell me about the Sango Festival",
            language='en',
            use_research=True,
            use_verification=True
        )
        
        print("\n" + "="*70)
        print("MULTI-AGENT SYSTEM TEST")
        print("="*70)
        print(f"Response: {result['response'][:200]}...")
        print(f"Confidence: {result['confidence']:.2f}")
        print(f"Agents Used: {', '.join(result['agents_used'])}")
        print(f"Sources: {len(result['sources'])}")
        print("="*70)
        
        # System info
        info = system.get_system_info()
        print(f"\nSystem: {info['system']}")
        print(f"Total Agents: {info['total_agents']}")
        print("\nAgents:")
        for agent_id, agent_info in info['agents'].items():
            print(f"  - {agent_info['name']}: {agent_info['role']}")
    
    asyncio.run(test())


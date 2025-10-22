"""
Base Agent Class for KulturaMind Multi-Agent System
Provides common functionality for all specialized agents
"""

from uagents import Agent, Context, Model
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class AgentMessage(Model):
    """Standard message format for inter-agent communication"""
    message: str
    sender: str
    task_type: str
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class AgentResponse(Model):
    """Standard response format from agents"""
    response: str
    agent_name: str
    confidence: float
    sources: List[Dict[str, Any]] = []
    metadata: Optional[Dict[str, Any]] = None


class BaseKulturaAgent:
    """
    Base class for all KulturaMind agents
    Provides common functionality and interface
    """
    
    def __init__(self, name: str, port: int, seed: str):
        """
        Initialize base agent
        
        Args:
            name: Agent name
            port: Port number for agent
            seed: Seed phrase for agent identity
        """
        self.name = name
        self.agent = Agent(
            name=name,
            port=port,
            seed=seed,
            endpoint=[f"http://127.0.0.1:{port}/submit"]
        )
        
        # Register message handlers
        self._register_handlers()
        
        logger.info(f"✓ {name} initialized on port {port}")
    
    def _register_handlers(self):
        """Register message handlers - to be overridden by subclasses"""
        pass
    
    async def process_message(self, ctx: Context, sender: str, msg: AgentMessage) -> AgentResponse:
        """
        Process incoming message - to be overridden by subclasses
        
        Args:
            ctx: Agent context
            sender: Sender address
            msg: Incoming message
            
        Returns:
            Agent response
        """
        raise NotImplementedError("Subclasses must implement process_message")
    
    def run(self):
        """Run the agent"""
        self.agent.run()
    
    def get_address(self) -> str:
        """Get agent address"""
        return str(self.agent.address)

